import { PrismaClient } from '@prisma/client';
import prisma from '../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';
import { DateHelpers } from '../utils/dateHelpers.js';

export class SubscriptionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getDetails(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        country: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        monthlyPrice: true,
        currency: true,
        notes: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!company) {
      throw new Error('Organisation non trouvée');
    }

    // Calculer les jours restants
    let daysRemaining: number | null = null;
    const now = new Date();

    if (company.subscriptionStatus === 'TRIAL' && company.trialEndsAt) {
      daysRemaining = Math.ceil((company.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (company.subscriptionStatus === 'ACTIVE' && company.subscriptionEndsAt) {
      daysRemaining = Math.ceil((company.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      ...company,
      monthlyPrice: company.monthlyPrice ? Number(company.monthlyPrice) : null,
      daysRemaining: daysRemaining !== null ? Math.max(0, daysRemaining) : null,
    };
  }

  async activate(data: {
    companyId: string;
    adminUserId: string;
    monthlyPrice: number;
    durationMonths: number;
    notes?: string;
  }) {
    const { companyId, monthlyPrice, durationMonths, notes, adminUserId } = data;

    // Vérifier que l'organisation existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Organisation non trouvée');
    }

    // Calculer les dates de l'abonnement
    const now = new Date();
    const subscriptionEndDate = DateHelpers.addMonthsInTimezone(now, durationMonths, company.country);
    
    // Calculer les jours pour l'historique
    const durationDays = Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Transaction
    const [updatedCompany, paymentRecord] = await this.prisma.$transaction([
      this.prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt: subscriptionEndDate,
          monthlyPrice: new Decimal(monthlyPrice),
          notes: notes || null,
          isActive: true,
          trialEndsAt: null,
        },
      }),
      this.prisma.paymentHistory.create({
        data: {
          companyId: companyId,
          amount: new Decimal(monthlyPrice),
          durationDays,
          subscriptionStartDate: now,
          subscriptionEndDate,
          notes: notes || null,
          createdBy: adminUserId,
        },
      }),
    ]);

    console.log(`✅ Abonnement activé pour ${company.name}: ${monthlyPrice} ${company.currency} pour ${durationDays} jours`);

    return {
      message: 'Abonnement activé avec succès',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        subscriptionStatus: updatedCompany.subscriptionStatus,
        subscriptionEndsAt: updatedCompany.subscriptionEndsAt,
        monthlyPrice: Number(updatedCompany.monthlyPrice),
        currency: updatedCompany.currency,
      },
      payment: {
        id: paymentRecord.id,
        amount: Number(paymentRecord.amount),
        durationDays: paymentRecord.durationDays,
        subscriptionStartDate: paymentRecord.subscriptionStartDate,
        subscriptionEndDate: paymentRecord.subscriptionEndDate,
      },
    };
  }

  async renew(data: {
    companyId: string;
    adminUserId: string;
    monthlyPrice: number;
    durationMonths: number;
    notes?: string;
  }) {
    const { companyId, monthlyPrice, durationMonths, notes, adminUserId } = data;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Organisation non trouvée');
    }

    const now = new Date();
    let startDate = now;
    
    if (company.subscriptionEndsAt && company.subscriptionEndsAt > now) {
      startDate = company.subscriptionEndsAt;
    }
    
    const subscriptionEndDate = DateHelpers.addMonthsInTimezone(startDate, durationMonths, company.country);
    const durationDays = Math.ceil((subscriptionEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const [updatedCompany, paymentRecord] = await this.prisma.$transaction([
      this.prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionEndsAt: subscriptionEndDate,
          monthlyPrice: new Decimal(monthlyPrice),
          notes: notes || company.notes,
          isActive: true,
        },
      }),
      this.prisma.paymentHistory.create({
        data: {
          companyId: companyId,
          amount: new Decimal(monthlyPrice),
          durationDays,
          subscriptionStartDate: startDate,
          subscriptionEndDate,
          notes: notes || null,
          createdBy: adminUserId,
        },
      }),
    ]);

    console.log(`✅ Abonnement renouvelé pour ${company.name}: ${monthlyPrice} ${company.currency} pour ${durationMonths} mois`);

    return {
      message: 'Abonnement renouvelé avec succès',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        subscriptionStatus: updatedCompany.subscriptionStatus,
        subscriptionEndsAt: updatedCompany.subscriptionEndsAt,
        monthlyPrice: Number(updatedCompany.monthlyPrice),
        currency: updatedCompany.currency,
      },
      payment: {
        id: paymentRecord.id,
        amount: Number(paymentRecord.amount),
        durationDays: paymentRecord.durationDays,
        subscriptionStartDate: paymentRecord.subscriptionStartDate,
        subscriptionEndDate: paymentRecord.subscriptionEndDate,
      },
    };
  }

  async getHistory(companyId: string) {
    const payments = await this.prisma.paymentHistory.findMany({
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

    return payments.map((p: any) => ({
      ...p,
      amount: Number(p.amount),
    }));
  }

  async getPaymentWithDetails(paymentId: string) {
    const payment = await this.prisma.paymentHistory.findUnique({
      where: { id: paymentId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            emailOrganisation: true,
            telephoneOrganisation: true,
            country: true,
            logo: true,
            currency: true,
          }
        }
      }
    });

    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    // Récupérer les infos de l'entreprise émettrice (ZawadiCom / SuperAdmin info)
    const issuerInfo = {
      name: 'ZawadiCom',
      address: 'Moroni, Comores',
      phone: '+269 334 56 78',
      email: 'contact@zawadicom.com',
      logo: undefined 
    };

    return {
      payment: {
        id: payment.id,
        numero: `RE-${payment.id.substring(0, 8).toUpperCase()}`,
        amount: Number(payment.amount),
        durationMonths: Math.round(payment.durationDays / 30), 
        date: payment.paymentDate,
        startDate: payment.subscriptionStartDate,
        endDate: payment.subscriptionEndDate,
        currency: payment.company.currency || 'KMF'
      },
      organization: {
        name: payment.company.name,
        email: payment.company.emailOrganisation || payment.company.email,
        phone: payment.company.telephoneOrganisation,
        country: payment.company.country
      },
      company: issuerInfo
    };
  }

  async updateNotes(companyId: string, notes: string) {
    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: { notes },
      select: {
        id: true,
        name: true,
        notes: true,
      },
    });

    return {
      message: 'Notes mises à jour avec succès',
      company: updatedCompany,
    };
  }
}
