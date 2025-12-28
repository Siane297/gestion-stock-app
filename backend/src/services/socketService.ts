import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../config/logger.js';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../config/jwt.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

export class SocketService {
  private io: SocketIOServer | null = null;

  /**
   * Initialiser Socket.io avec le serveur HTTP
   */
  initialize(server: HttpServer, allowedOrigins: string[]): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Middleware d'authentification
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          logger.warn('[Socket.io] Connexion rejetée - pas de token');
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

        socket.userId = decoded.userId;
        socket.tenantId = decoded.tenantId;

        logger.debug(`[Socket.io] Utilisateur authentifié: ${socket.userId} (tenant: ${socket.tenantId})`);
        next();
      } catch (error) {
        logger.error('[Socket.io] Erreur d\'authentification:', error);
        next(new Error('Authentication error'));
      }
    });

    // Gestion des connexions
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const { userId, tenantId } = socket;

      logger.debug(`[Socket.io] Client connecté: ${socket.id} (user: ${userId}, tenant: ${tenantId})`);

      // Rejoindre les rooms spécifiques
      if (tenantId) {
        socket.join(`tenant:${tenantId}`);
        logger.debug(`[Socket.io] ${socket.id} rejoint la room tenant:${tenantId}`);
      }

      if (userId) {
        socket.join(`user:${userId}`);
        logger.debug(`[Socket.io] ${socket.id} rejoint la room user:${userId}`);
      }

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        logger.debug(`[Socket.io] Client déconnecté: ${socket.id}`);
      });

      // Event de test
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    logger.info('[Socket.io] Service WebSocket initialisé');
    return this.io;
  }

  /**
   * Émettre une notification à tous les utilisateurs d'un tenant SAUF un utilisateur spécifique (l'émetteur)
   */
  emitToTenantExceptUser(tenantId: string, excludeUserId: string, event: string, data: any): void {
    if (!this.io) {
      logger.error('[Socket.io] Service non initialisé');
      return;
    }

    // Récupérer tous les sockets dans la room du tenant
    const tenantRoom = `tenant:${tenantId}`;
    const sockets = this.io.sockets.adapter.rooms.get(tenantRoom);

    if (!sockets) {
      logger.warn(`[Socket.io] Aucun socket dans la room ${tenantRoom}`);
      return;
    }

    let emittedCount = 0;

    // Émettre à chaque socket SAUF ceux de l'utilisateur exclu
    sockets.forEach((socketId) => {
      const socket = this.io!.sockets.sockets.get(socketId) as AuthenticatedSocket;
      
      if (socket && socket.userId !== excludeUserId) {
        socket.emit(event, data);
        emittedCount++;
      }
    });

    logger.debug(`[Socket.io] Événement ${event} émis à ${emittedCount} clients (tenant: ${tenantId}, exclu: ${excludeUserId})`);
  }

  /**
   * Émettre une notification à un utilisateur spécifique
   */
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      logger.error('[Socket.io] Service non initialisé');
      return;
    }

    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`[Socket.io] Événement ${event} émis à user:${userId}`);
  }

  /**
   * Émettre à tous les utilisateurs d'un tenant
   */
  emitToTenant(tenantId: string, event: string, data: any): void {
    if (!this.io) {
      logger.error('[Socket.io] Service non initialisé');
      return;
    }

    this.io.to(`tenant:${tenantId}`).emit(event, data);
    logger.debug(`[Socket.io] Événement ${event} émis à tenant:${tenantId}`);
  }

  /**
   * Obtenir l'instance Socket.io
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Instance singleton
export const socketService = new SocketService();
