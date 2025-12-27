import type { Request, Response } from 'express';
import { AchatService } from '../services/achatService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère tous les achats
 */
export const getAllAchats = async (req: Request, res: Response) => {
  try {
    const achatService = new AchatService(req.tenantPrisma, req.tenantSchema);
    const filters: any = {};
    const user = req.user;

    // Restriction par défaut pour les non-admins
    if (user?.role !== 'ADMIN') {
        // Récupérer l'utilisateur complet pour avoir son magasin assigné
        // Note: Idéalement le magasin_id devrait être dans le token pour éviter cette requête
        const tenantUser = await req.tenantPrisma.tenantUser.findUnique({
            where: { id: user?.userId }, // userId dans le token correspond à l'ID TenantUser (ou employeeId selon auth)
            select: { magasin_id: true }
        });

        if (!tenantUser?.magasin_id) {
            // Si pas de magasin assigné, l'utilisateur ne doit rien voir (ou gérer cas erreur)
            return res.json({ success: true, data: [] });
        }
        filters.magasin_id = tenantUser.magasin_id;
    } else {
        // Pour ADMIN : Filtre optionnel
        if (req.query.magasin_id) {
            filters.magasin_id = req.query.magasin_id as string;
        }
    }

    const achats = await achatService.getAll(filters);

    res.json({
      success: true,
      data: achats,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des achats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des achats',
    });
  }
};

/**
 * Récupère un achat par ID
 */
export const getAchatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const achatService = new AchatService(req.tenantPrisma, req.tenantSchema);
    const achat = await achatService.getById(id);

    res.json({
      success: true,
      data: achat,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'achat:', error);
    const status = error.message === 'Achat non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'achat',
    });
  }
};

/**
 * Crée un nouvel achat
 */
export const createAchat = async (req: Request, res: Response) => {
  try {
    const achatService = new AchatService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId || (req as any).userId;
    const achat = await achatService.create({
      ...req.body,
      utilisateur_id: userId
    });

    res.status(201).json({
      success: true,
      message: 'Achat créé avec succès',
      data: achat,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de l\'achat:', error);
    const status = error.message.includes('obligatoire') || 
                   error.message.includes('incomplètes') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'achat',
    });
  }
};

/**
 * Met à jour un achat (général)
 */
export const updateAchat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const achatService = new AchatService(req.tenantPrisma, req.tenantSchema);
    const result = await achatService.update(id, req.body);

    res.json({
      success: true,
      message: 'Achat mis à jour',
      data: result,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour de l\'achat:', error);
    const status = error.message === 'Achat non trouvé' ? 404 : 
                   error.message.includes('Impossible de modifier') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour',
    });
  }
};

/**
 * Met à jour le statut d'un achat (réception)
 */
export const updateAchatStatut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const achatService = new AchatService(req.tenantPrisma, req.tenantSchema);
    const userId = (req as any).user?.userId;

    const result = await achatService.updateStatut(id, {
      statut: req.body.statut,
      utilisateur_id: userId
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du statut achat:', error);
    const status = error.message === 'Achat non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du statut',
    });
  }
};

/**
 * Supprime un achat
 */
export const deleteAchat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const achatService = new AchatService(req.tenantPrisma, req.tenantSchema);
    const result = await achatService.delete(id);

    res.json(result);
  } catch (error: any) {
    logger.error('Erreur suppression achat:', error);
    const status = error.message === 'Achat non trouvé' ? 404 : 
                   error.message.includes('déjà reçue') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur suppression achat',
    });
  }
};

/**
 * Annule un achat
 */
export const cancelAchat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const achatService = new AchatService(req.tenantPrisma);
    const userId = (req as any).user?.userId;

    const result = await achatService.cancel(id, userId);

    res.json(result);
  } catch (error: any) {
    logger.error('Erreur annulation achat:', error);
    const status = error.message === 'Achat non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur annulation achat',
    });
  }
};
