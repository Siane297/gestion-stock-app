import { prismaPublic } from '../services/tenantService.js';
import { logger } from '../config/logger.js';

async function restoreTenant() {
  try {
    console.log('🔄 Restauration du tenant Sirhame Shop...');

    const company = await prismaPublic.company.create({
      data: {
        name: 'Sirhame Shop',
        schemaName: 'sirhame_shop',
        email: 'admin@sirhameshop.com',
        emailOrganisation: 'contact@sirhameshop.com',
        telephoneOrganisation: '0102030405',
        country: 'France',
        isActive: true,
        subscriptionStatus: 'ACTIVE'
      }
    });

    console.log(`✅ Tenant restauré: ${company.name} (${company.schemaName})`);
    
  } catch (error: any) {
    if (error.code === 'P2002') {
        console.log('⚠️ Le tenant existe déjà (Conflit unique).');
    } else {
        console.error('❌ Erreur lors de la restauration:', error);
        process.exit(1);
    }
  } finally {
    await prismaPublic.$disconnect();
  }
}

restoreTenant();
