import { navigateTo } from '#app';

/**
 * Middleware pour vérifier que l'utilisateur a le rôle SUPER_ADMIN
 * Redirige vers la page d'accueil si non autorisé
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Vérifier uniquement côté client
  if (process.client) {
    const { user } = useSecureAuth();
    
    // Si pas d'utilisateur ou pas SUPER_ADMIN, rediriger
    if (!user.value || user.value.role !== 'SUPER_ADMIN') {
      console.warn('⚠️ Accès refusé : rôle SUPER_ADMIN requis');
      return navigateTo('/accueil');
    }
  }
});
