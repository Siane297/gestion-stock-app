import { PrismaClient } from '@prisma/client';
import { prismaPublic } from './tenantService.js';
import { logger } from '../config/logger.js';
import { CloudinaryService } from './CloudinaryService.js';
import fs from 'fs/promises';
import path from 'path';

export class CompanyService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaPublic;
  }

  /**
   * Helper pour supprimer un fichier local basé sur le publicId Cloudinary
   */
  private async deleteLocalFile(publicId: string) {
    try {
      const parts = publicId.split('/');
      const filePattern = parts[parts.length - 1];
      
      if (!filePattern) return;
      
      const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
      
      // Vérifier si le dossier existe avant de le lire
      try {
        await fs.access(uploadsDir);
      } catch {
        return; // Le dossier n'existe pas, rien à faire
      }

      const companyFolders = await fs.readdir(uploadsDir);
      
      for (const folder of companyFolders) {
        const folderPath = path.join(uploadsDir, folder);
        const stats = await fs.stat(folderPath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(folderPath);
          const matchingFiles = files.filter(file => file.includes(filePattern));
          
          for (const file of matchingFiles) {
            const filePath = path.join(folderPath, file);
            await fs.unlink(filePath);
            console.log(`🗑️ [Local] Fichier supprimé: ${filePath}`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ [Local] Impossible de supprimer le fichier local:`, error);
    }
  }

  async getById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
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
        currency: true,
      }
    });

    if (!company) {
      throw new Error('Organisation non trouvée');
    }

    return company;
  }

  async update(id: string, data: any, files?: { logo?: Express.Multer.File; pdfHeader?: Express.Multer.File }) {
    const { name, emailOrganisation, address, country, telephoneOrganisation } = data;

    // 1. Obtenir les infos actuelles pour le nom (utilisé dans l'ID public Cloudinary) et les anciens fichiers
    const current = await this.prisma.company.findUnique({
      where: { id },
      select: { name: true, logo: true, pdfHeader: true }
    });

    // 2. Mise à jour des données textuelles
    await this.prisma.company.update({
      where: { id },
      data: {
        name,
        emailOrganisation,
        address,
        country,
        telephoneOrganisation,
      },
    });

    const companyName = name || current?.name || 'default';

    // 3. Gestion du Logo si fourni
    if (files?.logo) {
      await this.processLogoUpload(id, companyName, files.logo, current?.logo);
    } else if (data.deleteLogo === 'true' || data.deleteLogo === true) {
      await this.deleteLogo(id);
    }

    // 4. Gestion de l'en-tête PDF si fourni
    if (files?.pdfHeader) {
      await this.processPdfHeaderUpload(id, companyName, files.pdfHeader, current?.pdfHeader);
    } else if (data.deletePdfHeader === 'true' || data.deletePdfHeader === true) {
      await this.deletePdfHeader(id);
    }

    return await this.getById(id);
  }

  /**
   * Logique partagée pour l'upload du logo
   */
  private async processLogoUpload(id: string, companyName: string, file: Express.Multer.File, oldLogoUrl?: string | null) {
    if (oldLogoUrl) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldLogoUrl);
        await CloudinaryService.deleteImage(publicId);
        await this.deleteLocalFile(publicId);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancien logo:', error);
      }
    }

    const publicId = `${companyName}-logo-${Date.now()}`;
    const result = await CloudinaryService.uploadImage(file.path, 'logos', publicId);

    await this.prisma.company.update({
      where: { id },
      data: { logo: result.secure_url },
    });

    // NETTOYAGE : Supprimer le fichier temporaire
    try {
      await fs.unlink(file.path);
      console.log(`🗑️ [PDF] Fichier temporaire supprimé après upload: ${file.path}`);
    } catch (e) {
      console.error(`❌ [PDF] Erreur suppression temporaire ${file.path}:`, e);
    }

    return result.secure_url;
  }

  /**
   * Logique partagée pour l'upload de l'en-tête PDF
   */
  private async processPdfHeaderUpload(id: string, companyName: string, file: Express.Multer.File, oldHeaderUrl?: string | null) {
    if (oldHeaderUrl) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldHeaderUrl);
        await CloudinaryService.deleteImage(publicId);
        await this.deleteLocalFile(publicId);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancien en-tête:', error);
      }
    }

    const publicId = `${companyName}-header-${Date.now()}`;
    const result = await CloudinaryService.uploadImage(file.path, 'pdf-headers', publicId);

    await this.prisma.company.update({
      where: { id },
      data: { pdfHeader: result.secure_url },
    });

    // NETTOYAGE : Supprimer le fichier temporaire
    try {
      await fs.unlink(file.path);
      console.log(`🗑️ [PDF] Fichier temporaire supprimé après upload: ${file.path}`);
    } catch (e) {
      console.error(`❌ [PDF] Erreur suppression temporaire ${file.path}:`, e);
    }

    return result.secure_url;
  }

  async uploadLogo(id: string, file: Express.Multer.File) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { logo: true, name: true }
    });

    const logoUrl = await this.processLogoUpload(id, company?.name || 'default', file, company?.logo);

    return {
      logo: logoUrl,
      company: await this.getById(id),
    };
  }

  async deleteLogo(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { logo: true }
    });

    if (!company?.logo) {
      throw new Error('Aucun logo à supprimer');
    }

    const publicId = CloudinaryService.extractPublicId(company.logo);
    await CloudinaryService.deleteImage(publicId);
    await this.deleteLocalFile(publicId);

    return await this.prisma.company.update({
      where: { id },
      data: { logo: null },
    });
  }

  async uploadPdfHeader(id: string, file: Express.Multer.File) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { pdfHeader: true, name: true }
    });

    const headerUrl = await this.processPdfHeaderUpload(id, company?.name || 'default', file, company?.pdfHeader);

    return {
      pdfHeader: headerUrl,
      company: await this.getById(id),
    };
  }

  async deletePdfHeader(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { pdfHeader: true }
    });

    if (!company?.pdfHeader) {
      throw new Error('Aucun en-tête PDF à supprimer');
    }

    const publicId = CloudinaryService.extractPublicId(company.pdfHeader);
    await CloudinaryService.deleteImage(publicId);
    await this.deleteLocalFile(publicId);

    return await this.prisma.company.update({
      where: { id },
      data: { pdfHeader: null },
    });
  }
}
