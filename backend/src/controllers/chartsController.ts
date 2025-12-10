import type { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { getTimezoneByCountry } from '../utils/countryTimezone.js';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { getTodayDateRange, getTodayNormalizedDate, getDateRangeForDate } from '../utils/dateUtils.js';

/**
 * Obtenir les données pour le chart des pointages (Entrée/Sortie)
 */
export const getPointagesChart = async (req: Request, res: Response) => {
  try {
    const tenantPrisma = req.tenantPrisma;
    const { filter = 'day', date } = req.query;

    if (!tenantPrisma) {
      return res.status(400).json({
        success: false,
        message: 'Tenant non identifié',
      });
    }

    // Utiliser la date fournie ou aujourd'hui
    const baseDate = date ? new Date(date as string) : new Date();
    let startDate = new Date(baseDate);
    let categories: string[] = [];
    let groupBy: 'hour' | 'day' | 'week' = 'hour';

    // Récupérer la configuration horaire pour filtrer les heures
    const config = await tenantPrisma.configurationHoraire.findFirst({
      where: { isActive: true },
    });

    // Définir la période selon le filtre
    if (filter === 'day') {
      // Jour spécifique par heure (heures de travail uniquement)
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'hour';
      
      if (config) {
        // Extraire les heures de début et fin avec un buffer pour voir les arrivées matinales/tardives
        const configDebut = parseInt(config.heureDebut.split(':')[0]);
        const configFin = parseInt(config.heureFin.split(':')[0]) + 1;
        
        // Ajouter un buffer de 2h avant et après (min 0h, max 24h)
        const heureDebut = Math.max(0, configDebut - 2);
        const heureFin = Math.min(24, configFin + 2);
        
        const nbHeures = heureFin - heureDebut;
        categories = Array.from({ length: nbHeures }, (_, i) => `${heureDebut + i}h`);
      } else {
        categories = Array.from({ length: 24 }, (_, i) => `${i}h`);
      }
    } else if (filter === 'week') {
      // Semaine de la date fournie (du lundi au dimanche)
      const dayOfWeek = baseDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate.setDate(baseDate.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'day';
      
      // Générer les catégories (jours de la semaine)
      const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        categories.push(`${dayNames[i]} ${date.getDate()}`);
      }
    } else if (filter === 'month') {
      // Mois de la date fournie (tous les jours sauf dimanches)
      startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'day';
      
      // Nombre de jours dans le mois
      const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
      
      // Générer les catégories (dates du mois, exclure les dimanches)
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), i);
        // Exclure les dimanches (0)
        if (date.getDay() !== 0) {
          categories.push(`${i}/${baseDate.getMonth() + 1}`);
        }
      }
    }

    // Date de fin selon le filtre
    let endDate: Date;
    if (filter === 'week') {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'month') {
      endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // ----- Conversion fuseau horaire -----
    const organizationCountry = req.companyCountry || 'Kenya';
    const timezone = getTimezoneByCountry(organizationCountry);
    const utcStartDate = zonedTimeToUtc(startDate, timezone);
    const utcEndDate = zonedTimeToUtc(endDate, timezone);

    // Récupérer tous les pointages dans la période
    const pointages = await tenantPrisma.attendance.findMany({
      where: {
        createdAt: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
      select: {
        type: true,
        createdAt: true,
        heurePointage: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Initialiser les compteurs
    const entrees = new Array(categories.length).fill(0);
    const sorties = new Array(categories.length).fill(0);

    pointages.forEach((pointage: { type: string; createdAt: Date; heurePointage?: Date | null }) => {
      // Utiliser l'heure de pointage réelle si disponible, sinon createdAt
      const referenceDate = pointage.heurePointage || pointage.createdAt;
      const date = new Date(referenceDate);
      let index = 0;

      if (groupBy === 'hour') {
        // Heure locale sûre via date-fns-tz
        const zonedDate = utcToZonedTime(referenceDate, timezone);
        const hourLocal = zonedDate.getHours();
        if (config) {
          // Recalculer le début avec le même buffer que pour les catégories
          const configDebut = parseInt(config.heureDebut.split(':')[0]);
          const heureDebut = Math.max(0, configDebut - 2);
          index = hourLocal - heureDebut;
        } else {
          index = hourLocal;
        }
      } else if (groupBy === 'day') {
        if (filter === 'month') {
          // Pour le mois, trouver l'index dans categories (en excluant les dimanches)
          const dayOfMonth = date.getDate();
          const categoryLabel = `${dayOfMonth}/${date.getMonth() + 1}`;
          index = categories.indexOf(categoryLabel);
        } else {
          // Pour la semaine
          const diffTime = date.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          index = diffDays;
        }
      }

      if (index >= 0 && index < categories.length) {
        if (pointage.type === 'ENTREE') {
          entrees[index]++;
        } else if (pointage.type === 'SORTIE') {
          sorties[index]++;
        }
      }
    });

    // logger.info(`📊 Chart pointages (${filter}): ${pointages.length} pointages trouvés`);

    res.status(200).json({
      success: true,
      message: 'Données du chart récupérées avec succès',
      data: {
        categories,
        entrees,
        sorties,
      },
    });
  } catch (error: any) {
    logger.error('Erreur getPointagesChart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du chart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Obtenir les données pour le chart radial des statuts
 */
export const getStatutsChart = async (req: Request, res: Response) => {
  try {
    const tenantPrisma = req.tenantPrisma;
    const { month, date } = req.query;

    if (!tenantPrisma) {
      return res.status(400).json({
        success: false,
        message: 'Tenant non identifié',
      });
    }

    // Utiliser le mois fourni ou le mois actuel
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const monthDate = new Date(month as string);
      startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (date) {
      // Date spécifique
      const dateObj = new Date(date as string);
      const organizationCountry = req.companyCountry || 'Kenya';
      const range = getDateRangeForDate(dateObj, organizationCountry);
      startDate = range.start;
      endDate = range.end;
    } else {
      // Aujourd'hui - Utiliser une date normalisée compatible avec les bilans
      const organizationCountry = req.companyCountry || 'Kenya';
      // Aujourd'hui - Utiliser une plage de dates complète
      const { start, end } = getTodayDateRange(organizationCountry);
      
      startDate = start;
      endDate = end;
      
      // logger.info(`📅 Chart aujourd'hui (pays: ${organizationCountry}): ${todayNormalized.toISOString()}`);
    }

    // Compter les bilans par statut
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };
      
    const [presences, retards, absences, incomplets] = await Promise.all([
      tenantPrisma.bilanPresence.count({
        where: {
          ...dateFilter,
          statut: 'A_L_HEURE',
        },
      }),
      tenantPrisma.bilanPresence.count({
        where: {
          ...dateFilter,
          statut: 'EN_RETARD',
        },
      }),
      tenantPrisma.bilanPresence.count({
        where: {
          ...dateFilter,
          statut: 'ABSENT',
        },
      }),
      tenantPrisma.bilanPresence.count({
        where: {
          ...dateFilter,
          statut: 'INCOMPLET',
        },
      }),
    ]);

    const total = presences + retards + absences + incomplets;

    // logger.info(`📊 Chart statuts: ${total} bilans (${presences} présents, ${retards} retards, ${absences} absents, ${incomplets} incomplets`);

    res.status(200).json({
      success: true,
      message: 'Données du chart récupérées avec succès',
      data: {
        presences,
        retards,
        absences,
        incomplets,
        total,
      },
    });
  } catch (error: any) {
    logger.error('Erreur getStatutsChart:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du chart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
