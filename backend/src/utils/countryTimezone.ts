/**
 * Mapping des pays vers leurs fuseaux horaires principaux
 * Utilisé pour détecter automatiquement le timezone selon le pays de l'organisation
 */

export const COUNTRY_TIMEZONES: Record<string, string> = {
  // Afrique de l'Est (EAT - UTC+3)
  'Kenya': 'Africa/Nairobi',
  'Tanzania': 'Africa/Dar_es_Salaam',
  'Uganda': 'Africa/Kampala',
  'Ethiopia': 'Africa/Addis_Ababa',
  'Somalia': 'Africa/Mogadishu',
  'Djibouti': 'Africa/Djibouti',
  'Comoros': 'Indian/Comoro',
  'Madagascar': 'Indian/Antananarivo',
  
  // Afrique de l'Ouest (WAT - UTC+1)
  'Nigeria': 'Africa/Lagos',
  'Cameroon': 'Africa/Douala',
  'Niger': 'Africa/Niamey',
  'Chad': 'Africa/Ndjamena',
  'Benin': 'Africa/Porto-Novo',
  'Togo': 'Africa/Lome',
  'Gabon': 'Africa/Libreville',
  'Congo': 'Africa/Brazzaville',
  'RDC': 'Africa/Kinshasa',
  'Congo-Kinshasa': 'Africa/Kinshasa',
  'Democratic Republic of Congo': 'Africa/Kinshasa',
  
  // Afrique Centrale (CAT - UTC+2)
  'South Africa': 'Africa/Johannesburg',
  'Zimbabwe': 'Africa/Harare',
  'Zambia': 'Africa/Lusaka',
  'Botswana': 'Africa/Gaborone',
  'Mozambique': 'Africa/Maputo',
  'Malawi': 'Africa/Blantyre',
  
  // Afrique du Nord (CET/CEST - UTC+1/+2)
  'Morocco': 'Africa/Casablanca',
  'Algeria': 'Africa/Algiers',
  'Tunisia': 'Africa/Tunis',
  'Libya': 'Africa/Tripoli',
  'Egypt': 'Africa/Cairo',
  
  // Europe de l'Ouest (WET/WEST - UTC+0/+1)
  'Portugal': 'Europe/Lisbon',
  'Ireland': 'Europe/Dublin',
  'United Kingdom': 'Europe/London',
  'UK': 'Europe/London',
  
  // Europe Centrale (CET/CEST - UTC+1/+2)
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Italy': 'Europe/Rome',
  'Spain': 'Europe/Madrid',
  'Belgium': 'Europe/Brussels',
  'Netherlands': 'Europe/Amsterdam',
  'Switzerland': 'Europe/Zurich',
  'Austria': 'Europe/Vienna',
  'Poland': 'Europe/Warsaw',
  'Czech Republic': 'Europe/Prague',
  'Hungary': 'Europe/Budapest',
  'Sweden': 'Europe/Stockholm',
  'Norway': 'Europe/Oslo',
  'Denmark': 'Europe/Copenhagen',
  
  // Europe de l'Est (EET/EEST - UTC+2/+3)
  'Greece': 'Europe/Athens',
  'Romania': 'Europe/Bucharest',
  'Bulgaria': 'Europe/Sofia',
  'Ukraine': 'Europe/Kiev',
  'Finland': 'Europe/Helsinki',
  
  // Moyen-Orient
  'UAE': 'Asia/Dubai',
  'United Arab Emirates': 'Asia/Dubai',
  'Saudi Arabia': 'Asia/Riyadh',
  'Qatar': 'Asia/Qatar',
  'Kuwait': 'Asia/Kuwait',
  'Bahrain': 'Asia/Bahrain',
  'Oman': 'Asia/Muscat',
  'Israel': 'Asia/Jerusalem',
  'Turkey': 'Europe/Istanbul',
  
  // Asie
  'India': 'Asia/Kolkata',
  'Pakistan': 'Asia/Karachi',
  'Bangladesh': 'Asia/Dhaka',
  'China': 'Asia/Shanghai',
  'Japan': 'Asia/Tokyo',
  'South Korea': 'Asia/Seoul',
  'Thailand': 'Asia/Bangkok',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Singapore': 'Asia/Singapore',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Indonesia': 'Asia/Jakarta',
  'Philippines': 'Asia/Manila',
  
  // Amériques
  'USA': 'America/New_York',
  'United States': 'America/New_York',
  'Canada': 'America/Toronto',
  'Mexico': 'America/Mexico_City',
  'Brazil': 'America/Sao_Paulo',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Chile': 'America/Santiago',
  'Colombia': 'America/Bogota',
  'Peru': 'America/Lima',
  
  // Océanie
  'Australia': 'Australia/Sydney',
  'New Zealand': 'Pacific/Auckland',
};

/**
 * Obtenir le fuseau horaire d'un pays
 * @param country Nom du pays
 * @returns Fuseau horaire IANA (ex: "Africa/Nairobi") ou "Africa/Nairobi" par défaut
 */
export const getTimezoneByCountry = (country: string): string => {
  // Normaliser le nom du pays (trim, capitalize)
  const normalizedCountry = country.trim();
  
  // Recherche exacte
  if (COUNTRY_TIMEZONES[normalizedCountry]) {
    return COUNTRY_TIMEZONES[normalizedCountry];
  }
  
  // Recherche insensible à la casse
  const countryLower = normalizedCountry.toLowerCase();
  for (const [key, timezone] of Object.entries(COUNTRY_TIMEZONES)) {
    if (key.toLowerCase() === countryLower) {
      return timezone;
    }
  }
  
  // Par défaut : Africa/Nairobi (EAT)
  console.warn(`⚠️ Fuseau horaire non trouvé pour le pays "${country}", utilisation de Africa/Nairobi par défaut`);
  return 'Africa/Nairobi';
};

/**
 * Obtenir le décalage UTC d'un fuseau horaire
 * @param timezone Fuseau horaire IANA
 * @returns Décalage en heures (ex: +3 pour EAT)
 */
export const getTimezoneOffset = (timezone: string): number => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find(part => part.type === 'timeZoneName');
  
  if (offsetPart && offsetPart.value.startsWith('GMT')) {
    const offset = offsetPart.value.replace('GMT', '');
    if (offset === '') return 0;
    
    const sign = offset[0] === '+' ? 1 : -1;
    const hours = parseInt(offset.slice(1), 10);
    return sign * hours;
  }
  
  return 0;
};

/**
 * Formater une date selon le fuseau horaire d'un pays
 */
export const formatDateForCountry = (date: Date, country: string): string => {
  const timezone = getTimezoneByCountry(country);
  
  return date.toLocaleString('fr-FR', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Obtenir l'heure actuelle selon le fuseau horaire d'un pays
 */
export const getCurrentTimeForCountry = (country: string): Date => {
  const timezone = getTimezoneByCountry(country);
  const now = new Date();
  
  // Convertir en heure locale du pays
  const localString = now.toLocaleString('en-US', { timeZone: timezone });
  return new Date(localString);
};
