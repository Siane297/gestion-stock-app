import { PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';
import { getCurrencyByCountry } from '../utils/countryCurrency.js';

export class OrganizationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getAll() {
    // Récupérer toutes les entreprises avec les infos d'abonnement
    const organizations = await this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailOrganisation: true,
        telephoneOrganisation: true,
        logo: true,
        isActive: true,
        schemaName: true,
        createdAt: true,
        // Champs d'abonnement
        trialEndsAt: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        monthlyPrice: true,
        currency: true,
        country: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const now = new Date();

    // Récupérer le nombre d'employés et calculer les jours restants
    return await Promise.all(organizations.map(async (org: any) => {
      let employeeCount = 0;
      try {
        const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
          `SELECT COUNT(*) as count FROM "${org.schemaName}"."employees"`
        );
        
        if (result && result[0]) {
          employeeCount = Number(result[0].count);
        }
      } catch (err) {
        console.error(`Erreur lors du comptage des employés pour ${org.name} (${org.schemaName}):`, err);
      }

      let storeCount = 0;
      try {
        const result = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
          `SELECT COUNT(*) as count FROM "${org.schemaName}"."magasins"`
        );
        
        if (result && result[0]) {
          storeCount = Number(result[0].count);
        }
      } catch (err) {
        console.error(`Erreur lors du comptage des magasins pour ${org.name} (${org.schemaName}):`, err);
      }

      // Calculer les jours restants
      let daysRemaining: number | null = null;
      if (org.subscriptionStatus === 'TRIAL' && org.trialEndsAt) {
        daysRemaining = Math.ceil((org.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else if (org.subscriptionStatus === 'ACTIVE' && org.subscriptionEndsAt) {
        daysRemaining = Math.ceil((org.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Résoudre la devise (fallback sur le pays si null)
      const currencyCode = org.currency || getCurrencyByCountry(org.country || 'Comoros').code;

      return {
        id: org.id,
        name: org.name,
        email: org.email,
        emailOrganisation: org.emailOrganisation,
        telephoneOrganisation: org.telephoneOrganisation,
        logo: org.logo,
        blocked: !org.isActive,
        createdAt: org.createdAt,
        employeeCount: employeeCount,
        storeCount: storeCount,
        // Informations d'abonnement
        trialEndsAt: org.trialEndsAt,
        subscriptionStatus: org.subscriptionStatus,
        subscriptionEndsAt: org.subscriptionEndsAt,
        monthlyPrice: org.monthlyPrice ? Number(org.monthlyPrice) : null,
        currency: currencyCode,
        daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
      };
    }));
  }

  async toggleBlock(id: string, blocked: boolean) {
    // Mettre à jour le statut isActive de l'organisation (logique inversée)
    const updatedOrganization = await this.prisma.company.update({
      where: { id },
      data: { isActive: !blocked }, // blocked true = isActive false
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    console.log(`✅ Organisation ${updatedOrganization.name} ${blocked ? 'bloquée' : 'débloquée'}`);

    return {
      organization: {
        ...updatedOrganization,
        blocked: !updatedOrganization.isActive,
      },
      message: `Organisation ${blocked ? 'bloquée' : 'débloquée'} avec succès`
    };
  }
}
