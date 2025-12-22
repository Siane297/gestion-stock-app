// Types pour le système de permissions

/**
 * Modules de l'application
 */
export enum Module {
  TABLEAU_DE_BORD = 'tableau_de_bord',
  PRODUITS = 'produits',
  STOCK = 'stock',
  ACHATS = 'achats',
  VENTES = 'ventes',
  CLIENTS = 'clients',
  FOURNISSEURS = 'fournisseurs',
  CAISSES = 'caisses',
  PERSONNEL = 'personnel',
  UTILISATEURS = 'utilisateurs',
  BOUTIQUES = 'boutiques',
  RAPPORTS = 'rapports',
  PARAMETRES = 'parametres',
  COMPTABILITE = 'comptabilite',
}

/**
 * Actions possibles sur les modules
 */
export enum Action {
  VOIR = 'voir',
  CREER = 'creer',
  MODIFIER = 'modifier',
  SUPPRIMER = 'supprimer',
  EXPORTER = 'exporter',
  VALIDER = 'valider',
}

/**
 * Rôles utilisateur (doit correspondre à TenantUserRole dans Prisma)
 */
export enum TenantUserRole {
  ADMIN = 'ADMIN',
  STORE_MANAGER = 'STORE_MANAGER',
  STOCK_MANAGER = 'STOCK_MANAGER',
  SELLER = 'SELLER',
  ACCOUNTANT = 'ACCOUNTANT',
  USER = 'USER',
}

/**
 * Format d'une permission : "module:action"
 * Exemple: "products:create", "sales:view"
 */
export type Permission = `${Module}:${Action}` | '*';

/**
 * Définition d'un ensemble de permissions pour un rôle
 */
export interface RolePermissions {
  role: TenantUserRole;
  permissions: Permission[];
  description: string;
}

/**
 * Contexte utilisateur pour la vérification des permissions
 */
export interface UserPermissionContext {
  userId: string;
  role: TenantUserRole;
  isOwner: boolean;
  globalScope: boolean;
  magasinId?: string | null;
  managedStoreIds: string[];
  customPermissions: string[];
}

/**
 * Résultat de vérification de permission
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}
