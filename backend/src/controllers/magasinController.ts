import type { Request, Response } from 'express';
import { MagasinService } from '../services/magasinService.js';
import { logger } from '../config/logger.js';
import { PermissionService } from '../services/permissionService.js';
import { TenantUserRole, UserPermissionContext } from '../types/permissions.js';

/**
 * Récupère tous les magasins
 */
export const getAllMagasins = async (req: Request, res: Response) => {
  try {
    const magasinService = new MagasinService(req.tenantPrisma);
    
    // @ts-ignore
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    
    // Construire le contexte de permissions
    const context: UserPermissionContext = {
      userId: user.userId,
      role: user.role as TenantUserRole,
      isOwner: user.isOwner || false,
      globalScope: user.globalScope || false,
      magasinId: user.magasin_id,
      managedStoreIds: user.managedStoreIds || [],
      customPermissions: (user.customPermissions as string[]) || [],
    };

    const accessibleStoreIds = PermissionService.getAccessibleStoreIds(context);
    
    const magasins = await magasinService.getAll({
      est_actif: req.query.est_actif === 'false' ? false : undefined,
      ids: accessibleStoreIds === 'all' ? undefined : accessibleStoreIds
    });

    res.json({
      success: true,
      data: magasins,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des magasins:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des magasins',
    });
  }
};

/**
 * Récupère un magasin par ID
 */
export const getMagasinById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const magasinService = new MagasinService(req.tenantPrisma);
    
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Non authentifié' });

    const context: UserPermissionContext = {
      userId: user.userId,
      role: user.role as TenantUserRole,
      isOwner: user.isOwner || false,
      globalScope: user.globalScope || false,
      magasinId: user.magasin_id,
      managedStoreIds: user.managedStoreIds || [],
      customPermissions: (user.customPermissions as string[]) || [],
    };

    if (!PermissionService.canAccessStore(context, id)) {
      return res.status(403).json({ success: false, message: 'Accès refusé à cette boutique' });
    }

    const magasin = await magasinService.getById(id);

    res.json({
      success: true,
      data: magasin,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du magasin:', error);
    const status = error.message === 'Magasin non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du magasin',
    });
  }
};

/**
 * Crée un nouveau magasin
 */
export const createMagasin = async (req: Request, res: Response) => {
  try {
    const magasinService = new MagasinService(req.tenantPrisma);
    const magasin = await magasinService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Magasin créé avec succès',
      data: magasin,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création du magasin:', error);
    const status = error.message.includes('invalide') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création du magasin',
    });
  }
};

/**
 * Met à jour un magasin
 */
export const updateMagasin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const magasinService = new MagasinService(req.tenantPrisma);
    const magasin = await magasinService.update(id, req.body);

    res.json({
      success: true,
      message: 'Magasin mis à jour avec succès',
      data: magasin,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du magasin:', error);
    const status = error.message === 'Magasin non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du magasin',
    });
  }
};

/**
 * Supprime un magasin
 */
export const deleteMagasin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const magasinService = new MagasinService(req.tenantPrisma);
    const result = await magasinService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression du magasin:', error);
    const status = error.message === 'Magasin non trouvé' ? 404 :
                   error.message.includes('stock') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du magasin',
    });
  }
};

/**
 * Récupère le stock d'un magasin
 */
export const getMagasinStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const magasinService = new MagasinService(req.tenantPrisma);
    
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Non authentifié' });

    const context: UserPermissionContext = {
      userId: user.userId,
      role: user.role as TenantUserRole,
      isOwner: user.isOwner || false,
      globalScope: user.globalScope || false,
      magasinId: user.magasin_id,
      managedStoreIds: user.managedStoreIds || [],
      customPermissions: (user.customPermissions as string[]) || [],
    };

    if (!PermissionService.canAccessStore(context, id)) {
      return res.status(403).json({ success: false, message: 'Accès refusé à cette boutique' });
    }
    
    const stocks = await magasinService.getStock(id, {
      alertOnly: req.query.alerte === 'true',
      search: req.query.search as string
    });

    res.json({
      success: true,
      data: stocks,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du stock:', error);
    const status = error.message === 'Magasin non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du stock',
    });
  }
};

/**
 * Statistiques d'un magasin
 */
export const getMagasinStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const magasinService = new MagasinService(req.tenantPrisma);
    
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Non authentifié' });

    const context: UserPermissionContext = {
      userId: user.userId,
      role: user.role as TenantUserRole,
      isOwner: user.isOwner || false,
      globalScope: user.globalScope || false,
      magasinId: user.magasin_id,
      managedStoreIds: user.managedStoreIds || [],
      customPermissions: (user.customPermissions as string[]) || [],
    };

    if (!PermissionService.canAccessStore(context, id)) {
      return res.status(403).json({ success: false, message: 'Accès refusé à cette boutique' });
    }

    const stats = await magasinService.getStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    const status = error.message === 'Magasin non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques',
    });
  }
};
