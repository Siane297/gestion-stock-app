import type { Request, Response } from 'express';
import { InventaireService } from '../services/inventaireService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère tous les inventaires
 */
export const getAllInventaires = async (req: Request, res: Response) => {
  try {
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);
    
    const inventaires = await inventaireService.getAll({
      magasin_id: req.query.magasin_id as string,
      statut: req.query.statut as any,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
    });

    res.json({
      success: true,
      data: inventaires,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des inventaires:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des inventaires',
    });
  }
};

/**
 * Récupère un inventaire par ID
 */
export const getInventaireById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);
    const inventaire = await inventaireService.getById(id);

    res.json({
      success: true,
      data: inventaire,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'inventaire:', error);
    const status = error.message === 'Inventaire non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'inventaire',
    });
  }
};

/**
 * Crée un nouvel inventaire
 */
export const createInventaire = async (req: Request, res: Response) => {
  try {
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId;

    const inventaire = await inventaireService.create(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Inventaire créé avec succès',
      data: inventaire,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de l\'inventaire:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'inventaire',
    });
  }
};

/**
 * Démarre un inventaire (BROUILLON -> EN_COURS)
 */
export const startInventaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId;

    const inventaire = await inventaireService.start(id, userId);

    res.json({
      success: true,
      message: 'Inventaire démarré avec succès',
      data: inventaire,
    });
  } catch (error: any) {
    logger.error('Erreur lors du démarrage de l\'inventaire:', error);
    const status = error.message === 'Inventaire non trouvé' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors du démarrage de l\'inventaire',
    });
  }
};

/**
 * Met à jour le comptage d'un détail d'inventaire
 */
export const updateComptage = async (req: Request, res: Response) => {
  try {
    const { id, detailId } = req.params;
    if (!id || !detailId) {
      return res.status(400).json({ success: false, message: 'ID inventaire et détail requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);

    const detail = await inventaireService.updateComptage(id, detailId, req.body);

    res.json({
      success: true,
      message: 'Comptage enregistré',
      data: detail,
    });
  } catch (error: any) {
    logger.error('Erreur lors du comptage:', error);
    const status = error.message.includes('non trouvé') ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors du comptage',
    });
  }
};

/**
 * Finalise un inventaire (EN_COURS -> TERMINE)
 */
export const finalizeInventaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);

    const inventaire = await inventaireService.finalize(id);

    res.json({
      success: true,
      message: 'Inventaire finalisé avec succès',
      data: inventaire,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la finalisation de l\'inventaire:', error);
    const status = error.message === 'Inventaire non trouvé' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la finalisation de l\'inventaire',
    });
  }
};

/**
 * Valide un inventaire et ajuste les stocks (TERMINE -> VALIDE)
 */
export const validateInventaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId;

    const inventaire = await inventaireService.validate(id, userId);

    res.json({
      success: true,
      message: 'Inventaire validé. Les stocks ont été ajustés.',
      data: inventaire,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la validation de l\'inventaire:', error);
    const status = error.message === 'Inventaire non trouvé' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la validation de l\'inventaire',
    });
  }
};

/**
 * Supprime un inventaire (BROUILLON uniquement)
 */
export const deleteInventaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma, req.tenantSchema);

    await inventaireService.delete(id);

    res.json({
      success: true,
      message: 'Inventaire supprimé avec succès',
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de l\'inventaire:', error);
    const status = error.message === 'Inventaire non trouvé' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de l\'inventaire',
    });
  }
};

/**
 * Récupère les statistiques d'un inventaire
 */
export const getInventaireStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const inventaireService = new InventaireService(req.tenantPrisma);
    
    const stats = await inventaireService.getStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    const status = error.message === 'Inventaire non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques',
    });
  }
};
