<template>
  <header
    class="fixed top-0 left-0 lg:left-64 right-0 py-2.5 max-md:p-4 bg-white  shadow flex items-center justify-between px-4 lg:px-6 z-30 ">
    <!-- Left Section: Logo + Page Title -->
    <div class="flex items-center gap-3 flex-1">
      <!-- Logo (Mobile/Tablet uniquement) -->
      <div class="lg:hidden flex items-center gap-2">
        <AppLogo size="xs" />
        <!-- <span class="font-bold text-base text-noir hidden sm:inline">Pointage App</span> -->
      </div>

      <!-- Page Title (toutes tailles) -->
      <h1 class="text-lg lg:text-xl font-semibold text-noir">{{ pageTitle }}</h1>

      <!-- Tag jours d'essai/abonnement (visible si en période d'essai ou abonnement actif) -->
      <div v-if="showTrialBadge"
        class="hidden sm:flex items-center gap-1.5 ml-3 px-2 py-1 rounded-lg  text-xs font-medium"
        :class="trialBadgeClass">
        <Icon :icon="trialBadgeIcon" class="text-sm" />
        <span>{{ trialBadgeText }}</span>
      </div>
    </div>

    <!-- Right Section: Search, Notifications, Profile -->
    <div class="flex items-center gap-4">
      <!-- Search Bar (optional) -->
      <div class="hidden md:flex items-center gap-2 bg-bleu border border-[#a7d2e1] px-4 py-2.5 rounded-full">
        <Icon icon="lucide:search" class="text-gray-400 text-lg" />
        <input type="text" placeholder="Rechercher..."
          class="bg-transparent border-none outline-none text-sm text-noir placeholder-gray-400 w-64" />
      </div>

      <!-- User Menu -->
      <div class="relative">
        <!-- Desktop: Avatar + Nom + Rôle -->
        <button @click="toggleUserMenu"
          class="hidden lg:flex items-center gap-6 px-2 py-2 bg-slot rounded-full transition-colors">
          <AvatarInitials :name="userName" :subtitle="userRole" size="md" :show-name="true" />
          <Icon icon="lucide:chevron-down" class="text-noir w-5 h-auto transition-transform"
            :class="{ 'rotate-180': isUserMenuOpen }" />
        </button>



        <!-- User Dropdown Menu -->
        <Transition name="dropdown">
          <div v-if="isUserMenuOpen"
            class="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-lg border border-gris p-2">
            <!-- Infos user (Mobile uniquement) -->
            <div class="lg:hidden px-4 py-3 border-b border-gris">
              <AvatarInitials :name="userName" :subtitle="userRole" size="lg" :show-name="true" />
            </div>

            <NuxtLink v-for="item in menuItems" :key="item.link" :to="item.link"
              class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slot transition-colors"
              @click="isUserMenuOpen = false">
              <Icon :icon="item.icon" class="text-gray-600 w-6 h-auto" />
              <span class="text-sm font-medium text-noir">{{ item.label }}</span>
            </NuxtLink>
            <hr class="my-2 border-gris" />
            <button @click="handleLogout"
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600">
              <Icon icon="tabler:logout" class="w-6 h-auto" />
              <span class="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </Transition>
      </div>
      <div class="bg-slot lg:hidden px-3 py-2 rounded-full flex items-center gap-2">
        <!-- Mobile: Avatar uniquement -->
        <button @click="toggleUserMenu" class="">
          <AvatarInitials :name="userName" size="sm" :show-name="false" />
        </button>
        <!-- Menu Burger (Mobile/Tablet uniquement) -->
        <button class="bg-white p-2 rounded-full transition-colors" @click="$emit('toggle-sidebar')">
          <Icon icon="tabler:menu-3" class="text-2xl text-noir" />
        </button>
      </div>
    </div>
  </header>

  <ConfirmationDialog v-model:visible="showLogoutConfirmation" header="Déconnexion"
    message="Êtes-vous sûr de vouloir vous déconnecter ?" accept-label="Se déconnecter" reject-label="Annuler"
    accept-variant="danger" icon="lucide:log-out" @accept="confirmLogout" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useCurrentUser, formatRole } from '~/composables/api/useUserApi';
import AppLogo from '~/components/logo/AppLogo.vue';

import AvatarInitials from '~/components/avatar/AvatarInitials.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';

defineEmits(['toggle-sidebar']);

const route = useRoute();
const router = useRouter();

// Page title based on route
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/accueil': 'Tableau de bord',
    '/stock': 'Stock',
    '/achat': 'Achat',
    '/vente': 'Vente',
    '/comptabilite': 'Comptabilité',
    '/fournisseur': 'Fournisseur',
    '/client': 'Client',
    '/employees': 'Employés',
    '/point-vente': 'Point de vente',
    '/store': 'Boutique/Magasin',
    '/produits': 'Produits',
  };
  return titles[route.path] || 'ZawadiCom';
});

// User info - Récupérer les vraies données
const { user, fetchUser } = useCurrentUser();

const userName = computed(() => {
  if (!user.value) return 'Utilisateur';
  // Pour les TenantUsers, utiliser employee.fullName
  if (user.value.employee) {
    return user.value.employee.fullName;
  }
  // Pour les Admin, utiliser name
  return user.value.name || 'Utilisateur';
});
const userRole = computed(() => user.value?.role ? formatRole(user.value.role) : 'Utilisateur');

// Badge d'essai (affiché uniquement en période d'essai)
const showTrialBadge = computed(() => {
  const company = user.value?.company;
  if (!company) return false;
  // Afficher seulement pour TRIAL (pas pour SUPER_ADMIN)
  return user.value?.role !== 'SUPER_ADMIN' && company.subscriptionStatus === 'TRIAL';
});

const trialBadgeText = computed(() => {
  const company = user.value?.company;
  if (!company) return '';

  const days = company.daysRemaining ?? 0;

  if (company.subscriptionStatus === 'TRIAL') {
    return `${days} jour${days > 1 ? 's' : ''} d'essai`;
  } else if (company.subscriptionStatus === 'ACTIVE') {
    return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
  }
  return '';
});

const trialBadgeClass = computed(() => {
  const company = user.value?.company;
  const days = company?.daysRemaining ?? 0;

  if (company?.subscriptionStatus === 'TRIAL') {
    // Orange pour période d'essai
    if (days <= 3) return 'bg-red-100 border-red-700 border text-red-700';
    if (days <= 7) return 'bg-orange-100 border-orange-700 border text-orange-700';
    return 'bg-amber-100 border-amber-700 border text-amber-700';
  } else if (company?.subscriptionStatus === 'ACTIVE') {
    // Vert pour abonnement actif, orange si proche de l'expiration
    if (days <= 7) return 'bg-orange-100 border-orange-700 border text-orange-700';
    return 'bg-green-100 border-green-700 border text-green-700';
  }
  return 'bg-gray-100 border-gray-700 border text-gray-700';
});

const trialBadgeIcon = computed(() => {
  const company = user.value?.company;
  if (company?.subscriptionStatus === 'TRIAL') {
    return 'lucide:clock';
  }
  return 'lucide:calendar-check';
});

// Notifications
const notificationCount = ref(3); // À remplacer par vraies données
const isNotificationsOpen = ref(false);

// Menu items
const menuItems = [
  {
    label: 'Mon profil',
    icon: 'tabler:user',
    link: '/profile',
  },
  {
    label: 'Paramètres',
    icon: 'tabler:settings',
    link: '/parametre',
  },
];

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
};

// User menu
const isUserMenuOpen = ref(false);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    isUserMenuOpen.value = false;
    isNotificationsOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  // Charger les données utilisateur
  await fetchUser();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Logout
const config = useRuntimeConfig();
const showLogoutConfirmation = ref(false);

const handleLogout = () => {
  // Fermer le menu utilisateur
  isUserMenuOpen.value = false;
  // Afficher la confirmation
  showLogoutConfirmation.value = true;
};

const confirmLogout = async () => {
  try {
    // Appeler l'API de déconnexion
    await $fetch(`${config.public.apiBase}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    router.push('/auth/connexion');
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    // Rediriger quand même
    router.push('/auth/connexion');
  }
};
</script>

<style scoped>
/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
