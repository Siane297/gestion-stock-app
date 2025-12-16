import type { Request, Response } from 'express';
import { UniteService } from '../services/uniteService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère toutes les unités
 */
export const getAllUnites = async (req: Request, res: Response) => {
  try {
    const uniteService = new UniteService(req.tenantPrisma);
    const unites = await uniteService.getAll();

    res.json({
      success: true,
      data: unites,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des unités:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des unités',
    });
  }
};

/**
 * Récupère une unité par ID
 */
export const getUniteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const uniteService = new UniteService(req.tenantPrisma);
    const unite = await uniteService.getById(id);

    res.json({
      success: true,
      data: unite,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'unité:', error);
    const status = error.message === 'Unité non trouvée' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'unité',
    });
  }
};

/**
 * Crée une nouvelle unité
 */
export const createUnite = async (req: Request, res: Response) => {
  try {
    const uniteService = new UniteService(req.tenantPrisma);
    const unite = await uniteService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Unité créée avec succès',
      data: unite,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de l\'unité:', error);
    const status = error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'unité',
    });
  }
};

/**
 * Met à jour une unité
 */
export const updateUnite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const uniteService = new UniteService(req.tenantPrisma);
    const unite = await uniteService.update(id, req.body);

    res.json({
      success: true,
      message: 'Unité mise à jour avec succès',
      data: unite,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour de l\'unité:', error);
    const status = error.message === 'Unité non trouvée' ? 404 :
                   error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de l\'unité',
    });
  }
};

/**
 * Supprime une unité
 */
export const deleteUnite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const uniteService = new UniteService(req.tenantPrisma);
    const result = await uniteService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de l\'unité:', error);
    const status = error.message === 'Unité non trouvée' ? 404 :
                   error.message.includes('utilisée') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de l\'unité',
    });
  }
};
