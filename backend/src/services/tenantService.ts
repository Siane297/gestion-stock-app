import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { logger } from '../config/logger.js';
import { seedTenantData } from './tenantSeedService.js';

// Instance Prisma pour le schéma public (gestion des tenants)
export const prismaPublic = new PrismaClient();

// Cache des connexions Prisma par tenant
const tenantConnections = new Map<string, PrismaClient>();

/**
 * Normaliser le nom de l'organisation pour créer un schéma valide
 * Ex: "Sirhame Tech" => "sirhame_tech"
 */
export const normalizeSchemaName = (companyName: string): string => {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_') // Remplacer caractères non alphanumériques par _
    .replace(/^_+|_+$/g, '') // Supprimer _ au début et à la fin
    .substring(0, 63); // PostgreSQL limite à 63 caractères
};

/**
 * Construire l'URL de base de données pour un tenant spécifique
 */
const buildTenantDatabaseUrl = (schemaName: string): string => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL non configurée');
  }

  // Remplacer le paramètre schema s'il existe déjà
  if (baseUrl.includes('schema=')) {
    return baseUrl.replace(/schema=[^&]+/, `schema=${schemaName}`);
  }

  // Ajouter le paramètre schema
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}schema=${schemaName}`;
};

/**
 * Appliquer les migrations Prisma sur un schéma tenant
 * Utilise Prisma Migrate pour créer automatiquement les tables à partir des fichiers .prisma
 */
export const applyTenantMigrations = async (schemaName: string): Promise<void> => {
  try {
    // Construire l'URL avec le schéma tenant
    const tenantDbUrl = buildTenantDatabaseUrl(schemaName);

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Application des migrations Prisma sur le schéma: ${schemaName}`);
    }

    // Exécuter les migrations Prisma sur ce schéma
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: tenantDbUrl },
      stdio: process.env.NODE_ENV === 'production' ? 'pipe' : 'inherit',
    });

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Migrations appliquées avec succès sur: ${schemaName}`);
    }
  } catch (error) {
    logger.error(`Erreur lors de l'application des migrations sur ${schemaName}:`, error);
    throw error;
  }
};

/**
 * Créer un nouveau schéma PostgreSQL pour un tenant
 */
export const createTenantSchema = async (schemaName: string): Promise<void> => {
  try {
    // Vérifier que le nom du schéma est valide
    if (!/^[a-z][a-z0-9_]*$/.test(schemaName)) {
      throw new Error(`Nom de schéma invalide: ${schemaName}`);
    }

    // Créer le schéma PostgreSQL
    await prismaPublic.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Schéma créé: ${schemaName}`);
    }

    // Appliquer les migrations sur le nouveau schéma
    await applyTenantMigrations(schemaName);

    // Seed les données de base (départements et postes)
    await seedTenantData(schemaName);

  } catch (error) {
    logger.error(`Erreur création schéma ${schemaName}:`, error);
    throw error;
  }
};

/**
 * Obtenir une connexion Prisma pour un tenant spécifique
 * Utilise un cache pour éviter de créer plusieurs connexions
 */
export const getTenantConnection = (schemaName: string): PrismaClient => {
  // Vérifier le cache
  if (tenantConnections.has(schemaName)) {
    return tenantConnections.get(schemaName)!;
  }

  // Créer une nouvelle connexion avec le schéma spécifique
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL non configurée');
  }

  // Remplacer schema=public par schema=tenantName
  let tenantUrl = databaseUrl;
  if (databaseUrl.includes('schema=')) {
    tenantUrl = databaseUrl.replace(/schema=\w+/, `schema=${schemaName}`);
  } else {
    // Ajouter le paramètre schema s'il n'existe pas
    const separator = databaseUrl.includes('?') ? '&' : '?';
    tenantUrl = `${databaseUrl}${separator}schema=${schemaName}`;
  }

  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantUrl,
      },
    },
  } as any);

  // Mettre en cache
  tenantConnections.set(schemaName, tenantPrisma);

  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Nouvelle connexion Prisma créée pour le schéma: ${schemaName}`);
  }

  return tenantPrisma;
};

/**
 * Supprimer un schéma tenant (attention, destructif!)
 */
export const deleteTenantSchema = async (schemaName: string): Promise<void> => {
  try {
    // Fermer la connexion si elle existe dans le cache
    const connection = tenantConnections.get(schemaName);
    if (connection) {
      await connection.$disconnect();
      tenantConnections.delete(schemaName);
    }

    // Supprimer le schéma PostgreSQL
    await prismaPublic.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    
    logger.info(`Schéma supprimé: ${schemaName}`);

  } catch (error) {
    logger.error(`Erreur suppression schéma ${schemaName}:`, error);
    throw error;
  }
};

/**
 * Vérifier si un schéma existe
 */
export const schemaExists = async (schemaName: string): Promise<boolean> => {
  try {
    const result = await prismaPublic.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = '${schemaName}') as exists`
    );
    return result[0]?.exists || false;
  } catch (error) {
    logger.error(`Erreur vérification schéma ${schemaName}:`, error);
    return false;
  }
};

/**
 * Nettoyer toutes les connexions (à appeler lors de l'arrêt du serveur)
 */
export const disconnectAllTenants = async (): Promise<void> => {
  const promises = Array.from(tenantConnections.values()).map((prisma) =>
    prisma.$disconnect()
  );
  await Promise.all(promises);
  tenantConnections.clear();
  await prismaPublic.$disconnect();
  logger.info('Toutes les connexions tenant fermées');
};
