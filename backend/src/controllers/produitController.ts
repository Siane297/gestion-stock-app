import type { Request, Response } from 'express';
import { ProduitService } from '../services/produitService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère tous les produits
 */
export const getAllProduits = async (req: Request, res: Response) => {
  try {
    const produitService = new ProduitService(req.tenantPrisma);
    
    const produits = await produitService.getAll({
      search: req.query.search as string,
      categorie_id: req.query.categorie_id as string,
      est_actif: req.query.est_actif === 'false' ? false : true
    });

    res.json({
      success: true,
      data: produits,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des produits',
    });
  }
};

/**
 * Récupère un produit par ID
 */
export const getProduitById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const produit = await produitService.getById(id);

    res.json({
      success: true,
      data: produit,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du produit:', error);
    const status = error.message === 'Produit non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du produit',
    });
  }
};

/**
 * Crée un nouveau produit
 */
export const createProduit = async (req: Request, res: Response) => {
  try {
    const produitService = new ProduitService(req.tenantPrisma);
    const produit = await produitService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: produit,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création du produit:', error);
    const status = error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création du produit',
    });
  }
};

/**
 * Met à jour un produit
 */
export const updateProduit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const produit = await produitService.update(id, req.body);

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: produit,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du produit:', error);
    const status = error.message === 'Produit non trouvé' ? 404 : 
                   error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du produit',
    });
  }
};

/**
 * Supprime un produit
 */
export const deleteProduit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const result = await produitService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression du produit:', error);
    const status = error.message === 'Produit non trouvé' ? 404 : 
                   error.message.includes('stock positif') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du produit',
    });
  }
};

/**
 * Récupère l'historique des prix
 */
export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const history = await produitService.getPriceHistory(id, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'historique des prix:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'historique des prix',
    });
  }
};
