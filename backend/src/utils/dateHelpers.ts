import { utcToZonedTime, zonedTimeToUtc, format } from 'date-fns-tz';
import { startOfDay, endOfDay, differenceInMinutes, parseISO, addDays, addMonths } from 'date-fns';
import { getTimezoneByCountry } from './countryTimezone.js';

/**
 * Helpers centralisés pour la gestion des dates et fuseaux horaires
 * 
 * RÈGLES :
 * - Stockage en base : TOUJOURS UTC (PostgreSQL DateTime le fait automatiquement)
 * - Calculs : TOUJOURS en UTC
 * - Affichage/UI : Conversion vers timezone UNIQUEMENT pour l'affichage
 */
export class DateHelpers {
  /**
   * Obtenir le début de journée (00:00:00) dans le timezone d'une organisation
   * Retourne en UTC pour requêtes base de données
   * 
   * @param date Date de référence
   * @param country Pays de l'organisation
   * @returns Date UTC correspondant à 00:00:00 dans le timezone
   */
  static getStartOfDayInTimezone(date: Date, country: string): Date {
    const timezone = getTimezoneByCountry(country);
    const zonedDate = utcToZonedTime(date, timezone);
    const startOfDayZoned = startOfDay(zonedDate);
    return zonedTimeToUtc(startOfDayZoned, timezone);
  }

  /**
   * Obtenir la fin de journée (23:59:59.999) dans le timezone d'une organisation
   * Retourne en UTC pour requêtes base de données
   * 
   * @param date Date de référence
   * @param country Pays de l'organisation
   * @returns Date UTC correspondant à 23:59:59.999 dans le timezone
   */
  static getEndOfDayInTimezone(date: Date, country: string): Date {
    const timezone = getTimezoneByCountry(country);
    const zonedDate = utcToZonedTime(date, timezone);
    const endOfDayZoned = endOfDay(zonedDate);
    return zonedTimeToUtc(endOfDayZoned, timezone);
  }

  /**
   * Obtenir "aujourd'hui" dans le timezone d'une organisation
   * Utile pour déterminer la date actuelle selon l'organisation
   * 
   * @param country Pays de l'organisation
   * @returns Date de début et fin de journée en UTC
   */
  static getTodayInTimezone(country: string): { start: Date; end: Date } {
    const now = new Date(); // UTC
    return {
      start: this.getStartOfDayInTimezone(now, country),
      end: this.getEndOfDayInTimezone(now, country),
    };
  }

  /**
   * Calculer la durée en minutes entre deux timestamps (en UTC)
   * Pas de conversion timezone nécessaire pour un calcul de durée
   * 
   * @param start Timestamp de début
   * @param end Timestamp de fin
   * @returns Durée en minutes
   */
  static getDurationMinutes(start: Date, end: Date): number {
    return differenceInMinutes(end, start);
  }

  /**
   * Extraire l'heure en minutes depuis minuit DANS le timezone de l'organisation
   * Ex: 14:30 → 870 minutes (14*60 + 30)
   * 
   * @param date Timestamp UTC
   * @param country Pays de l'organisation
   * @returns Minutes depuis minuit (0-1439)
   */
  static getMinutesSinceMidnight(date: Date, country: string): number {
    const timezone = getTimezoneByCountry(country);
    const zonedDate = utcToZonedTime(date, timezone);
    return zonedDate.getHours() * 60 + zonedDate.getMinutes();
  }

  /**
   * Formater une date/heure pour affichage selon le timezone de l'organisation
   * 
   * @param date Date UTC
   * @param country Pays de l'organisation
   * @param formatString Format date-fns (ex: 'dd/MM/yyyy HH:mm')
   * @returns String formatée dans le timezone local
   */
  static formatInTimezone(date: Date, country: string, formatString: string = 'dd/MM/yyyy HH:mm'): string {
    const timezone = getTimezoneByCountry(country);
    const zonedDate = utcToZonedTime(date, timezone);
    return format(zonedDate, formatString, { timeZone: timezone });
  }

  /**
   * Formater uniquement l'heure pour affichage
   * 
   * @param date Date UTC
   * @param country Pays de l'organisation
   * @returns Heure formatée (ex: "14:30")
   */
  static formatTimeInTimezone(date: Date, country: string): string {
    return this.formatInTimezone(date, country, 'HH:mm');
  }

  /**
   * Formater uniquement la date pour affichage
   * 
   * @param date Date UTC
   * @param country Pays de l'organisation
   * @returns Date formatée (ex: "29/11/2025")
   */
  static formatDateInTimezone(date: Date, country: string): string {
    return this.formatInTimezone(date, country, 'dd/MM/yyyy');
  }

  /**
   * Formater date+heure pour affichage français
   * 
   * @param date Date UTC
   * @param country Pays de l'organisation
   * @returns Date et heure formatées (ex: "29/11/2025 à 14:30")
   */
  static formatDateTimeInTimezone(date: Date, country: string): string {
    return this.formatInTimezone(date, country, "dd/MM/yyyy 'à' HH:mm");
  }

  /**
   * Obtenir l'heure actuelle dans le timezone de l'organisation
   * 
   * @param country Pays de l'organisation
   * @returns Date en UTC représentant l'instant actuel
   */
  static getNowInTimezone(country: string): Date {
    return new Date(); // Déjà en UTC
  }

  /**
   * Vérifier si une date est "aujourd'hui" dans le timezone de l'organisation
   * 
   * @param date Date à vérifier
   * @param country Pays de l'organisation
   * @returns true si la date est aujourd'hui dans le timezone
   */
  static isToday(date: Date, country: string): boolean {
    const { start, end } = this.getTodayInTimezone(country);
    return date >= start && date <= end;
  }

  /**
   * Convertir une heure "HH:mm" en minutes depuis minuit
   * Utilisé pour comparer avec les heures de configuration
   * 
   * @param timeString Heure au format "HH:mm"
   * @returns Minutes depuis minuit
   */
  static timeStringToMinutes(timeString: string): number {
    const [hours = 0, minutes = 0] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convertir des minutes depuis minuit en heure "HH:mm"
   * 
   * @param minutes Minutes depuis minuit
   * @returns Heure formatée "HH:mm"
   */
  static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Parser une date ISO string en tenant compte du timezone
   * 
   * @param dateString Date en format ISO
   * @param country Pays de l'organisation
   * @returns Date UTC
   */
  static parseISOInTimezone(dateString: string, country: string): Date {
    const timezone = getTimezoneByCountry(country);
    const parsedDate = parseISO(dateString);
    return zonedTimeToUtc(parsedDate, timezone);
  }

  /**
   * Obtenir le fuseau horaire d'une organisation
   * 
   * @param country Pays de l'organisation
   * @returns Fuseau horaire IANA (ex: "Africa/Nairobi")
   */
  static getTimezone(country: string): string {
    return getTimezoneByCountry(country);
  }

  /**
   * Ajouter des jours à une date en tenant compte du fuseau horaire
   * Garantit que l'heure locale est préservée (ex: 14:00 reste 14:00 même après changement d'heure)
   * 
   * @param date Date de départ (UTC)
   * @param days Nombre de jours à ajouter
   * @param country Pays de l'organisation
   * @returns Nouvelle date (UTC)
   */
  static addDaysInTimezone(date: Date, days: number, country: string): Date {
    const timezone = getTimezoneByCountry(country);
    // 1. Convertir en temps local
    const zonedDate = utcToZonedTime(date, timezone);
    // 2. Ajouter les jours (date-fns gère intelligemment les changements d'heure locaux)
    const futureZonedDate = addDays(zonedDate, days);
    // 3. Reconvertir en UTC
    return zonedTimeToUtc(futureZonedDate, timezone);
  }

  /**
   * Ajouter des mois à une date en tenant compte du fuseau horaire
   * 
   * @param date Date de départ (UTC)
   * @param months Nombre de mois à ajouter
   * @param country Pays de l'organisation
   * @returns Nouvelle date (UTC)
   */
  static addMonthsInTimezone(date: Date, months: number, country: string): Date {
    const timezone = getTimezoneByCountry(country);
    // 1. Convertir en temps local
    const zonedDate = utcToZonedTime(date, timezone);
    // 2. Ajouter les mois
    const futureZonedDate = addMonths(zonedDate, months);
    // 3. Reconvertir en UTC
    return zonedTimeToUtc(futureZonedDate, timezone);
  }
}
