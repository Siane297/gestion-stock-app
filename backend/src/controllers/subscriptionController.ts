import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';
import { DateHelpers } from '../utils/dateHelpers.js';

/**
 * Récupérer les détails d'abonnement d'une organisation
 * Accessible uniquement par SUPER_ADMIN
 */
export const getSubscriptionDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        country: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        monthlyPrice: true,
        notes: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!company) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }

    // Calculer les jours restants
    let daysRemaining: number | null = null;
    const now = new Date();

    if (company.subscriptionStatus === 'TRIAL' && company.trialEndsAt) {
      daysRemaining = Math.ceil((company.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (company.subscriptionStatus === 'ACTIVE' && company.subscriptionEndsAt) {
      daysRemaining = Math.ceil((company.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    res.json({
      ...company,
      monthlyPrice: company.monthlyPrice ? Number(company.monthlyPrice) : null,
      daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails d\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des détails d\'abonnement' });
  }
};

/**
 * Activer un abonnement après négociation du prix
 * Cette fonction est appelée quand le Super Admin débloque une organisation expirée
 * Elle crée un enregistrement dans l'historique des paiements et active l'abonnement
 */
export const activateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { monthlyPrice, durationMonths, notes } = req.body;

    // Validation companyId
    if (!companyId) {
      res.status(400).json({ message: 'ID de l\'organisation requis' });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }
    
    const adminUserId: string = req.user.userId;
    const validCompanyId: string = companyId;

    // Validation
    if (typeof monthlyPrice !== 'number' || monthlyPrice <= 0) {
      res.status(400).json({ message: 'Le prix mensuel doit être un nombre positif' });
      return;
    }

    if (!durationMonths || typeof durationMonths !== 'number' || durationMonths <= 0) {
      res.status(400).json({ message: 'La durée en mois doit être un nombre positif' });
      return;
    }

    // Vérifier que l'organisation existe
    const company = await prisma.company.findUnique({
      where: { id: validCompanyId },
    });

    if (!company) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }

    // Calculer les dates de l'abonnement (mois calendaires en tenant compte du timezone)
    const now = new Date();
    const subscriptionEndDate = DateHelpers.addMonthsInTimezone(now, durationMonths, company.country);

    // Calculer les jours pour l'historique
    const durationDays = Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Transaction pour mettre à jour l'organisation et créer l'historique
    const [updatedCompany, paymentRecord] = await prisma.$transaction([
      // Mettre à jour l'organisation
      prisma.company.update({
        where: { id: validCompanyId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt: subscriptionEndDate,
          monthlyPrice: new Decimal(monthlyPrice),
          notes: notes || null,
          isActive: true, // Débloquer l'organisation
          trialEndsAt: null, // Effacer la date de fin d'essai
        },
      }),
      // Créer l'enregistrement dans l'historique des paiements
      prisma.paymentHistory.create({
        data: {
          companyId: validCompanyId,
          amount: new Decimal(monthlyPrice),
          durationDays,
          subscriptionStartDate: now,
          subscriptionEndDate,
          notes: notes || null,
          createdBy: adminUserId,
        },
      }),
    ]);

    console.log(`✅ Abonnement activé pour ${company.name}: ${monthlyPrice}€ pour ${durationDays} jours`);

    res.json({
      message: 'Abonnement activé avec succès',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        subscriptionStatus: updatedCompany.subscriptionStatus,
        subscriptionEndsAt: updatedCompany.subscriptionEndsAt,
        monthlyPrice: Number(updatedCompany.monthlyPrice),
      },
      payment: {
        id: paymentRecord.id,
        amount: Number(paymentRecord.amount),
        durationDays: paymentRecord.durationDays,
        subscriptionStartDate: paymentRecord.subscriptionStartDate,
        subscriptionEndDate: paymentRecord.subscriptionEndDate,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'activation de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'activation de l\'abonnement' });
  }
};

/**
 * Renouveler un abonnement existant
 * Ajoute la durée à la date de fin actuelle
 */
export const renewSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { monthlyPrice, durationMonths, notes } = req.body;

    // Validation companyId
    if (!companyId) {
      res.status(400).json({ message: 'ID de l\'organisation requis' });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }
    
    const adminUserId: string = req.user.userId;
    const validCompanyId: string = companyId;

    // Validation
    if (typeof monthlyPrice !== 'number' || monthlyPrice <= 0) {
      res.status(400).json({ message: 'Le prix mensuel doit être un nombre positif' });
      return;
    }

    if (!durationMonths || typeof durationMonths !== 'number' || durationMonths <= 0) {
      res.status(400).json({ message: 'La durée en mois doit être un nombre positif' });
      return;
    }

    // Vérifier que l'organisation existe
    const company = await prisma.company.findUnique({
      where: { id: validCompanyId },
    });

    if (!company) {
      res.status(404).json({ message: 'Organisation non trouvée' });
      return;
    }

    // Calculer les dates de l'abonnement (mois calendaires)
    // Si l'abonnement est encore actif, on ajoute à partir de la date de fin actuelle
    // Sinon, on commence à partir de maintenant
    const now = new Date();
    let startDate = now;
    
    if (company.subscriptionEndsAt && company.subscriptionEndsAt > now) {
      startDate = company.subscriptionEndsAt;
    }
    
    const subscriptionEndDate = DateHelpers.addMonthsInTimezone(startDate, durationMonths, company.country);

    // Calculer les jours pour l'historique
    const durationDays = Math.ceil((subscriptionEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Transaction pour mettre à jour l'organisation et créer l'historique
    const [updatedCompany, paymentRecord] = await prisma.$transaction([
      // Mettre à jour l'organisation
      prisma.company.update({
        where: { id: validCompanyId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt: subscriptionEndDate,
          monthlyPrice: new Decimal(monthlyPrice),
          notes: notes || company.notes,
          isActive: true,
        },
      }),
      // Créer l'enregistrement dans l'historique des paiements
      prisma.paymentHistory.create({
        data: {
          companyId: validCompanyId,
          amount: new Decimal(monthlyPrice),
          durationDays,
          subscriptionStartDate: startDate,
          subscriptionEndDate,
          notes: notes || null,
          createdBy: adminUserId,
        },
      }),
    ]);

    console.log(`✅ Abonnement renouvelé pour ${company.name}: ${monthlyPrice}€ pour ${durationMonths} mois`);

    res.json({
      message: 'Abonnement renouvelé avec succès',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        subscriptionStatus: updatedCompany.subscriptionStatus,
        subscriptionEndsAt: updatedCompany.subscriptionEndsAt,
        monthlyPrice: Number(updatedCompany.monthlyPrice),
      },
      payment: {
        id: paymentRecord.id,
        amount: Number(paymentRecord.amount),
        durationDays: paymentRecord.durationDays,
        subscriptionStartDate: paymentRecord.subscriptionStartDate,
        subscriptionEndDate: paymentRecord.subscriptionEndDate,
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors du renouvellement de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors du renouvellement de l\'abonnement' });
  }
};

/**
 * Récupérer l'historique des paiements d'une organisation
 */
export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const payments = await prisma.paymentHistory.findMany({
      where: { companyId },
      orderBy: { paymentDate: 'desc' },
      select: {
        id: true,
        amount: true,
        durationDays: true,
        paymentDate: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        notes: true,
        createdAt: true,
      },
    });

    res.json(
      payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      }))
    );
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique des paiements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des paiements' });
  }
};

/**
 * Mettre à jour les notes d'un abonnement
 */
export const updateSubscriptionNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { notes } = req.body;

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { notes },
      select: {
        id: true,
        name: true,
        notes: true,
      },
    });

    res.json({
      message: 'Notes mises à jour avec succès',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des notes:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notes' });
  }
};
