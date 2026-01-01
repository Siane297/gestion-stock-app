/**
 * Middleware pour vérifier les permissions d'accès aux pages
 */

import { useSecureAuth } from '~/composables/useSecureAuth';
import { usePermissions } from '~/composables/usePermissions';

export default defineNuxtRouteMiddleware((to) => {
  const { user } = useSecureAuth();

  // Si pas d'utilisateur, le middleware 'auth' va gérer la redirection
  if (!user.value) {
    return;
  }

  // Si l'utilisateur est SUPER_ADMIN, il ne devrait avoir accès qu'aux pages d'organisation
  // Le bloquer de toutes les autres pages "métier" qui utilisent le layout avec sidebar
  // (On autorise /organisation, /auth/*, et peut-être /profile si nécessaire)
  if (user.value.role === 'SUPER_ADMIN') {
    const allowedPathPrefixes = ['/organisation', '/auth', '/profile', '/notifications'];
    const isAllowed = allowedPathPrefixes.some(prefix => to.path === prefix || to.path.startsWith(prefix + '/'));
    
    if (!isAllowed) {
       // Si on est sur la racine ou accueil, rediriger vers organisation
       if (to.path === '/' || to.path === '/accueil') {
          return navigateTo('/organisation');
       }
       // Sinon erreur 403 ou redirection
       return navigateTo('/organisation');
    }
  }
  // Configuration des permissions requises par préfixe de route
  const routePermissions: Array<{ path: string; permission: string }> = [
    { path: '/accueil', permission: 'tableau_de_bord:voir' },
    { path: '/employees', permission: 'personnel:voir' },
    { path: '/produits', permission: 'produits:voir' },
    { path: '/stock', permission: 'stock:voir' },
    { path: '/inventaire', permission: 'inventaire:voir' },
    { path: '/caisse', permission: 'caisses:voir' },
    { path: '/point-vente', permission: 'ventes:creer' },
    { path: '/vente', permission: 'ventes:voir' },
    { path: '/achat', permission: 'achats:voir' },
    { path: '/client', permission: 'clients:voir' },
    { path: '/fournisseur', permission: 'fournisseurs:voir' },
    { path: '/comptabilite', permission: 'comptabilite:voir' },
    { path: '/store', permission: 'boutiques:voir' }, // Note: /store et non /boutique d'après AppSidebar.vue
    { path: '/utilisateur', permission: 'utilisateurs:voir' },
    { path: '/parametre', permission: 'parametres:voir' },
    { path: '/organisation', permission: 'SUPER_ADMIN' },
  ];

  // Trouver la permission requise pour cette route
  // 1. Priorité à la permission spécifique définie dans definePageMeta
  let requiredPermission = to.meta.permission as string | undefined;
  
  // 2. Sinon, utiliser la configuration par préfixe de route
  if (!requiredPermission) {
    for (const route of routePermissions) {
      if (to.path === route.path || to.path.startsWith(route.path + '/')) {
        requiredPermission = route.permission;
        break;
      }
    }
  }

  // Si pas de permission requise, laisser passer
  if (requiredPermission === undefined) {
    return;
  }

  // Utiliser hasPermission du composable pour la vérification centralisée
  // (gère déjà ADMIN, SUPER_ADMIN, OWNER, customPermissions et effectives)
  const { hasPermission } = usePermissions();

  if (requiredPermission === 'SUPER_ADMIN') {
    if (user.value.role !== 'SUPER_ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Accès réservé au Super Admin' });
    }
    return;
  }

  if (!hasPermission(requiredPermission)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Accès refusé - Permission "${requiredPermission}" requise`,
      fatal: false,
    });
  }
});
