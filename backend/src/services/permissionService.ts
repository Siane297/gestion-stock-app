import { PrismaClient } from '@prisma/client';
import {
  Module,
  Action,
  TenantUserRole,
  Permission,
  RolePermissions,
  UserPermissionContext,
  PermissionCheckResult,
} from '../types/permissions.js';

/**
 * Service de gestion des permissions
 * Détermine si un utilisateur a accès à une ressource selon son rôle et son scope
 */
export class PermissionService {
  private static rolePermissionsMap: Map<TenantUserRole, Permission[]> = new Map();

  /**
   * Initialise la matrice de permissions par rôle
   */
  static initializePermissions() {
    // ADMIN - Accès complet
    this.rolePermissionsMap.set(TenantUserRole.ADMIN, ['*']);

    // STORE_MANAGER - Gestion complète de sa/ses boutiques
    this.rolePermissionsMap.set(TenantUserRole.STORE_MANAGER, [
      `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.CREER}`,
      `${Module.PRODUITS}:${Action.MODIFIER}`,
      `${Module.PRODUITS}:${Action.SUPPRIMER}`,
      `${Module.STOCK}:${Action.VOIR}`,
      `${Module.STOCK}:${Action.CREER}`,
      `${Module.STOCK}:${Action.MODIFIER}`,
      `${Module.STOCK}:${Action.VALIDER}`,
      `${Module.ACHATS}:${Action.VOIR}`,
      `${Module.ACHATS}:${Action.CREER}`,
      `${Module.VENTES}:${Action.VOIR}`,
      `${Module.VENTES}:${Action.CREER}`,
      `${Module.VENTES}:${Action.MODIFIER}`,
      `${Module.VENTES}:${Action.SUPPRIMER}`,
      `${Module.VENTES}:${Action.EXPORTER}`,
      `${Module.CLIENTS}:${Action.VOIR}`,
      `${Module.CLIENTS}:${Action.CREER}`,
      `${Module.CLIENTS}:${Action.MODIFIER}`,
      `${Module.FOURNISSEURS}:${Action.VOIR}`,
      `${Module.CAISSES}:${Action.VOIR}`,
      `${Module.CAISSES}:${Action.CREER}`,
      `${Module.CAISSES}:${Action.MODIFIER}`,
      `${Module.CAISSES}:${Action.VALIDER}`,
      `${Module.PERSONNEL}:${Action.VOIR}`,
      `${Module.PERSONNEL}:${Action.MODIFIER}`,
      `${Module.BOUTIQUES}:${Action.VOIR}`,
      `${Module.BOUTIQUES}:${Action.MODIFIER}`,
      `${Module.RAPPORTS}:${Action.VOIR}`,
      `${Module.RAPPORTS}:${Action.EXPORTER}`,
      `${Module.PARAMETRES}:${Action.VOIR}`,
      `${Module.PARAMETRES}:${Action.MODIFIER}`,
    ]);

    // STOCK_MANAGER - Gestion stock et achats
    this.rolePermissionsMap.set(TenantUserRole.STOCK_MANAGER, [
      `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.CREER}`,
      `${Module.PRODUITS}:${Action.MODIFIER}`,
      `${Module.PRODUITS}:${Action.SUPPRIMER}`,
      `${Module.STOCK}:${Action.VOIR}`,
      `${Module.STOCK}:${Action.CREER}`,
      `${Module.STOCK}:${Action.MODIFIER}`,
      `${Module.STOCK}:${Action.SUPPRIMER}`,
      `${Module.STOCK}:${Action.VALIDER}`,
      `${Module.ACHATS}:${Action.VOIR}`,
      `${Module.ACHATS}:${Action.CREER}`,
      `${Module.ACHATS}:${Action.MODIFIER}`,
      `${Module.ACHATS}:${Action.SUPPRIMER}`,
      `${Module.ACHATS}:${Action.VALIDER}`,
      `${Module.VENTES}:${Action.VOIR}`,
      `${Module.CLIENTS}:${Action.VOIR}`,
      `${Module.FOURNISSEURS}:${Action.VOIR}`,
      `${Module.FOURNISSEURS}:${Action.CREER}`,
      `${Module.FOURNISSEURS}:${Action.MODIFIER}`,
      `${Module.FOURNISSEURS}:${Action.SUPPRIMER}`,
      `${Module.BOUTIQUES}:${Action.VOIR}`,
      `${Module.RAPPORTS}:${Action.VOIR}`,
      `${Module.RAPPORTS}:${Action.EXPORTER}`,
      `${Module.PARAMETRES}:${Action.VOIR}`,
    ]);

    // SELLER - Ventes, caisse et relation client
    this.rolePermissionsMap.set(TenantUserRole.SELLER, [
      `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.VOIR}`,
      `${Module.STOCK}:${Action.VOIR}`,
      `${Module.VENTES}:${Action.VOIR}`,
      `${Module.VENTES}:${Action.CREER}`,
      `${Module.VENTES}:${Action.MODIFIER}`,
      `${Module.VENTES}:${Action.SUPPRIMER}`,
      `${Module.CLIENTS}:${Action.VOIR}`,
      `${Module.CLIENTS}:${Action.CREER}`,
      `${Module.CLIENTS}:${Action.MODIFIER}`,
      `${Module.CAISSES}:${Action.VOIR}`,
      `${Module.BOUTIQUES}:${Action.VOIR}`,
      `${Module.RAPPORTS}:${Action.VOIR}`,
    ]);

    // ACCOUNTANT - Rapports financiers
    this.rolePermissionsMap.set(TenantUserRole.ACCOUNTANT, [
      `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.VOIR}`,
      `${Module.STOCK}:${Action.VOIR}`,
      `${Module.ACHATS}:${Action.VOIR}`,
      `${Module.VENTES}:${Action.VOIR}`,
      `${Module.VENTES}:${Action.EXPORTER}`,
      `${Module.CLIENTS}:${Action.VOIR}`,
      `${Module.FOURNISSEURS}:${Action.VOIR}`,
      `${Module.CAISSES}:${Action.VOIR}`,
      `${Module.CAISSES}:${Action.EXPORTER}`,
      `${Module.BOUTIQUES}:${Action.VOIR}`,
      `${Module.RAPPORTS}:${Action.VOIR}`,
      `${Module.RAPPORTS}:${Action.EXPORTER}`,
      `${Module.PARAMETRES}:${Action.VOIR}`,
    ]);

    // USER - Consultation uniquement
    this.rolePermissionsMap.set(TenantUserRole.USER, [
      `${Module.TABLEAU_DE_BORD}:${Action.VOIR}`,
      `${Module.PRODUITS}:${Action.VOIR}`,
      `${Module.STOCK}:${Action.VOIR}`,
      `${Module.VENTES}:${Action.VOIR}`,
      `${Module.BOUTIQUES}:${Action.VOIR}`,
    ]);
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  static hasPermission(context: UserPermissionContext, module: Module, action: Action): PermissionCheckResult {
    // Les propriétaires ont tous les droits
    if (context.isOwner) {
      return { allowed: true };
    }

    const permission: Permission = `${module}:${action}`;

    // 1. Vérifier les permissions custom négatives (soustractions prioritaires)
    if (context.customPermissions.includes(`-${permission}`)) {
      return { allowed: false, reason: 'Permission explicitement retirée pour cet utilisateur' };
    }

    // 2. Vérifier les permissions custom positives (additions)
    if (context.customPermissions.includes(permission)) {
      return { allowed: true };
    }

    // 3. Vérifier les permissions du rôle
    const rolePermissions = this.rolePermissionsMap.get(context.role) || [];

    // Wildcard (*) = accès complet
    if (rolePermissions.includes('*')) {
      return { allowed: true };
    }

    // Vérifier la permission exacte du rôle
    if (rolePermissions.includes(permission)) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Permission non accordée par le rôle ou spécifiquement' };
  }

  /**
   * Vérifie si un utilisateur peut accéder à une boutique
   */
  static canAccessStore(context: UserPermissionContext, storeId: string): boolean {
    // Scope global (ADMIN/OWNER/SUPER_ADMIN)
    if (context.globalScope || context.isOwner || context.role === TenantUserRole.ADMIN || (context.role as string) === 'SUPER_ADMIN') {
      return true;
    }

    // Boutique d'affectation
    if (context.magasinId === storeId) {
      return true;
    }

    // Boutiques gérées (STORE_MANAGER)
    if (context.managedStoreIds.includes(storeId)) {
      return true;
    }

    return false;
  }

  /**
   * Récupère toutes les permissions d'un utilisateur
   */
  static getUserPermissions(context: UserPermissionContext): Permission[] {
    if (context.isOwner) {
      return ['*'];
    }

    const rolePermissions = this.rolePermissionsMap.get(context.role) || [];
    const customPermissions = context.customPermissions.filter(p => !p.startsWith('-')) as Permission[];

    // Combiner et dédupliquer
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  }

  /**
   * Récupère les IDs des boutiques accessibles
   */
  static getAccessibleStoreIds(context: UserPermissionContext): string[] | 'all' {
    // Scope global (Admins ou flag explicite)
    if (context.globalScope || context.isOwner || context.role === TenantUserRole.ADMIN || (context.role as string) === 'SUPER_ADMIN') {
      return 'all';
    }

    // Combiner boutique d'affectation + boutiques gérées
    const storeIds: string[] = [];

    if (context.magasinId) {
      storeIds.push(context.magasinId);
    }

    storeIds.push(...context.managedStoreIds);

    return Array.from(new Set(storeIds)); // Dédupliquer
  }

  /**
   * Vérifie si un rôle est un rôle admin
   */
  static isAdminRole(role: TenantUserRole): boolean {
    return role === TenantUserRole.ADMIN;
  }

  /**
   * Vérifie si un rôle est un rôle de gérant
   */
  static isManagerRole(role: TenantUserRole): boolean {
    return role === TenantUserRole.ADMIN || role === TenantUserRole.STORE_MANAGER;
  }
}

// Initialiser les permissions au démarrage
PermissionService.initializePermissions();
