<template>
  <!-- Menu avec sous-items -->
  <template v-if="item.children && item.children.length > 0">
    <button
      @click="$emit('toggleSubmenu', item.name)"
      class="w-full flex items-center tracking-wide justify-between gap-3 px-3 py-2 rounded-lg transition-all duration-200 group border-2"
      :class="isActiveParent 
        ? 'bg-primary text-white border-primary/20 shadow-3d-sidebar-active' 
        : 'text-white hover:bg-[#016278]/20 hover:text-white border-transparent hover:border-white/10 '"
    >
      <div class="flex items-center gap-3">
        <Icon 
          :icon="item.icon" 
          class="text-xl transition-transform "
        />
        <span class="font-medium">{{ item.name }}</span>
      </div>
      <Icon 
        icon="lucide:chevron-down" 
        class="text-lg transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>
    
    <!-- Sous-menu -->
    <Transition name="submenu">
      <ul v-show="isOpen" class="mt-1 ml-4 space-y-1">
        <li v-for="child in item.children" :key="child.link">
          <NuxtLink
            v-if="child.link"
            :to="child.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group border-2"
            :class="isActive(child.link, true) 
              ? 'bg-white/20 text-white border-white/30' 
              : 'text-white/70 hover:bg-white/10 hover:text-white border-transparent hover:border-white/10'"
          >
            <!-- Point au lieu de l'icône -->
            <div 
              class="w-1.5 h-1.5 rounded-full transition-all duration-200"
              :class="isActive(child.link, true) ? 'bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/40 group-hover:bg-white/60'"
            ></div>
            <span class="font-medium text-sm">{{ child.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </template>
  
  <!-- Menu simple sans sous-items -->
  <NuxtLink
    v-else-if="item.link"
    :to="item.link"
    class="flex items-center tracking-wide gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group border-2"
    :class="isActive(item.link) 
      ? 'bg-primary text-white border-primary/20 shadow-3d-sidebar-active ' 
      : 'text-white hover:bg-[#016278]/20 hover:text-white border-transparent hover:border-white/10 '
    "
  >
    <Icon 
      :icon="item.icon" 
      class="text-xl transition-transform "
      :class="isActive(item.link) ? 'text-white' : 'text-white'"
    />
    <span class="font-medium text-[14px]">{{ item.name }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';
interface MenuItem {
  name: string;
  icon: string;
  link?: string;
  permission?: string | string[];
  children?: MenuItem[];
}

interface Props {
  item: MenuItem;
  isOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
});

defineEmits<{
  toggleSubmenu: [menuName: string];
}>();

const route = useRoute();

// Vérifier si la route est active
// exact = true pour les sous-menus afin d'éviter les faux positifs (ex: /caisse actif sur /caisse/sessions)
const isActive = (link: string, exact: boolean = false) => {
  if (exact) {
    return route.path === link;
  }
  return route.path === link || route.path.startsWith(link + '/');
};

// Vérifier si un parent est actif (un de ses enfants est actif)
const isActiveParent = computed(() => {
  if (!props.item.children) return false;
  return props.item.children.some((child) => child.link && isActive(child.link, true));
});
</script>

<style scoped>
/* Effet 3D pour les liens de navigation */
.shadow-3d-sidebar {
  box-shadow: 
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    0 1px 2px -1px rgba(0, 0, 0, 0.06),
    inset 0 -1px 2px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(255, 255, 255, 0.05);
}

.shadow-3d-sidebar:hover {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.15),
    0 2px 4px -1px rgba(0, 0, 0, 0.08),
    inset 0 -2px 3px rgba(0, 0, 0, 0.08),
    inset 0 2px 3px rgba(255, 255, 255, 0.1);
}

/* Effet 3D pour le lien actif */
.shadow-3d-sidebar-active {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.shadow-3d-sidebar-active:hover {
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.25),
    0 3px 5px -1px rgba(0, 0, 0, 0.12),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* Animation pour les sous-menus */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.submenu-enter-to,
.submenu-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
