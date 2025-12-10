import { prismaPublic } from '../services/tenantService.js';
import { execSync } from 'child_process';
import { logger } from '../config/logger.js';

/**
 * Script pour appliquer les migrations Prisma sur tous les tenants existants
 * Exécute: npm run migrate:tenants
 */
async function migrateAllTenants() {
  try {
    // Récupérer tous les tenants
    const companies = await prismaPublic.$queryRaw<Array<{
      id: string;
      name: string;
      schemaName: string;
    }>>`
      SELECT id, "name", "schemaName" 
      FROM public.companies
      WHERE "schemaName" IS NOT NULL
    `;

    logger.info(`📦 Migration de ${companies.length} tenant(s)`);

    for (const company of companies) {
      const schemaName = company.schemaName;
      
      try {
        logger.info(`  🔄 Migration du tenant: ${company.name} (${schemaName})`);

        // Construire l'URL avec le schéma tenant
        const baseUrl = process.env.DATABASE_URL;
        let tenantDbUrl = baseUrl;
        
        if (baseUrl?.includes('schema=')) {
          tenantDbUrl = baseUrl.replace(/schema=[^&]+/, `schema=${schemaName}`);
        } else {
          const separator = baseUrl?.includes('?') ? '&' : '?';
          tenantDbUrl = `${baseUrl}${separator}schema=${schemaName}`;
        }

        try {
          // Tenter d'exécuter les migrations normalement
          execSync('npx prisma migrate deploy', {
            env: { ...process.env, DATABASE_URL: tenantDbUrl },
            stdio: 'inherit'
          });
        } catch (error: any) {
          // Si erreur P3005 (schéma non vide sans historique de migration)
          if (error.message?.includes('P3005') || error.stdout?.includes('P3005')) {
            logger.info(`  ⚠️  Tenant existant détecté sans historique de migration`);
            logger.info(`  📋 Baseline du schéma ${schemaName}...`);
            
            // Baseline: marquer toutes les migrations comme appliquées
            execSync('npx prisma migrate resolve --applied "20251129181625_conge"', {
              env: { ...process.env, DATABASE_URL: tenantDbUrl },
              stdio: 'inherit'
            });
            
            // Réessayer la migration
            execSync('npx prisma migrate deploy', {
              env: { ...process.env, DATABASE_URL: tenantDbUrl },
              stdio: 'inherit'
            });
          } else {
            throw error;
          }
        }

        logger.info(`  ✅ Tenant ${company.name} migré avec succès`);

      } catch (error) {
        logger.error(`  ❌ Erreur migration du tenant ${company.name}:`, error);
        // Continuer avec les autres tenants
      }
    }

    logger.info(`✅ Migration terminée pour tous les tenants`);

  } catch (error) {
    logger.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prismaPublic.$disconnect();
  }
}

// Exécuter la migration
migrateAllTenants()
  .then(() => {
    logger.info('🎉 Script de migration terminé');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
