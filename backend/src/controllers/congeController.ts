import type { Request, Response } from 'express';
import {
  creerConge,
  mettreAJourStatutConge,
  obtenirCongesEmploye,
  obtenirCongesParPeriode,
  obtenirTypesConges,
  annulerConge,
} from '../services/congeService.js';
import { logger } from '../config/logger.js';
import { normalizeCalendarDate } from '../utils/dateUtils.js';

/**
 * Créer une demande de congé
 */
export const creerDemandeConge = async (req: Request, res: Response) => {
  try {
    const { employeId, typeCongeId, dateDebut, dateFin, raison, documentUrl } = req.body;

    // Validation
    if (!employeId || !typeCongeId || !dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être fournis',
      });
    }

    const conge = await creerConge(req.tenantPrisma, {
      employeId,
      typeCongeId,
      dateDebut: normalizeCalendarDate(dateDebut),
      dateFin: normalizeCalendarDate(dateFin),
      raison,
      documentUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Demande de congé créée avec succès',
      data: conge,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de la demande de congé:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la demande de congé',
    });
  }
};

/**
 * Mettre à jour le statut d'un congé (approuver/refuser)
 */
export const modifierStatutConge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID du congé requis',
      });
    }

    if (!['APPROUVE', 'REFUSE', 'ANNULE'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
      });
    }

    const conge = await mettreAJourStatutConge(req.tenantPrisma, id, statut);

    res.json({
      success: true,
      message: `Congé ${statut.toLowerCase()} avec succès`,
      data: conge,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la modification du statut:', error);
    res.status(500).json({
      success: false,
      message:error.message || 'Erreur lors de la modification du statut',
    });
  }
};

/**
 * Obtenir les congés d'un employé
 */
export const obtenirCongesEmployeController = async (req: Request, res: Response) => {
  try {
    const { employeId } = req.params;
    const { statut, dateDebut, dateFin } = req.query;

    if (!employeId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'employé requis',
      });
    }

    const conges = await obtenirCongesEmploye(req.tenantPrisma, employeId, {
      statut: statut ? String(statut) : undefined,
      dateDebut: dateDebut ? normalizeCalendarDate(String(dateDebut)) : undefined,
      dateFin: dateFin ? normalizeCalendarDate(String(dateFin)) : undefined,
    });

    res.json({
      success: true,
      message: 'Congés récupérés avec succès',
      data: conges,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des congés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des congés',
    });
  }
};

/**
 * Obtenir tous les congés dans une période
 */
export const obtenirCongesParPeriodeController = async (req: Request, res: Response) => {
  try {
    const { dateDebut, dateFin, statut, employeId } = req.query;

    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et fin sont obligatoires',
      });
    }

    const conges = await obtenirCongesParPeriode(
      req.tenantPrisma,
      normalizeCalendarDate(dateDebut as string),
      normalizeCalendarDate(dateFin as string),
      {
        statut: statut ? String(statut) : undefined,
        employeId: employeId ? String(employeId) : undefined,
      }
    );

    res.json({
      success: true,
      message: 'Congés récupérés avec succès',
      data: conges,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des congés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des congés',
    });
  }
};

/**
 * Obtenir les types de congés
 */
export const obtenirTypesCongesController = async (req: Request, res: Response) => {
  try {
    const types = await obtenirTypesConges(req.tenantPrisma);

    res.json({
      success: true,
      message: 'Types de congés récupérés avec succès',
      data: types,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des types de congés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types de congés',
    });
  }
};

/**
 * Annuler un congé
 */
export const annulerCongeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID du congé requis',
      });
    }

    const conge = await annulerConge(req.tenantPrisma, id);

    res.json({
      success: true,
      message: 'Congé annulé avec succès',
      data: conge,
    });
  } catch (error: any) {
    logger.error('Erreur lors de l\'annulation du congé:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'annulation du congé',
    });
  }
};
