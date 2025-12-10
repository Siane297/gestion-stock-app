/**
 * Utilitaires pour gérer les fuseaux horaires
 * Timezone: Africa/Nairobi (EAT - UTC+3)
 */

/**
 * Obtenir la date/heure actuelle en heure locale (EAT)
 */
export const getLocalNow = (): Date => {
  return new Date();
};

/**
 * Convertir une date UTC en heure locale EAT
 */
export const toLocalTime = (utcDate: Date): Date => {
  return new Date(utcDate.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
};

/**
 * Créer une date à partir d'une chaîne en assumant qu'elle est en heure locale
 */
export const parseLocalDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Formater une date en heure locale pour l'affichage
 */
export const formatLocalDateTime = (date: Date): string => {
  return date.toLocaleString('fr-FR', {
    timeZone: 'Africa/Nairobi',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formater uniquement l'heure en heure locale
 */
export const formatLocalTime = (date: Date): string => {
  return date.toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Obtenir le début de la journée en heure locale
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  return local;
};

/**
 * Obtenir la fin de la journée en heure locale
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const local = new Date(date);
  local.setHours(23, 59, 59, 999);
  return local;
};
