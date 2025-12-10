import { prismaPublic } from '../services/tenantService.js';
import { logger } from '../config/logger.js';

/**
 * Migration pour ajouter le champ sexe aux tenants existants
 * Exécute: npm run migrate:add-sexe
 */
async function migrateSexeField() {
  try {
    // Récupérer tous les tenants depuis la table companies (schéma public)
    const organizations = await prismaPublic.$queryRaw<Array<{
      id: string;
      name: string;
      schemaName: string;
    }>>`
      SELECT id, "name", "schemaName" 
      FROM public.companies
      WHERE "schemaName" IS NOT NULL
    `;

    logger.info(`🔄 Migration du champ sexe pour ${organizations.length} tenant(s)`);

    for (const org of organizations) {
      const schemaName = org.schemaName;
      
      try {
        logger.info(`  📝 Migration du tenant: ${org.name} (${schemaName})`);

        // 1. Créer l'ENUM Sexe s'il n'existe pas
        await prismaPublic.$executeRawUnsafe(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Sexe' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '${schemaName}')) THEN
              CREATE TYPE "${schemaName}"."Sexe" AS ENUM ('MASCULIN', 'FEMININ');
            END IF;
          END $$;
        `);

        // 2. Ajouter la colonne sexe si elle n'existe pas
        await prismaPublic.$executeRawUnsafe(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_schema = '${schemaName}' 
              AND table_name = 'employees' 
              AND column_name = 'sexe'
            ) THEN
              ALTER TABLE "${schemaName}"."employees" 
              ADD COLUMN "sexe" "${schemaName}"."Sexe";
            END IF;
          END $$;
        `);

        logger.info(`  ✅ Tenant ${org.name} migré avec succès`);

      } catch (error) {
        logger.error(`  ❌ Erreur migration du tenant ${org.name}:`, error);
        // Continuer avec les autres tenants même en cas d'erreur
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
migrateSexeField()
  .then(() => {
    logger.info('🎉 Script de migration terminé');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
