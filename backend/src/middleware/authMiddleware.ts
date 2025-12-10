import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt.js';

// Étendre le type Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      companyName?: string;
    }
  }
}

/**
 * Middleware d'authentification JWT
 * Vérifie l'access token dans le header Authorization
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer l'access token depuis le header Authorization (priorité)
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('[⚡ AUTH] Cookies présents:', Object.keys(req.cookies || {}).length);
    //   console.log('[⚡ AUTH] Token cookie présent:', !!req.cookies?.refresh_token);
    //   console.log('[⚡ AUTH] Token Authorization header présent:', !!token);
    // }

    // Fallback: chercher l'ancien cookie auth_token pour compatibilité
    if (!token) {
      token = req.cookies?.auth_token;
    }

    if (!token) {
      // console.log('[❌ AUTH] Aucun token trouvé (ni cookie ni header)');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié - Token manquant',
      });
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('[⚡ AUTH] Token décodé:', decoded ? `User ${decoded.userId}` : 'INVALIDE');
    // }

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié - Token invalide',
      });
    }

    // Attacher les données utilisateur à la requête
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification',
    });
  }
};

/**
 * Middleware pour vérifier le rôle admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Droits administrateur requis',
    });
  }
  next();
};
