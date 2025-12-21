import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

/**
 * Seed des données de base pour un nouveau tenant
 * Crée les départements et postes par défaut dans le schéma tenant
 */
export const seedTenantData = async (schemaName: string): Promise<void> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Début du seed pour le tenant: ${schemaName}`);
    }

    // Créer une connexion Prisma pour ce schéma spécifique
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    // Ajouter le paramètre schema à l'URL
    const url = new URL(databaseUrl);
    url.searchParams.set('schema', schemaName);

    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: url.toString(),
        },
      },
    });

    // Le seed des départements et postes a été désactivé
    // Ces données doivent être configurées manuellement par le tenant

    await tenantPrisma.$disconnect();
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`✅ Seed terminé pour ${schemaName}`);
    }

  } catch (error) {
    logger.error(`❌ Erreur lors du seed du tenant ${schemaName}:`, error);
    throw error;
  }
};
