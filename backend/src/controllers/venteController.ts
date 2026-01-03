import type { Request, Response } from 'express';
import { VenteService } from '../services/venteService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère toutes les ventes
 */
export const getAllVentes = async (req: Request, res: Response) => {
  try {
    const venteService = new VenteService(req.tenantPrisma, req.tenantSchema);
    
    const ventes = await venteService.getAll({
      magasin_id: req.query.magasin_id as string,
      client_id: req.query.client_id as string,
      utilisateur_id: req.query.utilisateur_id as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
    });

    res.json({
      success: true,
      data: ventes,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des ventes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des ventes',
    });
  }
};

/**
 * Récupère une vente par ID
 */
export const getVenteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const venteService = new VenteService(req.tenantPrisma, req.tenantSchema);
    const vente = await venteService.getById(id);

    res.json({
      success: true,
      data: vente,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de la vente:', error);
    const status = error.message === 'Vente non trouvée' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la vente',
    });
  }
};

/**
 * Crée une nouvelle vente
 */
export const createVente = async (req: Request, res: Response) => {
  try {
    const venteService = new VenteService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId;

    const vente = await venteService.create({
      ...req.body,
      utilisateur_id: userId || req.body.utilisateur_id
    });

    res.status(201).json({
      success: true,
      message: 'Vente effectuée avec succès',
      data: vente,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de la vente:', error);
    const status = error.message.includes('Stock insuffisant') || 
                   error.message.includes('obligatoire') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la vente',
    });
  }
};

/**
 * Met à jour le statut d'une vente
 */
export const updateVenteStatut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const venteService = new VenteService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId;

    const result = await venteService.updateStatut(id, {
      statut: req.body.statut,
      utilisateur_id: userId,
      returnedItems: req.body.returnedItems
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour de la vente:', error);
    const status = error.message === 'Vente non trouvée' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur update vente',
    });
  }
};

/**
 * Statistiques des ventes
 */
export const getVenteStats = async (req: Request, res: Response) => {
  try {
    const venteService = new VenteService(req.tenantPrisma);
    
    const stats = await venteService.getStats({
      magasin_id: req.query.magasin_id as string,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
    });

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
