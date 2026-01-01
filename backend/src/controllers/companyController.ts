import { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { CompanyService } from '../services/companyService.js';

const companyService = new CompanyService();

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

    const company = await companyService.getById(tenantId);

    res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'organisation:', error);
    const status = error.message === 'Organisation non trouvée' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la récupération de l\'organisation',
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

    const updatedCompany = await companyService.update(tenantId, req.body);

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

    const result = await companyService.uploadLogo(tenantId, req.file);

    res.json({
      success: true,
      message: 'Logo uploadé avec succès',
      data: result,
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

    const updatedCompany = await companyService.deleteLogo(tenantId);

    res.json({
      success: true,
      message: 'Logo supprimé avec succès',
      data: updatedCompany,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression du logo:', error);
    const status = error.message === 'Aucun logo à supprimer' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la suppression du logo',
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

    const result = await companyService.uploadPdfHeader(tenantId, req.file);

    res.json({
      success: true,
      message: 'En-tête PDF uploadé avec succès',
      data: result,
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

    const updatedCompany = await companyService.deletePdfHeader(tenantId);

    res.json({
      success: true,
      message: 'En-tête PDF supprimé avec succès',
      data: updatedCompany,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de l\'en-tête PDF:', error);
    const status = error.message === 'Aucun en-tête PDF à supprimer' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur serveur lors de la suppression de l\'en-tête PDF',
    });
  }
};
