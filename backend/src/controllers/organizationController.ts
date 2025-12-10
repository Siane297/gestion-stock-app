import { Request, Response } from 'express';
import prisma from '../config/database.js';

/**
 * Récupérer toutes les organisations (companies) avec les informations essentielles
 * Accessible uniquement par SUPER_ADMIN
 */
export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    // Récupérer toutes les entreprises avec les infos d'abonnement
    const organizations = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailOrganisation: true,
        logo: true,
        isActive: true,
        schemaName: true,
        createdAt: true,
        // Champs d'abonnement
        trialEndsAt: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        monthlyPrice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const now = new Date();

    // Récupérer le nombre d'employés et calculer les jours restants
    const organizationsWithCounts = await Promise.all(organizations.map(async (org) => {
      let employeeCount = 0;
      try {
        const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
          `SELECT COUNT(*) as count FROM "${org.schemaName}"."employees"`
        );
        
        if (result && result[0]) {
          employeeCount = Number(result[0].count);
        }
      } catch (err) {
        console.error(`Erreur lors du comptage des employés pour ${org.name} (${org.schemaName}):`, err);
      }

      // Calculer les jours restants
      let daysRemaining: number | null = null;
      if (org.subscriptionStatus === 'TRIAL' && org.trialEndsAt) {
        daysRemaining = Math.ceil((org.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else if (org.subscriptionStatus === 'ACTIVE' && org.subscriptionEndsAt) {
        daysRemaining = Math.ceil((org.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        id: org.id,
        name: org.name,
        email: org.email,
        emailOrganisation: org.emailOrganisation,
        logo: org.logo,
        blocked: !org.isActive,
        createdAt: org.createdAt,
        employeeCount: employeeCount,
        // Informations d'abonnement
        trialEndsAt: org.trialEndsAt,
        subscriptionStatus: org.subscriptionStatus,
        subscriptionEndsAt: org.subscriptionEndsAt,
        monthlyPrice: org.monthlyPrice ? Number(org.monthlyPrice) : null,
        daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
      };
    }));

    res.json(organizationsWithCounts);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des organisations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des organisations' });
  }
};

/**
 * Basculer le statut de blocage d'une organisation
 * Accessible uniquement par SUPER_ADMIN
 */
export const toggleBlockOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    if (typeof blocked !== 'boolean') {
      res.status(400).json({ message: 'Le paramètre "blocked" doit être un booléen' });
      return;
    }

    // Mettre à jour le statut isActive de l'organisation (logique inversée)
    const updatedOrganization = await prisma.company.update({
      where: { id },
      data: { isActive: !blocked }, // blocked true = isActive false
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    console.log(`✅ Organisation ${updatedOrganization.name} ${blocked ? 'bloquée' : 'débloquée'}`);

    res.json({
      message: `Organisation ${blocked ? 'bloquée' : 'débloquée'} avec succès`,
      organization: {
        ...updatedOrganization,
        blocked: !updatedOrganization.isActive,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors du changement de statut de l\'organisation:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de l\'organisation' });
  }
};
