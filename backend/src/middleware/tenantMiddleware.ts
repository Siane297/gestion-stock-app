import type { Request, Response, NextFunction } from 'express';
import { getTenantConnection, prismaPublic } from '../services/tenantService.js';
import { logger } from '../config/logger.js';
import jwt from 'jsonwebtoken';

// Étendre le type Request pour inclure les données du tenant
declare global {
  namespace Express {
    interface Request {
      tenantPrisma?: any; // Connexion Prisma du tenant
      tenantSchema?: string; // Nom du schéma tenant
      companyId?: string; // ID de l'organisation
      companyCountry?: string; // Pays de l'organisation (pour timezone)
      userId?: string; // ID de l'utilisateur (depuis JWT)
      userRole?: string; // Rôle de l'utilisateur
    }
  }
}

/**
 * Middleware pour identifier et connecter au tenant approprié
 * Extrait le tenant depuis le JWT de l'utilisateur
 */
export const identifyTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token JWT depuis le header Authorization (nouveau système)
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback vers les anciens cookies pour compatibilité
    if (!token) {
      token = req.cookies?.auth_token;
    }
    
    logger.debug('[TENANT] Headers reçus:', {
      authorization: authHeader ? 'Bearer ***' : 'absent',
      'x-tenant-id': req.headers['x-tenant-id'],
      cookies: Object.keys(req.cookies || {}),
    });
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }
    
    // Vérifier et décoder le JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET non configuré');
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      email: string;
      role: string;
      companyId?: string;
      tenantId?: string;     // Pour les TenantUsers
      employeeId?: string;   // Pour les TenantUsers
    };

    // Stocker les infos utilisateur dans la requête
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // ----- Support optionnel du header x-tenant-id pour sélectionner explicitement un tenant -----
    const headerTenantId = (req.headers['x-tenant-id'] as string | undefined)?.toString();
    if (headerTenantId) {
      // Rechercher l'organisation correspondant au schéma fourni
      const headerCompany = await prismaPublic.company.findUnique({
        where: { schemaName: headerTenantId },
        select: { id: true, schemaName: true, isActive: true, country: true },
      });

      if (!headerCompany) {
        return res.status(404).json({
          success: false,
          message: 'Organisation non trouvée pour le tenant fourni',
        });
      }

      // Si l'utilisateur est ADMIN, il ne peut cibler qu'un tenant dont il est membre
      if (decoded.role === 'ADMIN' && decoded.companyId && decoded.companyId !== headerCompany.id) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas accès à ce tenant',
        });
      }

      // Sécurité : Empêcher les utilisateurs non-admin de changer de tenant via header
      if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Changement de tenant non autorisé',
        });
      }

      if (!headerCompany.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Organisation désactivée',
        });
      }

      // Appliquer la connexion tenant depuis le header
      req.companyId = headerCompany.id;
      req.companyCountry = headerCompany.country;
      req.tenantSchema = headerCompany.schemaName;
      req.tenantPrisma = getTenantConnection(headerCompany.schemaName);

      logger.debug(`Requête via header x-tenant-id: ${headerCompany.schemaName} (userRole: ${decoded.role})`);
      return next();
    }

    // Si SUPER_ADMIN, utiliser le schéma public (pas de tenant)
    if (decoded.role === 'SUPER_ADMIN') {
      req.tenantPrisma = prismaPublic;
      req.tenantSchema = 'public';
      logger.debug('Requête SUPER_ADMIN - schéma public');
      return next();
    }

    let company;

    // Gérer les deux types d'utilisateurs
    if (decoded.tenantId) {
      // C'est un TenantUser - récupérer l'organisation via le schemaName
      company = await prismaPublic.company.findUnique({
        where: { schemaName: decoded.tenantId },
        select: { id: true, schemaName: true, isActive: true, country: true },
      });

      if (company) {
        req.companyId = company.id;
      }
    } else if (decoded.companyId) {
      // C'est un Admin User - récupérer l'organisation via le companyId
      req.companyId = decoded.companyId;
      company = await prismaPublic.company.findUnique({
        where: { id: decoded.companyId },
        select: { id: true, schemaName: true, isActive: true, country: true },
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Utilisateur non associé à une organisation',
      });
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée',
      });
    }

    if (!company.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Organisation désactivée',
      });
    }

    // Connecter au schéma du tenant
    req.tenantSchema = company.schemaName;
    req.companyCountry = company.country;
    req.tenantPrisma = getTenantConnection(company.schemaName);

    logger.debug(`Requête tenant: ${company.schemaName} (companyId: ${decoded.companyId}, country: ${company.country})`);

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      });
    }

    logger.error('Erreur middleware tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'identification du tenant',
    });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur a accès aux ressources tenant
 * À utiliser après identifyTenant
 */
export const requireTenant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenantPrisma || !req.tenantSchema) {
    return res.status(403).json({
      success: false,
      message: 'Accès tenant requis',
    });
  }

  next();
};

/**
 * Middleware pour autoriser seulement le SUPER_ADMIN
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé au super administrateur',
    });
  }

  next();
};

/**
 * Middleware pour autoriser ADMIN ou SUPER_ADMIN
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== 'ADMIN' && req.userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs',
    });
  }

  next();
};
