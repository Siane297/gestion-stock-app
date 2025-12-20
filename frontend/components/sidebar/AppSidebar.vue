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
      class="fixed left-0 top-0 h-screen w-64 bg-side border-r border-gris/50  flex flex-col shadow-sm z-50 lg:z-40"
    >
    <!-- Logo -->
    <div class="px-4 py-[6px] border-b border-gris/50">
      <div class="flex items-center gap-1">
        <img src="~/assets/images/logo-white.png" alt="Logo" class=" w-16 h-auto object-contain" />
        <div class="flex flex-col gap-1">
          <span class="font-bold text-lg tracking-wide text-white leading-tight">ZawadiCom</span>
          <span class="text-xs tracking-wide text-white/60">Gestion stock & vente</span>
        </div>
      </div>
    </div>

    <!-- Store Selector -->
    <StoreSelector />

    <!-- Navigation -->
    <nav class="flex-1 mt-2 overflow-y-auto p-4">
      <ClientOnly>
        <div v-for="(category, index) in filteredMenuCategories" :key="index" class="mb-6 last:mb-0">
          <p class="text-white/60 tracking-wide text-[11px] mb-3 font-bold uppercase px-2">{{ category.title }}</p>
          <ul class="space-y-1">
            <li v-for="item in category.items" :key="item.link || item.name">
              <SidebarMenuItem
                :item="item"
                :is-open="openMenus.includes(item.name)"
                @toggle-submenu="toggleSubmenu"
              />
            </li>
          </ul>
        </div>
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
import StoreSelector from '~/components/sidebar/StoreSelector.vue';

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
// Configuration des catégories de menu
const menuCategories = [
  {
    title: 'Menu principal',
    items: [
      {
        name: 'Tableau de bord',
        icon: 'tabler:home',
        link: '/accueil',
        permission: 'accueil',
      },
    ]
  },
    {
    title: 'Gestion de Stock',
    items: [
      {
        name: 'Produits',
        icon: 'tabler:box',
        link: '/produits',
        permission: 'produits',
      },
      {
        name: 'Stock',
        icon: 'tabler:archive',
        link: '/stock',
        permission: 'stock',
      },
      {
        name: 'Boutique/Magasin',
        icon: 'tabler:building-store',
        link: '/store',
        permission: 'boutique',
      },
    ]
  },
  {
    title: 'Ressources Humaines',
    items: [
      {
        name: 'Personnel',
        icon: 'tabler:users',
        link: '/employees',
        permission: 'employees',
      },
       {
        name: 'Client',
        icon: 'tabler:user-check',
        link: '/client',
        permission: 'client',
      },
      {
        name: 'Fournisseur',
        icon: 'tabler:user-star',
        link: '/fournisseur',
        permission: 'fournisseur',
      },
     
    ]
  },

  {
    title: 'Gestion Commerciale',
    items: [
      {
        name: 'Caisse',
        icon: 'tabler:cash-register',
        link: '/caisse',
        permission: 'caisse',
      },
      {
        name: 'Point de vente',
        icon: 'tabler:device-laptop',
        link: '/point-vente',
        permission: 'point-vente',
      },
      {
        name: 'Vente',
        icon: 'tabler:coins',
        link: '/vente',
        permission: 'vente',
      },
      {
        name: 'Achat',
        icon: 'tabler:shopping-cart',
        link: '/achat',
        permission: 'achat',
      },
      {
        name: 'Comptabilité',
        icon: 'tabler:calculator',
        link: '/comptabilite',
        permission: 'comptabilite',
      },
      // {
      //   name: 'Facture',
      //   icon: 'tabler:receipt',
      //   link: '/facture',
      //   permission: 'facture',
      // },
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        name: 'Organisation',
        icon: 'tabler:building-2',
        link: '/organisation',
        permission: 'SUPER_ADMIN',
      },
       {
        name: 'Utilisateurs',
        icon: 'tabler:user-cog',
        link: '/utilisateur',
        permission: 'utilisateur',
      },
      {
        name: 'Paramètres',
        icon: 'tabler:settings',
        link: '/parametre',
        permission: 'parametre',
      }
    ]
  }
];

// Filtrer les catégories et leurs items selon les permissions
const filteredMenuCategories = computed(() => {
  if (!user.value) {
    return [];
  }

  return menuCategories.map(category => {
    // Filtrer les items de la catégorie
    const filteredItems = category.items.filter(item => {
      // Cas spécial SUPER_ADMIN
      if (item.permission === 'SUPER_ADMIN') {
        return user.value.role === 'SUPER_ADMIN';
      }

      // Admin a accès à tout (sauf SUPER_ADMIN explicit)
      const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
      if (adminRoles.includes(user.value.role)) {
        return true;
      }

      const userPermissions = user.value.permissions || [];
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    });

    // Retourner la catégorie seulement si elle a des items visibles
    if (filteredItems.length > 0) {
      return {
        ...category,
        items: filteredItems
      };
    }
    return null;
  }).filter(category => category !== null); // Enlever les catégories vides
});

const route = useRoute();

// Ouvrir automatiquement le menu parent si un enfant est actif
// Ouvrir automatiquement le menu parent si un enfant est actif
watch(() => route.path, (newPath) => {
  menuCategories.forEach(category => {
    category.items.forEach(item => {
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
