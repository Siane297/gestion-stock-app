import { execSync } from 'child_process';
import { logger } from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script de réparation pour la migration bloquée du tenant Sirhame Shop
 */
async function fixBrokenMigration() {
  try {
    const schemaName = 'sirhame_shop';
    const migrationName = '20251222094051_add_roles_permissions';

    console.log(`🔧 Réparation de la migration ${migrationName} pour le tenant ${schemaName}...`);

    // Construire l'URL avec le schéma tenant
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL manquante');
    }

    let tenantDbUrl = baseUrl;
    if (baseUrl?.includes('schema=')) {
      tenantDbUrl = baseUrl.replace(/schema=[^&]+/, `schema=${schemaName}`);
    } else {
      const separator = baseUrl?.includes('?') ? '&' : '?';
      tenantDbUrl = `${baseUrl}${separator}schema=${schemaName}`;
    }

    console.log(`📡 URL Base de données: ${tenantDbUrl.replace(/:[^:@]+@/, ':****@')}`); // Masquer le mdp

    // Marquer la migration comme annulée (rolled back) pour pouvoir la réappliquer
    try {
      console.log('🔄 Exécution de prisma migrate resolve --rolled-back...');
      execSync(`npx prisma migrate resolve --rolled-back "${migrationName}"`, {
        env: { ...process.env, DATABASE_URL: tenantDbUrl },
        stdio: 'inherit'
      });
      console.log('✅ Migration marquée comme rolled-back avec succès.');
    } catch (error) {
      console.error('❌ Echec du rollback (peut-être déjà fait ?):', error);
      // On continue quand même pour essayer le deploy
    }

    // Réessayer le déploiement
    console.log('🚀 Tentative de re-déploiement des migrations...');
    try {
      execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: tenantDbUrl },
        stdio: 'pipe' // Capture output instead of inheriting to print it manually on error
      });
      console.log('✅ Déploiement réussi !');
    } catch (deployError: any) {
      console.error('❌ Echec du déploiement:');
      if (deployError.stdout) console.log('STDOUT:', deployError.stdout.toString());
      if (deployError.stderr) console.error('STDERR:', deployError.stderr.toString());
      throw deployError;
    }

    console.log('🎉 Réparation et migration terminées avec succès !');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

fixBrokenMigration();
