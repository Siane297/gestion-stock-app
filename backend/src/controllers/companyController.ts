import { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { CloudinaryService } from '../services/CloudinaryService.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Helper pour supprimer un fichier local basé sur le publicId Cloudinary
 * Essaie de localiser et supprimer le fichier correspondant dans uploads/images
 */
const deleteLocalFile = async (publicId: string) => {
  try {
    // Extraire le nom de fichier du publicId
    // Format: "pointage/logos/Company-logo-123456" → "Company-logo-123456"
    const parts = publicId.split('/');
    const filePattern = parts[parts.length - 1]; // Dernier segment
    
    // Si pas de pattern valide, sortir
    if (!filePattern) return;
    
    // Construire le chemin vers le dossier uploads/images
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    
    // Lire tous les dossiers d'entreprise dans uploads/images
    const companyFolders = await fs.readdir(uploadsDir);
    
    // Parcourir chaque dossier d'entreprise
    for (const folder of companyFolders) {
      const folderPath = path.join(uploadsDir, folder);
      const stats = await fs.stat(folderPath);
      
      if (stats.isDirectory()) {
        // Lire les fichiers dans ce dossier
        const files = await fs.readdir(folderPath);
        
        // Chercher un fichier qui correspond au pattern
        const matchingFiles = files.filter(file => file.includes(filePattern));
        
        for (const file of matchingFiles) {
          const filePath = path.join(folderPath, file);
          await fs.unlink(filePath);
          console.log(`🗑️ [Local] Fichier supprimé: ${filePath}`);
        }
      }
    }
  } catch (error) {
    // Ne pas échouer si le fichier n'existe pas ou autre erreur
    console.log(`⚠️ [Local] Impossible de supprimer le fichier local:`, error);
  }
};

// Obtenir les informations de l'organisation courante
export const getCurrentCompany = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    // Connexion au schéma public pour récupérer les infos de la compagnie
    const { prismaPublic } = await import('../services/tenantService.js');
    
    const company = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        emailOrganisation: true,
        schemaName: true,
        address: true,
        country: true,
        telephoneOrganisation: true,
        logo: true,
        pdfHeader: true,
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'organisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'organisation',
    });
  }
};

// Mettre à jour les informations de l'organisation
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    const { name, emailOrganisation, address, country, telephoneOrganisation } = req.body;

    const { prismaPublic } = await import('../services/tenantService.js');

    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: {
        name,
        emailOrganisation,
        address,
        country,
        telephoneOrganisation,
      },
    });

    res.json({
      success: true,
      message: 'Organisation mise à jour avec succès',
      data: updatedCompany,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'organisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'organisation',
    });
  }
};

// Upload du logo de l'organisation (Cloudinary)
export const uploadCompanyLogo = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      });
    }

    const { prismaPublic } = await import('../services/tenantService.js');

    // Récupérer l'ancienne compagnie pour supprimer l'ancien logo
    const oldCompany = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { logo: true, name: true }
    });

    // Supprimer l'ancien logo de Cloudinary s'il existe
    if (oldCompany?.logo) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldCompany.logo);
        await CloudinaryService.deleteImage(publicId);
        // Supprimer aussi le fichier local
        await deleteLocalFile(publicId);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancien logo:', error);
      }
    }

    // Upload vers Cloudinary
    const companyName = oldCompany?.name || 'default';
    const publicId = `${companyName}-logo-${Date.now()}`;
    
    const result = await CloudinaryService.uploadImage(
      req.file.path,
      'logos',
      publicId
    );

    // Mettre à jour la base de données avec l'URL Cloudinary
    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: { logo: result.secure_url },
    });

    console.log(`✅ [Local] Fichier conservé en local: ${req.file.path}`);

    res.json({
      success: true,
      message: 'Logo uploadé avec succès',
      data: {
        logo: result.secure_url,
        company: updatedCompany,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de l\'upload du logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload du logo',
    });
  }
};

// Supprimer le logo de l'organisation (Cloudinary)
export const deleteCompanyLogo = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    const { prismaPublic } = await import('../services/tenantService.js');

    // Récupérer la compagnie pour obtenir l'URL du logo
    const company = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { logo: true }
    });

    if (! company?.logo) {
      return res.status(404).json({
        success: false,
        message: 'Aucun logo à supprimer',
      });
    }

    // Supprimer de Cloudinary
    const publicId = CloudinaryService.extractPublicId(company.logo);
    await CloudinaryService.deleteImage(publicId);
    // Supprimer aussi le fichier local
    await deleteLocalFile(publicId);

    // Mettre à jour la base de données
    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: { logo: null },
    });

    res.json({
      success: true,
      message: 'Logo supprimé avec succès',
      data: updatedCompany,
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du logo',
    });
  }
};

// Upload de l'en-tête PDF de l'organisation (Cloudinary)
export const uploadCompanyPdfHeader = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      });
    }

    const { prismaPublic } = await import('../services/tenantService.js');

    // Récupérer l'ancienne compagnie pour supprimer l'ancien en-tête
    const oldCompany = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { pdfHeader: true, name: true }
    });

    // Supprimer l'ancien en-tête de Cloudinary s'il existe
    if (oldCompany?.pdfHeader) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldCompany.pdfHeader);
        await CloudinaryService.deleteImage(publicId);
        // Supprimer aussi le fichier local
        await deleteLocalFile(publicId);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancien en-tête:', error);
      }
    }

    // Upload vers Cloudinary
    const companyName = oldCompany?.name || 'default';
    const publicId = `${companyName}-header-${Date.now()}`;
    
    const result = await CloudinaryService.uploadImage(
      req.file.path,
      'pdf-headers',
      publicId
    );

    // Mettre à jour la base de données avec l'URL Cloudinary
    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: { pdfHeader: result.secure_url },
    });

    console.log(`✅ [Local] Fichier conservé en local: ${req.file.path}`);

    res.json({
      success: true,
      message: 'En-tête PDF uploadé avec succès',
      data: {
        pdfHeader: result.secure_url,
        company: updatedCompany,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de l\'upload de l\'en-tête PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload de l\'en-tête PDF',
    });
  }
};

// Supprimer l'en-tête PDF de l'organisation (Cloudinary)
export const deleteCompanyPdfHeader = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    const { prismaPublic } = await import('../services/tenantService.js');

    // Récupérer la compagnie pour obtenir l'URL de l'en-tête
    const company = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { pdfHeader: true }
    });

    if (!company?.pdfHeader) {
      return res.status(404).json({
        success: false,
        message: 'Aucun en-tête PDF à supprimer',
      });
    }

    // Supprimer de Cloudinary
    const publicId = CloudinaryService.extractPublicId(company.pdfHeader);
    await CloudinaryService.deleteImage(publicId);
    // Supprimer aussi le fichier local
    await deleteLocalFile(publicId);

    // Mettre à jour la base de données
    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: { pdfHeader: null },
    });

    res.json({
      success: true,
      message: 'En-tête PDF supprimé avec succès',
      data: updatedCompany,
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'en-tête PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'en-tête PDF',
    });
  }
};
