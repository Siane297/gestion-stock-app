import { computed } from 'vue';
import { useSecureAuth } from './useSecureAuth';

/**
 * Composable pour gérer les permissions utilisateur
 */
export const usePermissions = () => {
  const { user } = useSecureAuth();

  const hasPermission = (moduleOrFull: string | string[], action?: string): boolean => {
    if (!user.value) return false;

    // SUPER_ADMIN et OWNER ont tous les droits
    if (user.value.role === 'SUPER_ADMIN' || user.value.isOwner === true) {
      return true;
    }

    // ADMIN a accès à tout
    if (user.value.role === 'ADMIN') {
      return true;
    }

    // Gestion des tableaux de permissions (OR)
    if (Array.isArray(moduleOrFull)) {
      return moduleOrFull.some(p => hasPermission(p, action));
    }

    // Déterminer la permission à vérifier
    let permissionString = '';
    if (action) {
      permissionString = `${moduleOrFull}:${action}`;
    } else {
      permissionString = moduleOrFull;
    }
    
    // Si l'utilisateur a des customPermissions (venant du backend)
    if (user.value.customPermissions && Array.isArray(user.value.customPermissions)) {
      if (user.value.customPermissions.includes(permissionString)) {
        return true;
      }
      
      // Support du wildcard "*"
      if (user.value.customPermissions.includes('*')) {
        return true;
      }

      // Support du wildcard par module "module:*"
      const module = permissionString.split(':')[0];
      if (user.value.customPermissions.includes(`${module}:*`)) {
        return true;
      }
    }

    const permissions = (user.value as any).permissions || [];
    if (Array.isArray(permissions) && permissions.includes(permissionString)) {
      return true;
    }

    return false;
  };

  /**
   * Vérifier si l'utilisateur est administrateur (ADMIN, SUPER_ADMIN ou OWNER)
   */
  const isAdmin = computed(() => {
    if (!user.value) return false;
    return ['ADMIN', 'SUPER_ADMIN'].includes(user.value.role) || user.value.isOwner === true;
  });

  /**
   * Vérifier si l'utilisateur est gérant (STORE_MANAGER ou ADMIN+)
   */
  const isManager = computed(() => {
    if (!user.value) return false;
    return ['ADMIN', 'SUPER_ADMIN', 'STORE_MANAGER'].includes(user.value.role) || user.value.isOwner === true;
  });

  /**
   * Vérifier l'accès à une boutique spécifique
   */
  const canAccessStore = (storeId: string): boolean => {
    if (!user.value) return false;

    // Global scope (Admin/Owner)
    if (user.value.globalScope || user.value.isOwner || user.value.role === 'SUPER_ADMIN' || user.value.role === 'ADMIN') {
      return true;
    }

    // Store Manager de cette boutique
    if (user.value.managedStoreIds && Array.isArray(user.value.managedStoreIds)) {
      if (user.value.managedStoreIds.includes(storeId)) {
        return true;
      }
    }

    // Affecté à cette boutique
    return user.value.magasin_id === storeId;
  };

  return {
    hasPermission,
    canAccessStore,
    isAdmin,
    isManager
  };
};
