/**
 * Utilitaires pour la gestion des dates basées sur le fuseau horaire
 */

import { getTimezoneByCountry } from './countryTimezone.js';

/**
 * Obtient les dates de début et fin du jour actuel selon le fuseau du pays
 * @param country - Pays de l'organisation (optionnel, par défaut utilise l'heure locale)
 * @returns {start: Date, end: Date} - Début (00:00:00) et fin (23:59:59) du jour
 */
export const getTodayDateRange = (country?: string): { start: Date; end: Date } => {
  if (country) {
    // Utiliser le fuseau horaire du pays
    const timezone = getTimezoneByCountry(country);
    const now = new Date();
    
    // Obtenir la date actuelle dans le fuseau du pays
    const todayInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const year = todayInTimezone.getFullYear();
    const month = todayInTimezone.getMonth();
    const day = todayInTimezone.getDate();
    
    // Créer les dates de début et fin dans le fuseau local du serveur
    // mais correspondant au jour dans le fuseau du pays
    const start = new Date(year, month, day, 0, 0, 0, 0);
    const end = new Date(year, month, day, 23, 59, 59, 999);
    
    return { start, end };
  } else {
    // Heure locale du serveur (comportement par défaut)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    const start = new Date(year, month, day, 0, 0, 0, 0);
    const end = new Date(year, month, day, 23, 59, 59, 999);
    
    return { start, end };
  }
};

/**
 * Obtient les dates de début et fin pour une date spécifique selon le fuseau du pays
 * @param date - La date de référence
 * @param country - Pays de l'organisation (optionnel)
 * @returns {start: Date, end: Date} - Début (00:00:00) et fin (23:59:59) du jour
 */
export const getDateRangeForDate = (date: Date, country?: string): { start: Date; end: Date } => {
  if (country) {
    const timezone = getTimezoneByCountry(country);
    
    // Obtenir la date dans le fuseau du pays
    const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const year = dateInTimezone.getFullYear();
    const month = dateInTimezone.getMonth();
    const day = dateInTimezone.getDate();
    
    const start = new Date(year, month, day, 0, 0, 0, 0);
    const end = new Date(year, month, day, 23, 59, 59, 999);
    
    return { start, end };
  } else {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const start = new Date(year, month, day, 0, 0, 0, 0);
    const end = new Date(year, month, day, 23, 59, 59, 999);
    
    return { start, end };
  }
};

/**
 * Obtient la date normalisée du jour actuel selon le fuseau horaire du pays
 * Cette fonction retourne une date à 00:00:00.000Z correspondant au jour actuel
 * dans le fuseau du pays, compatible avec les dates stockées dans les bilans
 * @param country - Pays de l'organisation (optionnel)
 * @returns Date - Date normalisée du jour actuel
 */
export const getTodayNormalizedDate = (country?: string): Date => {
  if (country) {
    const timezone = getTimezoneByCountry(country);
    const now = new Date();
    
    // Obtenir la date actuelle dans le fuseau du pays
    const todayInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const year = todayInTimezone.getFullYear();
    const month = todayInTimezone.getMonth();
    const day = todayInTimezone.getDate();
    
    // Retourner une date normalisée à 00:00:00.000Z pour ce jour
    return new Date(year, month, day, 0, 0, 0, 0);
  } else {
    // Heure locale du serveur (comportement par défaut)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    
    return new Date(year, month, day, 0, 0, 0, 0);
  }
};

/**
 * Normalise une date "calendar" (sans heure) pour éviter les problèmes de timezone
 * Utilisé pour les dates de naissance, dates de congé, etc.
 * @param dateInput - String de date (ex: "2025-12-25") ou objet Date
 * @returns Date - Objet Date normalisé (minuit UTC de la date spécifiée)
 * 
 * Exemples:
 * - Input: "2025-12-25" -> Output: Date représentant 2025-12-25 à 00:00 UTC
 * - Input: "2025-12-31T21:00:00.000Z" -> Output: Date représentant 2025-12-31 à 00:00 UTC
 * 
 * IMPORTANT: Cette fonction extrait la date "calendar" (année, mois, jour) en ignorant
 * complètement l'heure et le timezone. Cela évite les décalages d'un jour causés par
 * les conversions timezone.
 */
export const normalizeCalendarDate = (dateInput: string | Date): Date => {
  let year: number, month: number, day: number;
  
  if (typeof dateInput === 'string') {
    // Si la string est au format ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss), extraire les composants
    const isoMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1]!, 10);
      month = parseInt(isoMatch[2]!, 10) - 1; // JavaScript months are 0-indexed  
      day = parseInt(isoMatch[3]!, 10);
    } else {
      // Format non-ISO, créer un objet Date et extraire les composants
      const dateObj = new Date(dateInput);
      year = dateObj.getFullYear();
      month = dateObj.getMonth();
      day = dateObj.getDate();
    }
  } else {
    // Pour un objet Date, extraire les composants en heure LOCALE (pas UTC)
    // Cela garantit que si l'utilisateur sélectionne "31 décembre" dans son timezone,
    // on stocke bien "31 décembre" et pas "30 décembre" après conversion UTC
    year = dateInput.getFullYear();
    month = dateInput.getMonth();
    day = dateInput.getDate();
  }
  
  // Créer une nouvelle date normalisée en UTC à minuit pour ce jour calendaire
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * Obtient les dates de début et fin pour une date spécifique en heure locale
 * @param date - La date de référence
 * @returns {start: Date, end: Date} - Début (00:00:00) et fin (23:59:59) du jour
 */
export const getDateRange = (date: Date): { start: Date; end: Date } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const start = new Date(year, month, day, 0, 0, 0, 0);
  const end = new Date(year, month, day, 23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Obtient les dates de début et fin d'hier en heure locale
 * @returns {start: Date, end: Date} - Début (00:00:00) et fin (23:59:59) d'hier
 */
export const getYesterdayDateRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return getDateRange(yesterday);
};

/**
 * Formate une date en français pour les logs
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
 * Formate une date/heure avec le fuseau horaire du pays
 * @param date - La date/heure à formater 
 * @param country - Pays pour déterminer le fuseau horaire
 * @returns string - Heure formatée dans le bon fuseau horaire
 */
export const formatTimeWithTimezone = (date: Date | string, country?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (country) {
    const timezone = getTimezoneByCountry(country);
    return dateObj.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: timezone
    });
  }
  
  // Par défaut, utilise l'heure locale du serveur
  return dateObj.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

/**
 * Formate une date avec le fuseau horaire du pays
 * @param date - La date à formater
 * @param country - Pays pour déterminer le fuseau horaire
 * @returns string - Date formatée dans le bon fuseau horaire
 */
export const formatDateWithTimezone = (date: Date | string, country?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (country) {
    const timezone = getTimezoneByCountry(country);
    return dateObj.toLocaleDateString('fr-FR', {
      timeZone: timezone
    });
  }
  
  // Par défaut, utilise l'heure locale du serveur
  return dateObj.toLocaleDateString('fr-FR');
};
