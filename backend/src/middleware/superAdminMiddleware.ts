import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour vérifier que l'utilisateur demandeur est un SUPER_ADMIN
 * Seuls les utilisateurs SUPER_ADMIN peuvent accéder aux endpoints de gestion des organisations
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // @ts-ignore - req.user est défini par authMiddleware
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Vérifier si l'utilisateur a le rôle SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      res.status(403).json({ 
        message: 'Accès refusé. Seuls les super administrateurs peuvent accéder à cette ressource.' 
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Erreur dans requireSuperAdmin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
