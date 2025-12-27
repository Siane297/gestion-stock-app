<template>
  <div class="max-w-4xl p-6 bg-white mx-auto space-y-6 rounded-lg">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-side2 p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-white">Mes Notifications</h1>
        <p class="text-sm text-white/80 mt-1">Gérez et suivez toutes les activités de votre organisation.</p>
      </div>
      
      <div class="flex  items-center gap-3">
        <button 
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <Icon icon="lucide:check-check" />
          <span>Tout marquer comme lu</span>
        </button>
        
        <button 
          @click="deleteAllRead"
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-white rounded-xl hover:bg-red-500 hover:text-white transition-colors"
        >
          <Icon icon="lucide:trash-2" />
          <span>Supprimer les lues</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 overflow-x-auto">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap"
        :class="activeFilter === filter.value ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Notifications List -->
    <div v-if="isLoading && !notifications.length" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="filteredNotifications.length > 0" class="space-y-3">
      <NotificationItem 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick"
        class="border border-gris/60 "
      />
      
      <!-- Load More -->
      <div v-if="hasMore" class="pt-4 flex justify-center">
        <button 
          @click="loadMore"
          class="px-6 py-2.5 text-sm font-bold text-noir border-2 border-noir rounded-xl hover:bg-noir hover:text-white transition-all disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Chargement...' : 'Charger plus de notifications' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white py-20 rounded-3xl border border-dashed border-gray-300 flex flex-col items-center text-center px-6">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Icon icon="lucide:bell-off" class="text-gray-300 text-4xl" />
      </div>
      <h3 class="text-xl font-bold text-noir">Aucune notification</h3>
      <p class="text-gray-500 mt-2 max-w-sm">
        {{ activeFilter === 'unread' ? 'Toutes vos notifications ont été lues !' : 'Vous n\'avez pas encore reçu de notifications.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  hideBreadcrumb: true
});

import { Icon } from '@iconify/vue';
import { useNotificationStore } from '~/stores/notifications';
import { storeToRefs } from 'pinia';
import NotificationItem from '~/components/notifications/NotificationItem.vue';
import { useNotificationsApi } from '~/composables/api/useNotificationsApi';

const notificationStore = useNotificationStore();
const { notifications, unreadCount, isLoading } = storeToRefs(notificationStore);
const { getNotifications, deleteAllRead: apiDeleteAllRead } = useNotificationsApi();

const activeFilter = ref('all');
const filters = [
  { label: 'Toutes', value: 'all' },
  { label: 'Non lues', value: 'unread' },
  { label: 'Ventes', value: 'VENTE' },
  { label: 'Stock', value: 'STOCK' },
  { label: 'Achat', value: 'ACHAT' },
];

const hasMore = ref(true);
const offset = ref(0);
const limit = 20;

const filteredNotifications = computed(() => {
  let result = notifications.value;
  
  if (activeFilter.value === 'unread') {
    result = result.filter(n => !n.est_lue);
  } else if (activeFilter.value !== 'all') {
    result = result.filter(n => n.type.toString().startsWith(activeFilter.value));
  }
  
  return result;
});

const loadMore = async () => {
  offset.value += limit;
  try {
    const response = await getNotifications({ offset: offset.value, limit });
    if (response.success) {
      if (response.data.length < limit) hasMore.value = false;
      // On ajoute seulement les nouvelles (et on évite les doublons)
      response.data.forEach((n: any) => {
        if (!notifications.value.some(existing => existing.id === n.id)) {
          notifications.value.push(n);
        }
      });
    }
  } catch (error) {
    console.error('Erreur loading more:', error);
  }
};

const handleNotificationClick = async (notification: any) => {
  if (!notification.est_lue) {
    await notificationStore.markAsRead(notification.id);
  }
  
  if (notification.reference_type && notification.reference_id) {
    switch (notification.reference_type) {
      case 'vente': navigateTo(`/vente/${notification.reference_id}`); break;
      case 'achat': navigateTo(`/achat/${notification.reference_id}`); break;
      case 'produit': navigateTo(`/produits/${notification.reference_id}`); break;
      case 'inventaire': navigateTo(`/stock/inventaire/${notification.reference_id}`); break;
    }
  }
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const deleteAllRead = async () => {
  try {
    const res = await apiDeleteAllRead();
    if (res.success) {
      // Nettoyer localement
      notifications.value = notifications.value.filter(n => !n.est_lue);
      notificationStore.unreadCount = notifications.value.filter(n => !n.est_lue).length;
    }
  } catch (error) {
    console.error('Erreur deleteAllRead:', error);
  }
};

onMounted(async () => {
  if (!notificationStore.isLoaded) {
    await notificationStore.fetchInitialData();
  }
});
</script>
