import 'dotenv/config';
import { prismaPublic, getTenantConnection } from '../services/tenantService.js';
import bcrypt from 'bcryptjs';

async function restoreUser() {
  try {
    console.log('🔄 Restauration complète de l\'utilisateur admin pour Sirhame Shop...');

    // 1. Trouver le tenant
    const company = await prismaPublic.company.findUnique({
      where: { schemaName: 'sirhame_shop' }
    });

    if (!company) {
      console.error('❌ Tenant Sirhame Shop non trouvé ! Restaurez le tenant d\'abord.');
      return;
    }

    const tenantPrisma = getTenantConnection('sirhame_shop');

    // 2. Utilisateur Public (Authentification)
    const email = 'admin@sirhameshop.com';
    let user = await prismaPublic.user.findUnique({ where: { email } });
    
    const password = await bcrypt.hash('password123', 10);

    if (!user) {
        console.log('✨ Création de l\'utilisateur Public...');
        user = await prismaPublic.user.create({
            data: {
                email,
                password,
                name: 'Admin Sirhame',
                role: 'ADMIN',
                companyId: company.id,
                isActive: true,
                emailVerified: true
            }
        });
    } else {
        console.log('✅ Utilisateur Public existe déjà.');
    }

    // 3. Employé (Profil métier)
    // On cherche un poste et un département par défaut
    const poste = await tenantPrisma.poste.findFirst({ where: { name: 'Directeur Général' } }) || 
                 await tenantPrisma.poste.findFirst();
    const departement = await tenantPrisma.departement.findFirst({ where: { name: 'Direction Générale' } }) || 
                       await tenantPrisma.departement.findFirst();

    if (!poste || !departement) {
        throw new Error("Impossible de trouver un poste ou département. Executez le seed du tenant d'abord.");
    }

    let employee = await tenantPrisma.employee.findUnique({ where: { email } });
    if (!employee) {
        console.log('✨ Création de l\'Employé...');
        employee = await tenantPrisma.employee.create({
            data: {
                fullName: 'Admin Sirhame',
                email,
                matricule: 'ADM001',
                positionId: poste.id,
                // departmentId: departement.id, // Relation seems commented out in schema? Keep safe or check
                hireDate: new Date(),
                isActive: true
            }
        });
    } else {
        console.log('✅ Employé existe déjà.');
    }

    // 4. Utilisateur Tenant (Lien avec le stock/permissions)
    // CRITIQUE : L'ID doit matcher celui de l'utilisateur Public
    let tenantUser = await tenantPrisma.tenantUser.findUnique({ where: { id: user.id } }); // Recherche par ID strict

    if (!tenantUser) {
        console.log('✨ Création de l\'Utilisateur Tenant (Link)...');
        // Vérifier si un tenantUser existe déjà avec cet email mais un autre ID (cas de conflit)
        const conflict = await tenantPrisma.tenantUser.findUnique({ where: { email } });
        if (conflict) {
             console.warn(`⚠️ Conflit détecté : un TenantUser avec cet email existe déjà (ID: ${conflict.id}). Suppression pour recréation propre...`);
             await tenantPrisma.tenantUser.delete({ where: { id: conflict.id } });
        }

        tenantUser = await tenantPrisma.tenantUser.create({
            data: {
                id: user.id, // FORCE L'ID
                email,
                password, // Hashé
                employeeId: employee.id,
                role: 'ADMIN',
                isOwner: true,
                customPermissions: ["*"] // Full permissions
            }
        });
        console.log(`✅ TenantUser créé avec succès (ID: ${user.id})`);
    } else {
        console.log('✅ Utilisateur Tenant existe et est correctement lié.');
    }

    console.log(`🎉 Restauration terminée avec succès pour ${email}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // Ne pas déconnecter prismaPublic ici car utilisé ailleurs potentiellement, mais bon c'est un script one-shot
    await prismaPublic.$disconnect();
  }
}

restoreUser();
