import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permissionService.js';
import { Module, Action, UserPermissionContext, TenantUserRole } from '../types/permissions.js';

/**
 * Middleware pour vérifier qu'un utilisateur a une permission spécifique
 * Usage: requirePermission(Module.PRODUCTS, Action.CREATE)
 */
export const requirePermission = (module: Module, action: Action) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - req.user est ajouté par le middleware d'authentification
      const user = req.user;
      // @ts-ignore - req.tenantPrisma ajouté par tenantMiddleware
      const tenantPrisma = req.tenantPrisma;

      if (!user || !tenantPrisma) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
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

      // Vérifier la permission
      const result = PermissionService.hasPermission(context, module, action);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          message: result.reason || 'Permission refusée',
        });
      }

      next();
    } catch (error) {
      console.error('[ERROR] Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions',
      });
    }
  };
};

/**
 * Middleware pour vérifier qu'un utilisateur a l'un des rôles spécifiés
 * Usage: requireRole('ADMIN', 'STORE_MANAGER')
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Rôle insuffisant. Rôles requis: ${roles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('[ERROR] Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du rôle',
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès à une boutique spécifique
 * Vérifie dans req.params.magasinId, req.query.magasin_id ou req.body.magasin_id
 */
export const requireStoreAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    // Récupérer l'ID de la boutique depuis différentes sources
    const storeId =
      req.params.magasinId ||
      (req.query.magasin_id as string) ||
      req.body.magasin_id;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'ID de boutique manquant',
      });
    }

    // Construire le contexte
    const context: UserPermissionContext = {
      userId: user.userId,
      role: user.role as TenantUserRole,
      isOwner: user.isOwner || false,
      globalScope: user.globalScope || false,
      magasinId: user.magasin_id,
      managedStoreIds: user.managedStoreIds || [],
      customPermissions: (user.customPermissions as string[]) || [],
    };

    // Vérifier l'accès
    if (!PermissionService.canAccessStore(context, storeId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé à cette boutique',
      });
    }

    next();
  } catch (error) {
    console.error('[ERROR] Store access middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'accès boutique',
    });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est admin ou propriétaire
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (user.role !== 'ADMIN' && !user.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Accès administrateur requis',
      });
    }

    next();
  } catch (error) {
    console.error('[ERROR] Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification admin',
    });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est gérant (ADMIN ou STORE_MANAGER)
 */
export const requireManager = (req: Request, res: Response, next :NextFunction) => {
  try {
    // @ts-ignore
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (!PermissionService.isManagerRole(user.role as TenantUserRole) && !user.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Accès gérant requis',
      });
    }

    next();
  } catch (error) {
    console.error('[ERROR] Manager middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification gérant',
    });
  }
};
