<template>
  <div class="relative notification-bell-container">
    <!-- Bell Icon + Badge -->
    <button 
      class="relative p-2.5 rounded-full bg-bleu/60 border border-[#a7d2e1] hover:bg-bleu/20 transition-all group"
      @click="$emit('toggle')"
      aria-label="Notifications"
    >
      <Icon 
        icon="tabler:bell" 
        class="text-noir text-2xl group-hover:scale-110 transition-transform" 
        :class="{ 'animate-swing': unreadCount > 0 }"
      />
      
      <!-- Unread Badge -->
      <Transition name="scale">
        <span 
          v-if="unreadCount > 0"
          class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div 
        v-if="isOpen"
        class="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 origin-top-right scale-100"
      >
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-noir">Notifications</h3>
            <span v-if="unreadCount > 0" class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
              {{ unreadCount }} nouvelles
            </span>
          </div>
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Tout marquer comme lu
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-[400px] overflow-y-auto overscroll-contain scrollbar-thin">
          <div v-if="notifications.length > 0" class="divide-y divide-gray-50">
            <NotificationItem 
              v-for="notification in notifications" 
              :key="notification.id"
              :notification="notification"
              @click="handleNotificationClick"
            />
          </div>
          
          <!-- Empty State -->
          <div v-else class="py-12 px-6 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon icon="lucide:bell-off" class="text-gray-300 text-3xl" />
            </div>
            <p class="text-sm font-medium text-gray-500">Aucune notification pour le moment</p>
            <p class="text-xs text-gray-400 mt-1">Vous serez averti ici des activités importantes.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-gray-50 border-t border-gray-100 sticky bottom-0 z-10">
          <NuxtLink 
            to="/notifications" 
            class="block w-full text-center py-2 text-xs font-bold text-gray-600 hover:text-noir transition-colors"
            @click="$emit('close')"
          >
            Voir toutes les notifications
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useNotificationStore } from '~/stores/notifications';
import { storeToRefs } from 'pinia';
import NotificationItem from './NotificationItem.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
  (e: 'close'): void;
}>();

const notificationStore = useNotificationStore();
const { notifications, unreadCount } = storeToRefs(notificationStore);

const handleNotificationClick = async (notification: any) => {
  if (!notification.est_lue) {
    await notificationStore.markAsRead(notification.id);
  }
  
  // Si il y a un lien de référence, on pourrait rediriger
  if (notification.reference_type && notification.reference_id) {
    // Redirection basée sur le type
    switch (notification.reference_type) {
      case 'vente':
        navigateTo(`/vente/${notification.reference_id}`);
        break;
      case 'achat':
        navigateTo(`/achat/${notification.reference_id}`);
        break;
      case 'produit':
        navigateTo(`/produits/${notification.reference_id}`);
        break;
      case 'inventaire':
        navigateTo(`/stock/inventaire/${notification.reference_id}`);
        break;
    }
  }
  
  emit('close');
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

// Fermer lors du changement de route
const route = useRoute();
watch(() => route.path, () => {
  emit('close');
});
</script>

<style scoped>
.animate-swing {
  animation: swing 2s ease infinite;
  transform-origin: top center;
}

@keyframes swing {
  0%, 100% { transform: rotate(0); }
  5%, 15%, 25% { transform: rotate(10deg); }
  10%, 20%, 30% { transform: rotate(-10deg); }
  35% { transform: rotate(0); }
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0);
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

/* Custom scrollbar for notifications list */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
