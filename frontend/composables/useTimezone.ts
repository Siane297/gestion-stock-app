import { computed } from 'vue';
import { useSecureAuth } from './useSecureAuth';

/**
 * Mapping des pays vers leurs fuseaux horaires IANA principaux
 * Utilisé pour l'affichage des dates et heures
 */
export const COUNTRY_TIMEZONES: Record<string, string> = {
  // Afrique de l'Est
  'Kenya': 'Africa/Nairobi',
  'Tanzania': 'Africa/Dar_es_Salaam',
  'Uganda': 'Africa/Kampala',
  'Ethiopia': 'Africa/Addis_Ababa',
  'Somalia': 'Africa/Mogadishu',
  'Djibouti': 'Africa/Djibouti',
  'Comoros': 'Indian/Comoro',
  'Madagascar': 'Indian/Antananarivo',
  
  // Afrique de l'Ouest
  'Nigeria': 'Africa/Lagos',
  'Cameroon': 'Africa/Douala',
  'Niger': 'Africa/Niamey',
  'Chad': 'Africa/Ndjamena',
  'Benin': 'Africa/Porto-Novo',
  'Togo': 'Africa/Lome',
  'Gabon': 'Africa/Libreville',
  'Congo': 'Africa/Brazzaville',
  'RDC': 'Africa/Kinshasa',
  
  // Afrique Centrale / Sud
  'South Africa': 'Africa/Johannesburg',
  'Zimbabwe': 'Africa/Harare',
  'Zambia': 'Africa/Lusaka',
  'Botswana': 'Africa/Gaborone',
  'Mozambique': 'Africa/Maputo',
  'Malawi': 'Africa/Blantyre',
  
  // Afrique du Nord
  'Morocco': 'Africa/Casablanca',
  'Algeria': 'Africa/Algiers',
  'Tunisia': 'Africa/Tunis',
  'Libya': 'Africa/Tripoli',
  'Egypt': 'Africa/Cairo',
  
  // Europe
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Italy': 'Europe/Rome',
  'Spain': 'Europe/Madrid',
  'Belgium': 'Europe/Brussels',
  'Netherlands': 'Europe/Amsterdam',
  'Switzerland': 'Europe/Zurich',
  'United Kingdom': 'Europe/London',
  'UK': 'Europe/London',
  'Ireland': 'Europe/Dublin',
  'Portugal': 'Europe/Lisbon',
  
  // Amériques
  'USA': 'America/New_York', // Par défaut EST
  'Canada': 'America/Toronto',
  'Mexico': 'America/Mexico_City',
  'Brazil': 'America/Sao_Paulo',
  
  // Asie / Océanie
  'India': 'Asia/Kolkata',
  'China': 'Asia/Shanghai',
  'Japan': 'Asia/Tokyo',
  'Australia': 'Australia/Sydney',
  'UAE': 'Asia/Dubai',
};

/**
 * Composable pour gérer les fuseaux horaires dynamiques
 */
export const useTimezone = () => {
  const { user } = useSecureAuth();

  /**
   * Fuseau horaire de l'utilisateur basé sur le pays de son entreprise
   * Par défaut: 'Africa/Nairobi' (EAT)
   */
  const userTimezone = computed(() => {
    const country = user.value?.company?.country;
    if (!country) return 'Africa/Nairobi';
    
    return COUNTRY_TIMEZONES[country] || 'Africa/Nairobi';
  });

  /**
   * Formater une date avec le fuseau horaire de l'utilisateur
   */
  const formatDateInTimezone = (date: string | Date, options: Intl.DateTimeFormatOptions = {}) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      ...options,
      timeZone: userTimezone.value,
    });
  };

  /**
   * Formater une heure avec le fuseau horaire de l'utilisateur
   */
  const formatTimeInTimezone = (date: string | Date, options: Intl.DateTimeFormatOptions = {}) => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', {
      ...options,
      timeZone: userTimezone.value,
    });
  };

  return {
    userTimezone,
    formatDateInTimezone,
    formatTimeInTimezone,
    COUNTRY_TIMEZONES,
  };
};
