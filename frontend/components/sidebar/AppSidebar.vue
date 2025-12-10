<template>
  <!-- Overlay pour mobile -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="$emit('close')"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide">
    <aside
      v-show="isOpen || isDesktop"
      class="fixed left-0 top-0 h-screen w-64 bg-[#061141]  flex flex-col shadow-sm z-50 lg:z-40"
    >
    <!-- Logo -->
    <div class="p-4 border-b border-gris/50">
      <div class="flex items-center gap-3">
        <AppLogo size="sm" />
        <div class="flex flex-col gap-1">
          <span class="font-bold text-lg tracking-wide text-white leading-tight">{{ user?.company?.name || 'Pointage App' }}</span>
          <span class="text-xs tracking-wide text-white/60">Pointage App</span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 mt-2 overflow-y-auto p-4">
      <p class="text-white/60 tracking-wide text-[12px] mb-5 font-medium uppercase">Menu principal</p>
      <ClientOnly>
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.link || item.name">
            <SidebarMenuItem
              :item="item"
              :is-open="openMenus.includes(item.name)"
              @toggle-submenu="toggleSubmenu"
            />
          </li>
        </ul>
        <template #fallback>
          <!-- Skeleton pendant le chargement -->
          <ul class="space-y-1">
            <li v-for="n in 5" :key="n" class="h-10 bg-white/10 rounded animate-pulse mb-1"></li>
          </ul>
        </template>
      </ClientOnly>
    </nav>

    <!-- Bouton de fermeture (mobile uniquement) -->
    <button
      class="absolute top-4 right-4 lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
      @click="$emit('close')"
    >
      <Icon icon="mdi:close" class="text-2xl" />
    </button>
  </aside>
  </Transition>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
import { useSecureAuth } from '~/composables/useSecureAuth';
import SidebarMenuItem from '~/components/sidebar/SidebarMenuItem.vue';
import AppLogo from '~/components/logo/AppLogo.vue';

interface Props {
  isOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
});

defineEmits(['close']);

// Détecter si on est en mode desktop
const isDesktop = ref(true);

if (process.client) {
  isDesktop.value = window.innerWidth >= 1024;
  
  const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1024;
  };
  
  window.addEventListener('resize', handleResize);
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
}

// Récupérer les informations de l'utilisateur connecté
const { user, checkAuth } = useSecureAuth();

// Vérifier l'authentification au montage
onMounted(async () => {
  if (!user.value) {
    await checkAuth();
  }
});

// État pour les menus ouverts
const openMenus = ref<string[]>([]);

// Toggle submenu
const toggleSubmenu = (menuName: string) => {
  const index = openMenus.value.indexOf(menuName);
  if (index > -1) {
    openMenus.value.splice(index, 1);
  } else {
    openMenus.value.push(menuName);
  }
};


// Configuration complète du menu avec permissions requises
const allMenuItems = [
  {
    name: 'Tableau de bord',
    icon: 'lucide:blocks',
    link: '/accueil',
    permission: 'accueil',
  },
  {
    name: 'Employés',
    icon: 'lucide:users',
    link: '/employees',
    permission: 'employees',
  },
  {
    name: 'Pointage',
    icon: 'lucide:clock-plus',
    link: '/pointage',
    permission: 'pointage',
  },
  {
    name: 'Historique',
    icon: 'lucide:history',
    link: '/historique',
    permission: 'historique',
  },
  {
    name: 'Congés',
    icon: 'lucide:calendar-days',
    link: '/conge',
    permission: 'conge',
  },
  {
    name: 'Organisation',
    icon: 'lucide:building-2',
    link: '/organisation',
    permission: 'SUPER_ADMIN', // Seul le SUPER_ADMIN peut accéder à cette page
  },
  {
    name: 'Utilisateurs',
    icon: 'lucide:user-cog',
    link: '/utilisateur',
    permission: 'utilisateur',
  },
  {
    name: 'Paramètres',
    icon: 'lucide:settings',
    link: '/parametre',
    permission: 'parametre',
  }
];

// Filtrer les menus selon les permissions
const menuItems = computed(() => {
  // Si pas d'utilisateur connecté, retourner menu vide
  if (!user.value) {
    return [];
  }

  return allMenuItems.filter(item => {
    // Cas spécial pour la permission SUPER_ADMIN
    if (item.permission === 'SUPER_ADMIN') {
      return user.value.role === 'SUPER_ADMIN';
    }

    // Si c'est un Admin/SUPER_ADMIN, afficher tous les autres menus
    const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
    if (adminRoles.includes(user.value.role)) {
      return true;
    }

    // Pour les TenantUsers (MANAGER, USER, RH), filtrer selon permissions
    const userPermissions = user.value.permissions || [];
    
    // Si pas de permission requise, accessible à tous
    if (!item.permission) return true;
    
    // Vérifier si l'utilisateur a la permission
    return userPermissions.includes(item.permission);
  });
});

const route = useRoute();

// Ouvrir automatiquement le menu parent si un enfant est actif
watch(() => route.path, (newPath) => {
  allMenuItems.forEach(item => {
    if ('children' in item && item.children && Array.isArray(item.children)) {
      const hasActiveChild = (item.children as any[]).some((child: any) => {
        if (!child.link) return false;
        return route.path === child.link || route.path.startsWith(child.link + '/');
      });
      if (hasActiveChild && !openMenus.value.includes(item.name)) {
        openMenus.value.push(item.name);
      }
    }
  });
}, { immediate: true });
</script>

<style scoped>
/* Animation slide pour la sidebar */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Animation fade pour l'overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styling */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

</style>
