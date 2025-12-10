import type { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { getBilansPresence, marquerAbsents } from '../services/bilanPresenceService.js';
import { estApresHeureFin } from '../services/horaireService.js';
import { getTodayDateRange } from '../utils/dateUtils.js';

/**
 * Obtenir l'historique des bilans de présence
 */
export const getHistorique = async (req: Request, res: Response) => {
  try {
    const { 
      startDate,
      endDate,
      employeeId,
      statut
    } = req.query;

    // Marquer automatiquement les absents pour aujourd'hui si on est après l'heure de fin
    const apresHeureFin = await estApresHeureFin(req.tenantPrisma, req.companyCountry);
    if (apresHeureFin) {
      const nombreAbsents = await marquerAbsents(req.tenantPrisma, undefined, req.companyCountry || 'Kenya');
      if (nombreAbsents > 0) {
        logger.info(`Marquage automatique aujourd'hui: ${nombreAbsents} employé(s) absent(s)`);
      }
    }

    // Construire l'objet filters en omettant les propriétés undefined
    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (employeeId) filters.employeeId = employeeId as string;
    if (statut) filters.statut = statut as string;

    const bilans = await getBilansPresence(req.tenantPrisma, filters);

    logger.info(`Bilans récupérés: ${bilans.length} bilan(s) trouvé(s)`);

    res.json({
      success: true,
      message: 'Historique récupéré avec succès',
      data: bilans,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
    });
  }
};

/**
 * Marquer manuellement les absents
 */
export const marquerAbsentsManuel = async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    const dateRecherche = date ? new Date(date) : new Date();
    
    const nombreAbsents = await marquerAbsents(req.tenantPrisma, dateRecherche, req.companyCountry || 'Kenya');

    logger.info(`${nombreAbsents} employé(s) marqué(s) comme absents`);

    res.json({
      success: true,
      message: `${nombreAbsents} employé(s) marqué(s) comme absents`,
      data: {
        date: dateRecherche,
        nombreAbsents,
      },
    });
  } catch (error) {
    logger.error('Erreur lors du marquage des absents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des absents',
    });
  }
};
