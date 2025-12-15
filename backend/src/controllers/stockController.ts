import type { Request, Response } from 'express';
import { StockService } from '../services/stockService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère tous les stocks avec filtres
 */
export const getStocks = async (req: Request, res: Response) => {
  try {
    const stockService = new StockService(req.tenantPrisma);
    
    const stocks = await stockService.getStocksWithAlerts({
      magasin_id: req.query.magasin_id as string,
      produit_id: req.query.produit_id as string,
      alertOnly: req.query.alerte === 'true'
    });

    res.json({
      success: true,
      data: stocks,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des stocks:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des stocks',
    });
  }
};

/**
 * Crée un mouvement de stock
 */
export const createMouvement = async (req: Request, res: Response) => {
  try {
    const stockService = new StockService(req.tenantPrisma);
    const userId = (req as any).user?.userId;
    
    const { magasin_id, produit_id, type, quantite, raison, vente_id, achat_id, numero_lot, date_peremption, magasin_dest_id } = req.body;

    const result = await stockService.createMouvement({
      magasin_id,
      produit_id,
      type,
      quantite: parseInt(quantite),
      utilisateur_id: userId,
      raison,
      vente_id,
      achat_id,
      numero_lot,
      date_peremption: date_peremption ? new Date(date_peremption) : undefined,
      magasin_dest_id // Pass the destination store ID
    });

    res.status(201).json({
      success: true,
      message: 'Mouvement créé avec succès',
      data: result,
    });
  } catch (error: any) {
    logger.error('Erreur lors du mouvement de stock:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du mouvement de stock',
    });
  }
};

/**
 * Récupère l'historique des mouvements
 */
export const getMouvements = async (req: Request, res: Response) => {
  try {
    const stockService = new StockService(req.tenantPrisma);
    
    const mouvements = await stockService.getMouvements({
      magasin_id: req.query.magasin_id as string,
      produit_id: req.query.produit_id as string,
      type: req.query.type as any,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    });

    res.json({
      success: true,
      data: mouvements,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des mouvements:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des mouvements',
    });
  }
};

/**
 * Définit le seuil minimum de stock
 */
export const setMinimumStock = async (req: Request, res: Response) => {
  try {
    const stockService = new StockService(req.tenantPrisma);
    const { magasin_id, produit_id, quantite_minimum } = req.body;

    const result = await stockService.setMinimumStock(
      magasin_id,
      produit_id,
      parseInt(quantite_minimum)
    );

    res.json({
      success: true,
      message: 'Seuil minimum défini avec succès',
      data: result,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la définition du seuil minimum:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la définition du seuil minimum',
    });
  }
};

/**
 * Récupère le stock total d'un produit
 */
export const getTotalStock = async (req: Request, res: Response) => {
  try {
    const { produit_id } = req.params;
    if (!produit_id) {
      return res.status(400).json({ success: false, message: 'produit_id requis' });
    }
    const stockService = new StockService(req.tenantPrisma);

    const total = await stockService.getTotalStock(produit_id);

    res.json({
      success: true,
      data: { produit_id, total },
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du stock total:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du stock total',
    });
  }
};
