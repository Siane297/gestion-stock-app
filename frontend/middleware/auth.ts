/**
 * Middleware d'authentification hybride
 * Utilise le système de refresh token (HttpOnly cookies) + access token (mémoire)
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Éviter les boucles de redirection - exclure les pages d'authentification
  const publicPages = ['/auth/connexion', '/auth/inscription', '/auth/preparation'];
  if (publicPages.includes(to.path)) {
    return;
  }

  // Uniquement côté client pour éviter les problèmes SSR
  if (process.server) {
    return;
  }

  // Utiliser le composable d'authentification sécurisée
  const { isAuthenticated, user, checkAuth } = useSecureAuth();

  try {
    // Si pas encore authentifié, essayer de vérifier avec le refresh token
    if (!isAuthenticated.value) {
      await checkAuth();
    }

    // Si toujours pas authentifié après checkAuth, rediriger vers connexion
    if (!isAuthenticated.value) {
      console.log('[❌ AUTH] Utilisateur non authentifié, redirection vers connexion');
      return navigateTo('/auth/connexion');
    }

    console.log('[✅ AUTH] Utilisateur authentifié:', user.value?.email, '- Role:', user.value?.role);
    return;
  } catch (error: any) {
    console.error('[❌ AUTH] Erreur middleware:', error);
    return navigateTo('/auth/connexion');
  }
});
