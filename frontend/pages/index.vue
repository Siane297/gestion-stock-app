<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-side2  relative overflow-hidden">
    
    <!-- Background Patterns -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Corners - Bringing them slightly in -->
      <Icon icon="tabler:shopping-cart-check" class="absolute top-16 left-16 text-white opacity-5 text-9xl transform -rotate-12" />
      <Icon icon="tabler:box" class="absolute top-24 right-24 text-white opacity-5 text-8xl transform rotate-12" />
      <Icon icon="tabler:chart-line" class="absolute bottom-16 left-16 text-white opacity-5 text-9xl transform -rotate-6" />
      <Icon icon="tabler:building-store" class="absolute bottom-24 right-20 text-white opacity-5 text-8xl transform rotate-6" />
      
      <!-- Sides - More centered vertically/horizontally but kept away from logo -->
      <Icon icon="tabler:tag" class="absolute top-1/2 left-10 text-white opacity-5 text-8xl transform -rotate-45" />
      <Icon icon="tabler:truck-delivery" class="absolute top-1/3 right-10 text-white opacity-5 text-8xl transform rotate-45" />
      
      <!-- Off-center vertical - Bringing closer but keeping clearance -->
      <Icon icon="tabler:barcode" class="absolute top-10 left-1/3 text-white opacity-5 text-8xl transform rotate-12" />
      <Icon icon="tabler:cash" class="absolute bottom-10 right-1/3 text-white opacity-10 text-9xl transform -rotate-12" />
    </div>
    
    <!-- Logo en haut -->
    <div class="relative z-10">
       <img src="~/assets/images/logo-white.png" alt="Logo" class=" w-[150px] h-auto object-contain" />
    </div>

    <!-- Contenu centré -->
    <div class="relative z-10">
      <div class="flex flex-col items-center justify-center">
        <!-- Icone de chargement -->
        <div class="mb-2">
          <Icon icon="tabler:loader-2" class="text-6xl mb-3 text-white animate-spin" />
        </div>
        
        <!-- Loading Text -->
        <h1 class="text-3xl font-bold text-white mb-4">
          ZawadiCom
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

// Désactiver le layout pour prendre tout l'écran
definePageMeta({
  layout: false
});

const config = useRuntimeConfig();
const isChecking = ref(true);

// Configuration des routes avec permissions (même ordre que le middleware)
const routePermissions = [
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
  { path: '/store', permission: 'boutiques:voir' },
  { path: '/utilisateur', permission: 'utilisateurs:voir' },
  { path: '/parametre', permission: 'parametres:voir' },
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
    // console.log('🔍 État initial - User:', authUser.value);
    // console.log('🔍 État initial - isAuthenticated:', isAuthenticated.value);
    
    // Si pas encore authentifié en mémoire, essayer avec le refresh token
    if (!isAuthenticated.value) {
      console.log('🔄 Tentative de refresh token...');
      await checkAuth();
    }
    
    // console.log('🔍 Après checkAuth - User:', authUser.value);
    // console.log('🔍 Après checkAuth - isAuthenticated:', isAuthenticated.value);

    if (authUser.value && isAuthenticated.value) {
      // Utilisateur connecté -> Rediriger vers la première page accessible
      const targetRoute = getFirstAccessibleRoute(authUser.value);
      // console.log('✅ Utilisateur connecté, redirection vers:', targetRoute);
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
