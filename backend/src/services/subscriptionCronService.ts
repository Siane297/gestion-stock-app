import cron from 'node-cron';
import prisma from '../config/database.js';
import { logger } from '../config/logger.js';

// Mapping des pays vers leurs fuseaux horaires
const countryTimezones: Record<string, string> = {
  // Afrique
  'Djibouti': 'Africa/Djibouti',
  'Comores': 'Indian/Comoro',
  'Madagascar': 'Indian/Antananarivo',
  'France': 'Europe/Paris',
  'Belgique': 'Europe/Brussels',
  'Suisse': 'Europe/Zurich',
  'Canada': 'America/Toronto',
  'Maroc': 'Africa/Casablanca',
  'Algérie': 'Africa/Algiers',
  'Tunisie': 'Africa/Tunis',
  'Sénégal': 'Africa/Dakar',
  'Côte d\'Ivoire': 'Africa/Abidjan',
  'Cameroun': 'Africa/Douala',
  'République Démocratique du Congo': 'Africa/Kinshasa',
  'Gabon': 'Africa/Libreville',
  'Mali': 'Africa/Bamako',
  'Burkina Faso': 'Africa/Ouagadougou',
  'Niger': 'Africa/Niamey',
  'Togo': 'Africa/Lome',
  'Bénin': 'Africa/Porto-Novo',
  'Mauritanie': 'Africa/Nouakchott',
  'Guinée': 'Africa/Conakry',
  'Rwanda': 'Africa/Kigali',
  'Burundi': 'Africa/Bujumbura',
  'Maurice': 'Indian/Mauritius',
  'Seychelles': 'Indian/Mahe',
  'Éthiopie': 'Africa/Addis_Ababa',
  'Kenya': 'Africa/Nairobi',
  'Tanzanie': 'Africa/Dar_es_Salaam',
  'Ouganda': 'Africa/Kampala',
  'Somalie': 'Africa/Mogadishu',
  'Érythrée': 'Africa/Asmara',
  // Europe
  'Allemagne': 'Europe/Berlin',
  'Espagne': 'Europe/Madrid',
  'Italie': 'Europe/Rome',
  'Portugal': 'Europe/Lisbon',
  'Royaume-Uni': 'Europe/London',
  'Pays-Bas': 'Europe/Amsterdam',
  'Luxembourg': 'Europe/Luxembourg',
  // Moyen-Orient
  'Émirats Arabes Unis': 'Asia/Dubai',
  'Arabie Saoudite': 'Asia/Riyadh',
  'Qatar': 'Asia/Qatar',
  'Koweït': 'Asia/Kuwait',
  'Bahreïn': 'Asia/Bahrain',
  'Oman': 'Asia/Muscat',
  'Liban': 'Asia/Beirut',
  'Jordanie': 'Asia/Amman',
  // Amérique
  'États-Unis': 'America/New_York',
  'Haïti': 'America/Port-au-Prince',
  // Default
  'default': 'UTC',
};

/**
 * Obtenir le fuseau horaire d'un pays
 */
const getTimezoneForCountry = (country: string): string => {
  return countryTimezones[country] ?? 'UTC';
};

/**
 * Vérifier si minuit est passé dans le fuseau horaire d'un pays
 */
const isMidnightInTimezone = (timezone: string): boolean => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  };
  const hourInTimezone = parseInt(new Intl.DateTimeFormat('fr-FR', options).format(now), 10);
  // On considère "minuit" comme entre 0h et 1h
  return hourInTimezone === 0;
};

/**
 * Vérifier et mettre à jour les abonnements expirés
 * Cette fonction est appelée toutes les heures par le cron
 */
export const checkExpiredSubscriptions = async (): Promise<void> => {
  try {
    const now = new Date();
    logger.info('[SUBSCRIPTION CRON] Vérification des abonnements expirés...');

    // Récupérer toutes les organisations avec leur pays
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
        subscriptionStatus: {
          in: ['TRIAL', 'ACTIVE'],
        },
      },
      select: {
        id: true,
        name: true,
        country: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
      },
    });

    let expiredCount = 0;

    for (const company of companies) {
      const timezone = getTimezoneForCountry(company.country);
      
      // Vérifier si c'est le bon moment pour vérifier cette organisation (minuit dans son fuseau)
      // Ou si elle est déjà expirée (dans ce cas, on la bloque immédiatement)
      let isExpired = false;
      let expirationDate: Date | null = null;

      if (company.subscriptionStatus === 'TRIAL' && company.trialEndsAt) {
        expirationDate = company.trialEndsAt;
        isExpired = company.trialEndsAt <= now;
      } else if (company.subscriptionStatus === 'ACTIVE' && company.subscriptionEndsAt) {
        expirationDate = company.subscriptionEndsAt;
        isExpired = company.subscriptionEndsAt <= now;
      }

      if (isExpired && expirationDate) {
        // Mettre à jour l'organisation comme expirée
        await prisma.company.update({
          where: { id: company.id },
          data: {
            subscriptionStatus: 'EXPIRED',
            isActive: false,
          },
        });

        expiredCount++;
        logger.warn(
          `[SUBSCRIPTION CRON] Organisation ${company.name} expirée (${company.subscriptionStatus} terminé le ${expirationDate.toISOString()}, timezone: ${timezone})`
        );
      }
    }

    if (expiredCount > 0) {
      logger.info(`[SUBSCRIPTION CRON] ${expiredCount} organisation(s) marquée(s) comme expirée(s)`);
    } else {
      logger.info('[SUBSCRIPTION CRON] Aucune organisation expirée');
    }
  } catch (error) {
    logger.error('[SUBSCRIPTION CRON] Erreur lors de la vérification des abonnements:', error);
  }
};

/**
 * Initialiser le cron job pour vérifier les abonnements
 * Exécuté toutes les heures pour gérer les différents fuseaux horaires
 */
export const initSubscriptionCron = (): void => {
  // Exécuter toutes les heures à la minute 0 (ex: 00:00, 01:00, 02:00, ...)
  cron.schedule('0 * * * *', async () => {
    logger.info('[SUBSCRIPTION CRON] Exécution du cron de vérification des abonnements');
    await checkExpiredSubscriptions();
  });

  logger.info('[SUBSCRIPTION CRON] Cron de vérification des abonnements initialisé (toutes les heures)');

  // Exécuter une première fois au démarrage du serveur
  setTimeout(async () => {
    logger.info('[SUBSCRIPTION CRON] Vérification initiale des abonnements au démarrage');
    await checkExpiredSubscriptions();
  }, 5000); // Attendre 5 secondes après le démarrage
};

export { getTimezoneForCountry };
