/**
 * Utilitaires pour la gestion des dates côté frontend
 */

/**
 * Formate une date en français pour l'affichage
 * @param date - La date à formater
 * @returns string - Date formatée en français
 */
export const formatDateFr = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate une date courte en français
 * @param date - La date à formater
 * @returns string - Date formatée en français (ex: "14 novembre")
 */
export const formatDateShortFr = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long'
  });
};

/**
 * Obtient la date d'aujourd'hui à minuit (heure locale)
 * @returns Date - Aujourd'hui à 00:00:00
 */
export const getTodayStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

/**
 * Vérifie si une date est aujourd'hui (même jour)
 * @param date - La date à vérifier
 * @returns boolean - True si c'est aujourd'hui
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Formate une heure avec timezone spécifique
 * @param date - La date/heure à formater
 * @param timezone - Le timezone à utiliser (ex: 'Europe/Paris')
 * @returns string - Heure formatée (ex: "14:30")
 */
export const formatTimeWithTimezone = (date: Date | string, timezone?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (timezone) {
    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    });
  }
  
  return dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date avec timezone spécifique
 * @param date - La date à formater
 * @param timezone - Le timezone à utiliser (ex: 'Europe/Paris')
 * @returns string - Date formatée (ex: "14/11/2024")
 */
export const formatDateWithTimezone = (date: Date | string, timezone?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (timezone) {
    return dateObj.toLocaleDateString('fr-FR', {
      timeZone: timezone
    });
  }
  
  return dateObj.toLocaleDateString('fr-FR');
};
