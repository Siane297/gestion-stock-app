import type { Notification, NotificationStats, TypeNotification } from '~/types/notification';

export interface GetNotificationsQuery {
  limit?: number;
  offset?: number;
  est_lue?: boolean;
  type?: TypeNotification;
}

export const useNotificationsApi = () => {
  const { get, patch, delete: del } = useSecureApi();

  /**
   * Récupérer les notifications de l'utilisateur
   */
  const getNotifications = async (query: GetNotificationsQuery = {}) => {
    return await get<any>('/api/notifications', {
      params: query,
    });
  };

  /**
   * Récupérer le nombre de notifications non lues
   */
  const getUnreadCount = async () => {
    return await get<{ success: boolean; count: number }>('/api/notifications/count');
  };

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = async (id: string) => {
    return await patch<any>(`/api/notifications/${id}/read`);
  };

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = async () => {
    return await patch<any>('/api/notifications/read-all');
  };

  /**
   * Supprimer une notification
   */
  const deleteNotification = async (id: string) => {
    return await del<any>(`/api/notifications/${id}`);
  };

  /**
   * Supprimer toutes les notifications lues
   */
  const deleteAllRead = async () => {
    return await del<any>('/api/notifications/read-all');
  };

  return {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  };
};
