import type { Request, Response } from 'express';
import { CategorieService } from '../services/categorieService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère toutes les catégories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categorieService = new CategorieService(req.tenantPrisma);
    const categories = await categorieService.getAll();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des catégories',
    });
  }
};

/**
 * Récupère une catégorie par ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const categorieService = new CategorieService(req.tenantPrisma);
    const category = await categorieService.getById(id);

    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de la catégorie:', error);
    const status = error.message === 'Catégorie non trouvée' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la catégorie',
    });
  }
};

/**
 * Crée une nouvelle catégorie
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const categorieService = new CategorieService(req.tenantPrisma);
    const category = await categorieService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de la catégorie:', error);
    const status = error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la catégorie',
    });
  }
};

/**
 * Met à jour une catégorie
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const categorieService = new CategorieService(req.tenantPrisma);
    const category = await categorieService.update(id, req.body);

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour de la catégorie:', error);
    const status = error.message === 'Catégorie non trouvée' ? 404 :
                   error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la catégorie',
    });
  }
};

/**
 * Supprime une catégorie
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const categorieService = new CategorieService(req.tenantPrisma);
    const result = await categorieService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de la catégorie:', error);
    const status = error.message === 'Catégorie non trouvée' ? 404 :
                   error.message.includes('produits') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de la catégorie',
    });
  }
};
