import { Request, Response } from 'express';
import { logger } from '../config/logger.js';

// Interface pour la création/mise à jour de personnalisation
interface BadgeCustomizationData {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  isActive?: boolean;
}

// Obtenir la configuration de personnalisation du badge
export const getBadgeCustomization = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    // Connexion au schéma public pour récupérer la personnalisation
    const { prismaPublic } = await import('../services/tenantService.js');
    
    const customization = await prismaPublic.badgeCustomization.findUnique({
      where: { companyId: tenantId },
    });

    res.json({
      success: true,
      data: customization,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la personnalisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la personnalisation',
    });
  }
};

// Créer ou mettre à jour la configuration de personnalisation
export const upsertBadgeCustomization = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    const { backgroundColor, textColor, borderColor, isActive }: BadgeCustomizationData = req.body;

    // Validation basique des couleurs
    if (backgroundColor && !isValidColor(backgroundColor)) {
      return res.status(400).json({
        success: false,
        message: 'Format de couleur de fond invalide',
      });
    }

    if (textColor && !isValidColor(textColor)) {
      return res.status(400).json({
        success: false,
        message: 'Format de couleur de texte invalide',
      });
    }

    if (borderColor && !isValidColor(borderColor)) {
      return res.status(400).json({
        success: false,
        message: 'Format de couleur de bordure invalide',
      });
    }

    const { prismaPublic } = await import('../services/tenantService.js');

    // Upsert (create or update)
    const customization = await prismaPublic.badgeCustomization.upsert({
      where: { companyId: tenantId },
      update: {
        backgroundColor,
        textColor,
        borderColor,
        isActive,
      },
      create: {
        companyId: tenantId,
        backgroundColor: backgroundColor || '#3b82f6',
        textColor: textColor || '#ffffff',
        borderColor: borderColor || 'rgba(255, 255, 255, 0.6)',
        isActive: isActive ?? false,
      },
    });

    res.json({
      success: true,
      message: 'Personnalisation du badge enregistrée avec succès',
      data: customization,
    });
  } catch (error) {
    logger.error('Erreur lors de la sauvegarde de la personnalisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la sauvegarde de la personnalisation',
    });
  }
};

// Supprimer la personnalisation (retour aux badges prédéfinis)
export const deleteBadgeCustomization = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    const { prismaPublic } = await import('../services/tenantService.js');

    // Vérifier si la personnalisation existe
    const existing = await prismaPublic.badgeCustomization.findUnique({
      where: { companyId: tenantId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Aucune personnalisation trouvée',
      });
    }

    await prismaPublic.badgeCustomization.delete({
      where: { companyId: tenantId },
    });

    res.json({
      success: true,
      message: 'Personnalisation supprimée avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la personnalisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la personnalisation',
    });
  }
};

// Fonction utilitaire pour valider le format de couleur (hex ou rgba)
function isValidColor(color: string): boolean {
  // Validation hex (#RGB ou #RRGGBB)
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  // Validation rgba (rgba(r, g, b, a))
  const rgbaRegex = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0|1|0?\.\d+))?\s*\)$/;
  
  return hexRegex.test(color) || rgbaRegex.test(color);
}
