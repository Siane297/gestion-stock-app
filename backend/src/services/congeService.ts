import type { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

/**
 * Service de gestion des congés
 */

/**
 * Créer une demande de congé
 */
export const creerConge = async (
  tenantPrisma: PrismaClient,
  data: {
    employeId: string;
    typeCongeId: string;
    dateDebut: Date;
    dateFin: Date;
    raison?: string;
    documentUrl?: string;
  }
) => {
  // Calculer le nombre de jours
  const nombreJours = calculerNombreJours(data.dateDebut, data.dateFin);

  // Vérifier les chevauchements de congés
  const chevauchement = await verifierChevauchementConges(
    tenantPrisma,
    data.employeId,
    data.dateDebut,
    data.dateFin
  );

  if (chevauchement) {
    throw new Error('Un congé existe déjà pour cette période');
  }

  // Créer le congé
  const conge = await tenantPrisma.conge.create({
    data: {
      employeId: data.employeId,
      typeCongeId: data.typeCongeId,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      nombreJours,
      raison: data.raison,
      documentUrl: data.documentUrl,
      statut: 'EN_ATTENTE',
    },
    include: {
      employe: true,
      typeConge: true,
    },
  });

  logger.info(`Congé créé pour l'employé ${data.employeId}: ${nombreJours} jour(s)`);
  return conge;
};

/**
 * Mettre à jour le statut d'un congé
 */
export const mettreAJourStatutConge = async (
  tenantPrisma: PrismaClient,
  congeId: string,
  statut: 'APPROUVE' | 'REFUSE' | 'ANNULE'
) => {
  const conge = await tenantPrisma.conge.update({
    where: { id: congeId },
    data: { statut },
    include: {
      employe: true,
      typeConge: true,
    },
  });

  logger.info(`Statut du congé ${congeId} mis à jour: ${statut}`);
  return conge;
};

/**
 * Récupérer les congés d'un employé
 */
export const obtenirCongesEmploye = async (
  tenantPrisma: PrismaClient,
  employeId: string,
  options?: {
    statut?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }
) => {
  const where: any = { employeId };

  if (options?.statut) {
    where.statut = options.statut;
  }

  if (options?.dateDebut || options?.dateFin) {
    where.OR = [];
    if (options.dateDebut) {
      where.OR.push({ dateFin: { gte: options.dateDebut } });
    }
    if (options.dateFin) {
      where.OR.push({ dateDebut: { lte: options.dateFin } });
    }
  }

  const conges = await tenantPrisma.conge.findMany({
    where,
    include: {
      typeConge: true,
    },
    orderBy: { dateDebut: 'desc' },
  });

  return conges;
};

/**
 * Récupérer les congés dans une période donnée
 */
export const obtenirCongesParPeriode = async (
  tenantPrisma: PrismaClient,
  dateDebut: Date,
  dateFin: Date,
  options?: {
    statut?: string;
    employeId?: string;
  }
) => {
  const where: any = {
    AND: [
      { dateDebut: { lte: dateFin } },
      { dateFin: { gte: dateDebut } },
    ],
  };

  if (options?.statut) {
    where.statut = options.statut;
  }

  if (options?.employeId) {
    where.employeId = options.employeId;
  }

  const conges = await tenantPrisma.conge.findMany({
    where,
    include: {
      employe: {
        select: {
          id: true,
          matricule: true,
          fullName: true,
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      },
      typeConge: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return conges;
};

/**
 * Vérifier si un employé a un congé approuvé pour une date donnée
 */
export const verifierCongeApprouvePourDate = async (
  tenantPrisma: PrismaClient,
  employeId: string,
  date: Date
): Promise<any | null> => {
  const conge = await tenantPrisma.conge.findFirst({
    where: {
      employeId,
      statut: 'APPROUVE',
      dateDebut: { lte: date },
      dateFin: { gte: date },
    },
    include: {
      typeConge: {
        select: {
          nom: true,
          couleur: true,
        },
      },
    },
  });

  return conge;
};

/**
 * Vérifier les chevauchements de congés
 */
export const verifierChevauchementConges = async (
  tenantPrisma: PrismaClient,
  employeId: string,
  dateDebut: Date,
  dateFin: Date,
  excludeCongeId?: string
): Promise<boolean> => {
  const where: any = {
    employeId,
    statut: { in: ['EN_ATTENTE', 'APPROUVE'] },
    AND: [
      { dateDebut: { lte: dateFin } },
      { dateFin: { gte: dateDebut } },
    ],
  };

  if (excludeCongeId) {
    where.id = { not: excludeCongeId };
  }

  const conges = await tenantPrisma.conge.findMany({ where });
  return conges.length > 0;
};

/**
 * Calculer le nombre de jours entre deux dates (jours ouvrables)
 */
export const calculerNombreJours = (dateDebut: Date, dateFin: Date): number => {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  
  let count = 0;
  const current = new Date(debut);

  while (current <= fin) {
    // Exclure les week-ends (0 = dimanche, 6 = samedi)
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Récupérer tous les types de congés actifs
 */
export const obtenirTypesConges = async (tenantPrisma: PrismaClient) => {
  const types = await tenantPrisma.typeConge.findMany({
    where: { estActif: true },
    orderBy: { nom: 'asc' },
  });

  return types;
};

/**
 * Annuler un congé
 */
export const annulerConge = async (
  tenantPrisma: PrismaClient,
  congeId: string
) => {
  const conge = await tenantPrisma.conge.update({
    where: { id: congeId },
    data: { statut: 'ANNULE' },
    include: {
      employe: true,
      typeConge: true,
    },
  });

  logger.info(`Congé ${congeId} annulé`);
  return conge;
};
