import jwt from 'jsonwebtoken';

// Validation stricte du JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('❌ ERREUR CRITIQUE: JWT_SECRET est requis dans les variables d\'environnement!');
}

if (JWT_SECRET.length < 64) {
  throw new Error(`❌ ERREUR CRITIQUE: JWT_SECRET doit contenir au moins 64 caractères (actuel: ${JWT_SECRET.length})`);
}

// Vérifier qu'on n'utilise pas le secret par défaut en production
if (process.env.NODE_ENV === 'production' && JWT_SECRET.includes('secret')) {
  throw new Error('❌ ERREUR CRITIQUE: JWT_SECRET par défaut détecté en production!');
}

const JWT_EXPIRES_IN = '7d'; // 7 jours pour refresh token
const ACCESS_TOKEN_EXPIRES_IN = '8h'; // 8 heures pour tenir la journée de travail (évite l'erreur socket jwt expired)

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;     // ID de l'organisation (null pour SUPER_ADMIN)
  tenantId?: string;      // Pour les TenantUsers
  employeeId?: string;    // Pour les TenantUsers
  
  // Nouveaux champs pour le système de permissions
  isOwner?: boolean;      // Propriétaire de l'organisation
  globalScope?: boolean;  // Accès global à toutes les boutiques
  magasin_id?: string;    // Boutique d'affectation
  managedStoreIds?: string[]; // Boutiques gérées (pour STORE_MANAGER)
  customPermissions?: string[]; // Permissions custom ["module:action"]
}

/**
 * Génère un refresh token JWT (longue durée)
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Génère un access token JWT (courte durée)
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

/**
 * Génère un token JWT (compatibilité)
 */
export const generateToken = (payload: JWTPayload): string => {
  return generateRefreshToken(payload);
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
