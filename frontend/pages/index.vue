<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-[#061141] gap-10 relative overflow-hidden">
    
    <!-- Bordure rectangle en haut à droite -->
    <div class="glass-corner top-right"></div>

    <!-- Bordure rectangle en bas à gauche -->
    <div class="glass-corner bottom-left"></div>

    <!-- Logo en haut -->
    <div class="relative z-10">
      <AppLogo size="lg" />
    </div>

    <!-- Contenu centré -->
    <div class="relative z-10">
      <div class="flex flex-col items-center justify-center">
        <!-- Icone de chargement -->
        <div class="mb-8">
          <Icon icon="mdi:loading" class="text-6xl text-white animate-spin" />
        </div>
        
        <!-- Loading Text -->
        <h1 class="text-3xl font-bold text-white mb-4">
          Gestionnaire de Présence
        </h1>
        <p class="text-lg text-white animate-pulse">
          Vérification de votre session...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useSecureAuth } from '~/composables/useSecureAuth';
import AppLogo from '~/components/logo/AppLogo.vue';

// Désactiver le layout pour prendre tout l'écran
definePageMeta({
  layout: false
});

const config = useRuntimeConfig();
const isChecking = ref(true);

// Configuration des routes avec permissions (même ordre que le middleware)
const routePermissions = [
  { path: '/accueil', permission: 'accueil' },
  { path: '/employees', permission: 'employees' },
  { path: '/produits', permission: 'produits' },
  { path: '/stock', permission: 'stock' },
  { path: '/point-de-vente', permission: 'point-de-vente' },
  { path: '/achat', permission: 'achat' },
  { path: '/client', permission: 'client' },
  { path: '/fournisseur', permission: 'fournisseur' },
  { path: '/facture', permission: 'facture' },
  { path: '/comptabilite', permission: 'comptabilite' },
  { path: '/boutique', permission: 'boutique' },
  { path: '/ventes', permission: 'ventes' },
  { path: '/organisation', permission: 'organisation' },
  { path: '/utilisateur', permission: 'utilisateur' },
  { path: '/parametre', permission: 'parametre' },
];

// Trouver la première page accessible pour l'utilisateur
const getFirstAccessibleRoute = (authUser: any) => {
  if (!authUser) return '/auth/connexion';

  // Admin et SUPER_ADMIN ont accès à tout
  const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
  if (adminRoles.includes(authUser.role)) {
    return '/accueil';
  }

  // Pour les TenantUsers, trouver la première page accessible
  const userPermissions = authUser.permissions || [];
  const firstRoute = routePermissions.find(route => 
    userPermissions.includes(route.permission)
  );

  return firstRoute ? firstRoute.path : '/auth/connexion';
};

// Vérifier la session au montage
onMounted(async () => {
  try {
    // Récupérer l'instance d'authentification
    const { user: authUser, isAuthenticated, checkAuth } = useSecureAuth();
    
    // Vérifier d'abord si l'utilisateur est déjà authentifié en mémoire
    console.log('🔍 État initial - User:', authUser.value);
    console.log('🔍 État initial - isAuthenticated:', isAuthenticated.value);
    
    // Si pas encore authentifié en mémoire, essayer avec le refresh token
    if (!isAuthenticated.value) {
      console.log('🔄 Tentative de refresh token...');
      await checkAuth();
    }
    
    console.log('🔍 Après checkAuth - User:', authUser.value);
    console.log('🔍 Après checkAuth - isAuthenticated:', isAuthenticated.value);

    if (authUser.value && isAuthenticated.value) {
      // Utilisateur connecté -> Rediriger vers la première page accessible
      const targetRoute = getFirstAccessibleRoute(authUser.value);
      console.log('✅ Utilisateur connecté, redirection vers:', targetRoute);
      await navigateTo(targetRoute, { replace: true });
    } else {
      // Non connecté -> Connexion
      console.log('❌ Utilisateur non connecté, redirection vers connexion');
      await navigateTo('/auth/connexion', { replace: true });
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification auth:', error);
    // Erreur ou non connecté -> Connexion
    await navigateTo('/auth/connexion', { replace: true });
  } finally {
    isChecking.value = false;
  }
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Bordures rectangulaires aux coins */
.glass-corner {
  position: absolute;
  background: transparent;
  border: 60px solid rgba(255, 255, 255, 0.254);
  z-index: 0;
}

/* Bordure en haut à droite */
.glass-corner.top-right {
  top: 0;
  right: 0;
  width: 300px;
  height: 250px;
  border-bottom-left-radius: 90px;
  border-top: none;
  border-right: none;
}

/* Bordure en bas à gauche */
.glass-corner.bottom-left {
  bottom: 0;
  left: 0;
  width: 300px;
  height: 250px;
  border-top-right-radius: 90px;
  border-bottom: none;
  border-left: none;
}
</style>
