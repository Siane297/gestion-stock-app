import type { Request, Response } from 'express';
import { FournisseurService } from '../services/fournisseurService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère tous les fournisseurs
 */
export const getAllFournisseurs = async (req: Request, res: Response) => {
  try {
    const fournisseurService = new FournisseurService(req.tenantPrisma);
    
    const fournisseurs = await fournisseurService.getAll({
      est_actif: req.query.est_actif === 'false' ? false : undefined,
      search: req.query.search as string
    });

    res.json({
      success: true,
      data: fournisseurs,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des fournisseurs',
    });
  }
};

/**
 * Récupère un fournisseur par ID
 */
export const getFournisseurById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const fournisseurService = new FournisseurService(req.tenantPrisma);
    const fournisseur = await fournisseurService.getById(id);

    res.json({
      success: true,
      data: fournisseur,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du fournisseur:', error);
    const status = error.message === 'Fournisseur non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du fournisseur',
    });
  }
};

/**
 * Crée un nouveau fournisseur
 */
export const createFournisseur = async (req: Request, res: Response) => {
  try {
    const fournisseurService = new FournisseurService(req.tenantPrisma);
    const fournisseur = await fournisseurService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Fournisseur créé avec succès',
      data: fournisseur,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création du fournisseur:', error);
    const status = error.message.includes('invalide') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création du fournisseur',
    });
  }
};

/**
 * Met à jour un fournisseur
 */
export const updateFournisseur = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const fournisseurService = new FournisseurService(req.tenantPrisma);
    const fournisseur = await fournisseurService.update(id, req.body);

    res.json({
      success: true,
      message: 'Fournisseur mis à jour avec succès',
      data: fournisseur,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du fournisseur:', error);
    const status = error.message === 'Fournisseur non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du fournisseur',
    });
  }
};

/**
 * Supprime un fournisseur
 */
export const deleteFournisseur = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const fournisseurService = new FournisseurService(req.tenantPrisma);
    const result = await fournisseurService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression du fournisseur:', error);
    const status = error.message === 'Fournisseur non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du fournisseur',
    });
  }
};

/**
 * Statistiques d'un fournisseur
 */
export const getFournisseurStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const fournisseurService = new FournisseurService(req.tenantPrisma);
    const stats = await fournisseurService.getStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques',
    });
  }
};
