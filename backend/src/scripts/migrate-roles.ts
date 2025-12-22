/**
 * Script de migration des rôles utilisateur
 * MANAGER → STORE_MANAGER
 * RH → USER
 * Ajout de globalScope pour les ADMIN
 * Migration de permissions JSON vers customPermissions
 */

import { PrismaClient } from '@prisma/client';
import { getTenantConnection, prismaPublic } from '../services/tenantService.js';

// Mapping des anciens rôles vers les nouveaux
const ROLE_MAPPING: Record<string, string> = {
  'ADMIN': 'ADMIN',
  'MANAGER': 'STORE_MANAGER',
  'USER': 'USER',
  'RH': 'USER', // RH devient USER (peu pertinent pour gestion de stock)
};

async function migrateRoles() {
  try {
    console.log('🔄 Début de la migration des rôles...\n');

    // Récupérer toutes les organisations actives
    const companies = await prismaPublic.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true, schemaName: true },
    });

    console.log(`📊 ${companies.length} organisation(s) trouvée(s)\n`);

    for (const company of companies) {
      console.log(`\n🏢 Traitement de: ${company.name} (${company.schemaName})`);
      
      try {
        const tenantPrisma = getTenantConnection(company.schemaName);

        // Récupérer tous les utilisateurs
        // Récupérer tous les utilisateurs via SQL brut car 'permissions' n'est plus dans le schéma Prisma
        const users = await tenantPrisma.$queryRaw<any[]>`
          SELECT id, email, role, "isOwner", permissions, magasin_id 
          FROM tenant_users
        `;

        console.log(`  👥 ${users.length} utilisateur(s) trouvé(s)`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
          try {
            // Mapper l'ancien rôle vers le nouveau
            const oldRole = user.role as string;
            // Si le rôle est déjà dans le nouveau mapping inversé (c'est un nouveau rôle), on le garde
            const validNewRoles = ['ADMIN', 'STORE_MANAGER', 'STOCK_MANAGER', 'SELLER', 'ACCOUNTANT', 'USER'];
            let newRole = ROLE_MAPPING[oldRole];
            
            if (!newRole) {
              if (validNewRoles.includes(oldRole)) {
                newRole = oldRole;
              } else {
                newRole = 'USER';
              }
            }

            // Déterminer le globalScope
            // ADMIN ou propriétaires ont un accès global
            const globalScope = newRole === 'ADMIN' || user.isOwner;

            // Convertir permissions JSON vers customPermissions array
            let customPermissions: string[] = [];
            if (user.permissions && typeof user.permissions === 'object') {
              // Anciennes permissions étaient un array de slugs
              customPermissions = Array.isArray(user.permissions) ? user.permissions : [];
            }

            // Mise à jour
            await tenantPrisma.$executeRawUnsafe(`
              UPDATE tenant_users
              SET 
                role = '${newRole}',
                "globalScope" = ${globalScope},
                "customPermissions" = '${JSON.stringify(customPermissions)}'
              WHERE id = '${user.id}'
            `);

            console.log(`    ✅ ${user.email}: ${oldRole} → ${newRole}${globalScope ? ' (global)' : ''}`);
            migratedCount++;

          } catch (userError: any) {
            console.error(`    ❌ Erreur pour ${user.email}:`, userError.message);
            skippedCount++;
          }
        }

        console.log(`  📊 Résumé: ${migratedCount} migrés, ${skippedCount} erreurs`);

      } catch (tenantError: any) {
        console.error(`  ❌ Erreur pour l'organisation ${company.name}:`, tenantError.message);
      }
    }

    console.log('\n✅ Migration terminée avec succès!\n');

  } catch (error: any) {
    console.error('❌ Erreur fatale:', error);
    throw error;
  } finally {
    await prismaPublic.$disconnect();
  }
}

// Exécuter la migration
console.log('╔══════════════════════════════════════╗');
console.log('║   MIGRATION DES RÔLES UTILISATEUR    ║');
console.log('╚══════════════════════════════════════╝\n');

migrateRoles()
  .then(() => {
    console.log('🎉 Migration réussie!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  });
