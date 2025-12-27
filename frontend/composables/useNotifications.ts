import { io, Socket } from 'socket.io-client';
import type { Notification } from '~/types/notification';
import { useNotificationStore } from '~/stores/notifications';

export const useNotifications = () => {
  const socket = useState<Socket | null>('socket.instance', () => null);
  const isConnected = useState<boolean>('socket.connected', () => false);
  const notificationStore = useNotificationStore();
  const auth = useSecureAuth();
  const config = useRuntimeConfig();

  /**
   * Initialiser la connexion WebSocket
   */
  const connect = () => {
    if (socket.value?.connected || !auth.isAuthenticated.value) return;

    const token = auth.accessToken.value;
    const baseURL = config.public.apiBase || 'http://localhost:3001';

    // console.log('🔌 [Socket.io] Tentative de connexion...');

    socket.value = io(baseURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.value.on('connect', () => {
      // console.log('✅ [Socket.io] Connecté avec ID:', socket.value?.id);
      isConnected.value = true;
      
      // Charger les données initiales si ce n'est pas déjà fait
      if (!notificationStore.isLoaded) {
        notificationStore.fetchInitialData();
      }
    });

    socket.value.on('disconnect', (reason) => {
      // console.log('❌ [Socket.io] Déconnecté:', reason);
      isConnected.value = false;
    });

    socket.value.on('connect_error', (error) => {
      console.error('⚠️ [Socket.io] Erreur de connexion:', error.message);
      isConnected.value = false;
    });

    // Écouter les nouvelles notifications
    socket.value.on('notification:new', (data: Notification) => {
      // console.log('🔔 [Socket.io] Nouvelle notification reçue:', data);
      notificationStore.addNotification(data);
      
      // Optionnel: Déclencher un son ou un toast global ici
      // Mais il vaut mieux le faire via un watch dans un composant de haut niveau
    });
  };

  /**
   * Déconnexion WebSocket
   */
  const disconnect = () => {
    if (socket.value) {
      // console.log('🔌 [Socket.io] Déconnexion manuelle');
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  /**
   * Reconnecter avec un nouveau token (ex: après refresh)
   */
  const reconnect = () => {
    disconnect();
    connect();
  };

  // Watcher pour gérer la connexion/déconnexion basée sur l'auth
  watch(() => auth.isAuthenticated.value, (isAuth) => {
    if (isAuth) {
      connect();
    } else {
      disconnect();
      notificationStore.reset();
    }
  }, { immediate: true });

  // Watcher pour le renouvellement du token
  watch(() => auth.accessToken.value, (newToken, oldToken) => {
    if (newToken && oldToken && newToken !== oldToken && isConnected.value) {
      // console.log('🔄 [Socket.io] Token renouvelé, reconnexion...');
      reconnect();
    }
  });

  return {
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    reconnect
  };
};
