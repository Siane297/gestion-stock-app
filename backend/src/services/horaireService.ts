import type { PrismaClient } from '@prisma/client';
import type { StatutPointage } from '@prisma/client';
import { getTimezoneByCountry } from '../utils/countryTimezone.js';
import { getTodayDateRange } from '../utils/dateUtils.js';

/**
 * Service pour calculer les durées de travail et les statuts de pointage
 */

// Convertir une heure "HH:mm" en minutes depuis minuit
export const convertirHeureEnMinutes = (heure: string): number => {
  const parts = heure.split(':').map(Number);
  const heures = parts[0] || 0;
  const minutes = parts[1] || 0;
  return heures * 60 + minutes;
};

// Convertir des minutes en format "HH:mm"
export const convertirMinutesEnHeure = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Extraire l'heure au format "HH:mm" d'un DateTime avec support fuseau horaire
export const extraireHeureDeDateTime = (date: Date, timezone?: string): string => {
  if (timezone) {
    // Utiliser le fuseau horaire spécifié
    const localTime = date.toLocaleString('en-US', { 
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    return localTime;
  } else {
    // Comportement par défaut (heure locale du serveur)
    const heures = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${heures}:${minutes}`;
  }
};

/**
 * Calculer le statut d'un pointage d'entrée
 * @param heurePointage - Heure du pointage au format "HH:mm"
 * @returns StatutPointage (PRESENT, EN_RETARD)
 */
export const calculerStatutEntree = async (
  tenantPrisma: PrismaClient,
  heurePointage: string
): Promise<StatutPointage> => {
  // Récupérer la configuration active
  const config = await tenantPrisma.configurationHoraire.findFirst({
    where: { isActive: true },
  });

  if (!config) {
    // Par défaut, considérer comme "A_L_HEURE" si pas de config
    return 'A_L_HEURE';
  }

  const minutesPointage = convertirHeureEnMinutes(heurePointage);
  const minutesDebut = convertirHeureEnMinutes(config.heureDebut);
  const minutesLimiteRetard = minutesDebut + (config.toleranceRetardMinutes ?? 0);

  if (minutesPointage <= minutesLimiteRetard) {
    return 'A_L_HEURE';
  } else {
    return 'EN_RETARD';
  }
};

/**
 * Vérifier si un employé a déjà un pointage du type spécifié aujourd'hui
 * @param employeeId - ID de l'employé
 * @param type - Type de pointage (ENTREE ou SORTIE)
 * @param date - Date du jour (optionnel, par défaut aujourd'hui)
 * @param country - Pays de l'organisation pour déterminer le fuseau horaire
 * @returns true si le pointage existe déjà, false sinon
 */
export const verifierPointageExistant = async (
  tenantPrisma: PrismaClient,
  employeeId: string,
  type: 'ENTREE' | 'SORTIE',
  date?: Date,
  country?: string
): Promise<boolean> => {
  if (date) {
    // Utiliser la date spécifiée avec plage complète du jour
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const debutJour = new Date(year, month, day, 0, 0, 0, 0);
    const finJour = new Date(year, month, day, 23, 59, 59, 999);

    const pointageExistant = await tenantPrisma.attendance.findFirst({
      where: {
        employeeId,
        type,
        createdAt: {
          gte: debutJour,
          lte: finJour,
        },
      },
    });

    return pointageExistant !== null;
  } else {
    // Utiliser la date d'aujourd'hui avec le bon fuseau horaire
    const { start: debutJour, end: finJour } = getTodayDateRange(country);

    const pointageExistant = await tenantPrisma.attendance.findFirst({
      where: {
        employeeId,
        type,
        createdAt: {
          gte: debutJour,
          lte: finJour,
        },
      },
    });

    return pointageExistant !== null;
  }
};

/**
 * Calculer la durée de travail entre l'entrée et la sortie
 * @param employeeId - ID de l'employé
 * @param date - Date du jour
 * @returns Durée en minutes (incluant la soustraction de la pause)
 */
export const calculerDureeTravail = async (
  tenantPrisma: PrismaClient,
  employeeId: string,
  date: Date
): Promise<number | null> => {
  // Créer les dates de début et fin du jour
  const debutJour = new Date(date);
  debutJour.setHours(0, 0, 0, 0);
  
  const finJour = new Date(date);
  finJour.setHours(23, 59, 59, 999);

  // Récupérer l'entrée et la sortie du jour
  const [entree, sortie] = await Promise.all([
    tenantPrisma.attendance.findFirst({
      where: {
        employeeId,
        type: 'ENTREE',
        createdAt: { gte: debutJour, lte: finJour },
      },
      orderBy: { createdAt: 'asc' },
    }),
    tenantPrisma.attendance.findFirst({
      where: {
        employeeId,
        type: 'SORTIE',
        createdAt: { gte: debutJour, lte: finJour },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Si pas d'entrée ou de sortie, impossible de calculer
  if (!entree || !sortie) {
    return null;
  }

  // Récupérer la configuration pour la durée de pause
  const config = await tenantPrisma.configurationHoraire.findFirst({
    where: { isActive: true },
  });

  // Note: La durée de pause n'est plus utilisée ici
  // Le calcul se fait maintenant dans bilanPresenceService avec heureDebutPause/heureFinPause

  // Ignorer les secondes - ne compter que heures et minutes
  // Créer des dates sans les secondes
  const entreeMinutes = new Date(entree.createdAt);
  entreeMinutes.setSeconds(0, 0);
  
  const sortieMinutes = new Date(sortie.createdAt);
  sortieMinutes.setSeconds(0, 0);

  // Calculer la différence en minutes (sans les secondes)
  const diffMs = sortieMinutes.getTime() - entreeMinutes.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Note: Cette fonction est obsolète, utilisez bilanPresenceService à la place
  return diffMinutes;
};

/**
 * Mettre à jour la durée de travail pour un employé à une date donnée
 * Cette fonction calcule la durée de travail entre l'entrée et la sortie
 * NOTE: La durée est maintenant stockée dans bilanPresence, pas dans attendance
 * @param employeeId - ID de l'employé
 * @param date - Date du jour
 */
export const mettreAJourDureeTravail = async (
  tenantPrisma: PrismaClient,
  employeeId: string,
  date: Date
): Promise<number | null> => {
  return await calculerDureeTravail(tenantPrisma, employeeId, date);
};

/**
 * Vérifier si on est après l'heure de fin de travail configurée
 * @param tenantPrisma - Connexion Prisma du tenant
 * @param country - Pays de l'organisation pour déterminer le fuseau horaire
 * @returns true si on est après l'heure de fin, false sinon
 */
export const estApresHeureFin = async (
  tenantPrisma: PrismaClient,
  country?: string
): Promise<boolean> => {
  const config = await tenantPrisma.configurationHoraire.findFirst({
    where: { isActive: true },
  });

  if (!config) {
    return false;
  }

  const maintenant = new Date();
  const timezone = country ? getTimezoneByCountry(country) : undefined;
  const heureActuelle = extraireHeureDeDateTime(maintenant, timezone);
  const minutesActuelles = convertirHeureEnMinutes(heureActuelle);
  const minutesFin = convertirHeureEnMinutes(config.heureFin);

  return minutesActuelles > minutesFin;
};

/**
 * @deprecated Cette fonction est obsolète. Utiliser getBilansPresence de bilanPresenceService
 * Obtenir un résumé des pointages d'un employé pour une date
 * @param employeeId - ID de l'employé
 * @param date - Date à analyser
 * @param country - Pays de l'organisation pour déterminer le fuseau horaire
 */
export const obtenirResumePointage = async (
  tenantPrisma: PrismaClient,
  employeeId: string,
  date: Date,
  country?: string
) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const debutJour = new Date(year, month, day, 0, 0, 0, 0);
  const finJour = new Date(year, month, day, 23, 59, 59, 999);

  const pointages = await tenantPrisma.attendance.findMany({
    where: {
      employeeId,
      createdAt: { gte: debutJour, lte: finJour },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Récupérer le bilan de présence pour les détails
  const bilan = await tenantPrisma.bilanPresence.findFirst({
    where: {
      employeeId,
      createdAt: { gte: debutJour, lte: finJour },
    },
  });

  const entree = pointages.find((p: any) => p.type === 'ENTREE');
  const sortie = pointages.find((p: any) => p.type === 'SORTIE');
  
  const timezone = country ? getTimezoneByCountry(country) : undefined;

  return {
    date,
    entree: entree
      ? {
          heure: extraireHeureDeDateTime(entree.createdAt, timezone),
          timestamp: entree.createdAt,
        }
      : null,
    sortie: sortie
      ? {
          heure: extraireHeureDeDateTime(sortie.createdAt, timezone),
          timestamp: sortie.createdAt,
        }
      : null,
    statut: bilan?.statut || null,
    dureeTravailMinutes: bilan?.dureeTravailMinutes || null,
    dureeTravailFormatee: bilan?.dureeTravailMinutes
      ? convertirMinutesEnHeure(bilan.dureeTravailMinutes)
      : null,
  };
};
