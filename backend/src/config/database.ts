import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Instance globale Prisma
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pour éviter les connexions multiples en développement
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

// Gestionnaire de déconnexion propre
const disconnect = async () => {
  await prisma.$disconnect();
};

// Gestionnaire d'événements pour fermer la connexion
process.on('beforeExit', disconnect);
process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);

// Test de connexion
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    if (process.env.NODE_ENV !== 'production') {
      logger.info('✅ Connexion à PostgreSQL établie avec succès');
    }
  } catch (error) {
    logger.error('❌ Erreur de connexion à PostgreSQL:', error);
    process.exit(1);
  }
};

// Vérification de santé de la base de données
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('❌ Problème de santé base de données:', error);
    return false;
  }
};

export { prisma };
export default prisma;
