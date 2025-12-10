import type { Request, Response } from 'express';
import { logger } from '../config/logger.js';

// Obtenir la configuration active
export const getConfigurationActive = async (req: Request, res: Response) => {
  try {
    const config = await req.tenantPrisma.configurationHoraire.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Aucune configuration horaire active trouvée',
      });
    }

    res.json({
      success: true,
      message: 'Configuration récupérée avec succès',
      data: config,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
    });
  }
};

// Obtenir toutes les configurations
export const getAllConfigurations = async (req: Request, res: Response) => {
  try {
    const configurations = await req.tenantPrisma.configurationHoraire.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Configurations récupérées avec succès',
      data: configurations,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des configurations',
    });
  }
};

// Créer une nouvelle configuration
export const createConfiguration = async (req: Request, res: Response) => {
  try {
    const {
      heureDebut,
      heureFin,
      heureDebutPause,
      heureFinPause,
      toleranceRetardMinutes = 30,
      description,
      isActive = false, // Par défaut, la config n'est PAS active
    } = req.body;

    // Validation du format HH:mm
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(heureDebut) || !timeRegex.test(heureFin)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'heure invalide. Utilisez le format HH:mm',
      });
    }
    
    // Validation des heures de pause si fournies
    if (heureDebutPause && !timeRegex.test(heureDebutPause)) {
      return res.status(400).json({
        success: false,
        message: 'Format heureDebutPause invalide. Utilisez le format HH:mm',
      });
    }
    if (heureFinPause && !timeRegex.test(heureFinPause)) {
      return res.status(400).json({
        success: false,
        message: 'Format heureFinPause invalide. Utilisez le format HH:mm',
      });
    }

    // Désactiver les autres configurations SEULEMENT si on active celle-ci
    if (isActive) {
      await req.tenantPrisma.configurationHoraire.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // Créer la nouvelle configuration
    const config = await req.tenantPrisma.configurationHoraire.create({
      data: {
        heureDebut,
        heureFin,
        heureDebutPause: heureDebutPause || null,
        heureFinPause: heureFinPause || null,
        // S'assurer que c'est un entier, sinon 0 par défaut
        toleranceRetardMinutes: toleranceRetardMinutes ? parseInt(String(toleranceRetardMinutes), 10) : 0,
        description,
        isActive: isActive,
      },
    });

    logger.info(`Configuration horaire créée: ${config.id} - Active: ${isActive}`);

    res.status(201).json({
      success: true,
      message: isActive ? 'Configuration créée et activée avec succès' : 'Configuration créée avec succès (non activée)',
      data: config,
    });
  } catch (error) {
    logger.error('Erreur lors de la création de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la configuration',
    });
  }
};

// Mettre à jour une configuration
export const updateConfiguration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      heureDebut,
      heureFin,
      heureDebutPause,
      heureFinPause,
      toleranceRetardMinutes,
      description,
      isActive,
    } = req.body;

    // Validation du format HH:mm si fourni
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (heureDebut && !timeRegex.test(heureDebut)) {
      return res.status(400).json({
        success: false,
        message: 'Format heureDebut invalide. Utilisez le format HH:mm',
      });
    }
    if (heureFin && !timeRegex.test(heureFin)) {
      return res.status(400).json({
        success: false,
        message: 'Format heureFin invalide. Utilisez le format HH:mm',
      });
    }
    if (heureDebutPause && !timeRegex.test(heureDebutPause)) {
      return res.status(400).json({
        success: false,
        message: 'Format heureDebutPause invalide. Utilisez le format HH:mm',
      });
    }
    if (heureFinPause && !timeRegex.test(heureFinPause)) {
      return res.status(400).json({
        success: false,
        message: 'Format heureFinPause invalide. Utilisez le format HH:mm',
      });
    }

    // Si on active cette configuration, désactiver les autres
    if (isActive === true) {
      await req.tenantPrisma.configurationHoraire.updateMany({
        where: { 
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    const config = await req.tenantPrisma.configurationHoraire.update({
      where: { id },
      data: {
        ...(heureDebut && { heureDebut }),
        ...(heureFin && { heureFin }),
        ...(heureDebutPause !== undefined && { heureDebutPause: heureDebutPause || null }),
        ...(heureFinPause !== undefined && { heureFinPause: heureFinPause || null }),
        ...(toleranceRetardMinutes !== undefined && { toleranceRetardMinutes }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    logger.info(`Configuration horaire mise à jour: ${id}`);

    res.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: config,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la configuration',
    });
  }
};

// Supprimer une configuration
export const deleteConfiguration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await req.tenantPrisma.configurationHoraire.delete({
      where: { id },
    });

    logger.info(`Configuration horaire supprimée: ${id}`);

    res.json({
      success: true,
      message: 'Configuration supprimée avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la configuration',
    });
  }
};
