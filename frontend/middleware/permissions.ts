/**
 * Middleware pour vérifier les permissions d'accès aux pages
 */

import { useSecureAuth } from '~/composables/useSecureAuth';

export default defineNuxtRouteMiddleware((to) => {
  const { user } = useSecureAuth();

  // Si pas d'utilisateur, le middleware 'auth' va gérer la redirection
  if (!user.value) {
    return;
  }

  // Configuration des permissions requises par préfixe de route
  // Les routes sont vérifiées par ordre (plus spécifique en premier)
  const routePermissions: Array<{ path: string; permission: string }> = [
    { path: '/accueil', permission: 'accueil' },         // Tableau de bord
    { path: '/employees', permission: 'employees' },     // + sous-routes /employees/*
    { path: '/pointage', permission: 'pointage' },       // + sous-routes /pointage/*
    { path: '/historique', permission: 'historique' },   // + sous-routes /historique/*
    { path: '/parametre', permission: 'parametre' },     // + sous-routes /parametre/*
    { path: '/utilisateur', permission: 'utilisateur' }, // + sous-routes /utilisateur/*
  ];

  // Trouver la permission requise pour cette route (y compris sous-routes)
  let requiredPermission: string | undefined = undefined;
  
  for (const route of routePermissions) {
    // Vérifier correspondance exacte ou si c'est une sous-route
    if (to.path === route.path || to.path.startsWith(route.path + '/')) {
      requiredPermission = route.permission;
      break;
    }
  }

  // Si la route n'est pas dans la config (undefined), laisser passer (par défaut)
  if (requiredPermission === undefined) {
    return;
  }

  // Les Admin et SUPER_ADMIN ont accès à tout
  const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
  if (adminRoles.includes(user.value.role)) {
    return;
  }

  // Pour les TenantUsers, vérifier les permissions
  const userPermissions = user.value.permissions || [];

  if (!userPermissions.includes(requiredPermission)) {
    // L'utilisateur n'a pas la permission requise
    // Afficher la page d'erreur 403 qui permettra à l'utilisateur de cliquer sur "Retour"
    // pour être redirigé vers index.vue puis vers sa première page accessible
    throw createError({
      statusCode: 403,
      statusMessage: `Accès refusé - Permission "${requiredPermission}" requise`,
      fatal: false,
    });
  }
});
