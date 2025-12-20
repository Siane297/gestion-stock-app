import { useCaisseStore } from '~/stores/caisse';

export default defineNuxtRouteMiddleware(async (to) => {
  const caisseStore = useCaisseStore();

  // Si on est déjà sur la page de gestion des sessions, on ne boucle pas
  if (to.path === '/point-vente/session') {
    return;
  }

  // Vérifier s'il y a une session active en mémoire
  if (!caisseStore.hasActiveSession) {
    // Si pas en mémoire, tenter de vérifier auprès du serveur (ex: après un refresh F5)
    await caisseStore.checkCurrentSession();
  }

  // Si toujours pas de session après vérification, redirection
  if (!caisseStore.hasActiveSession) {
    return navigateTo('/point-vente/session');
  }

  // Si la session est verrouillée, on laisse passer (le POS affichera l'overlay PIN)
  // car le middleware protège l'existence d'une session, pas son état de verrouillage.
});
