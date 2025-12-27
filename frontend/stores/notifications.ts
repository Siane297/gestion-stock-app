import { defineStore } from 'pinia';
import type { Notification } from '~/types/notification';
import { useNotificationsApi } from '~/composables/api/useNotificationsApi';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const isLoaded = ref(false);

  const { getNotifications, getUnreadCount, markAsRead: apiMarkAsRead, markAllAsRead: apiMarkAllAsRead } = useNotificationsApi();

  /**
   * Charger les notifications initiales et le compteur
   */
  const fetchInitialData = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const [notifsResponse, countResponse] = await Promise.all([
        getNotifications({ limit: 20 }),
        getUnreadCount()
      ]);

      if (notifsResponse.success) {
        notifications.value = notifsResponse.data;
      }

      if (countResponse.success) {
        unreadCount.value = countResponse.count;
      }
      
      isLoaded.value = true;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Ajouter une nouvelle notification (reçue via Socket.io)
   */
  const addNotification = (notification: Notification) => {
    // Éviter les doublons
    if (notifications.value.some(n => n.id === notification.id)) return;
    
    notifications.value.unshift(notification);
    unreadCount.value++;
    
    // Garder seulement les 50 dernières en mémoire
    if (notifications.value.length > 50) {
      notifications.value.pop();
    }
  };

  /**
   * Marquer une notification comme lue localement et via API
   */
  const markAsRead = async (id: string) => {
    const notification = notifications.value.find(n => n.id === id);
    if (notification && !notification.est_lue) {
      notification.est_lue = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      
      try {
        await apiMarkAsRead(id);
      } catch (error) {
        console.error('Erreur API markAsRead:', error);
        // On pourrait rollback si besoin, mais UX-wise c'est mieux de laisser true
      }
    }
  };

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = async () => {
    notifications.value.forEach(n => n.est_lue = true);
    unreadCount.value = 0;
    
    try {
      await apiMarkAllAsRead();
    } catch (error) {
      console.error('Erreur API markAllAsRead:', error);
    }
  };

  /**
   * Réinitialiser le store (lors de la déconnexion)
   */
  const reset = () => {
    notifications.value = [];
    unreadCount.value = 0;
    isLoaded.value = false;
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoaded,
    fetchInitialData,
    addNotification,
    markAsRead,
    markAllAsRead,
    reset
  };
});
