/**
 * Mapping des noms de pays vers leurs codes ISO 3166-1 alpha-2
 * Utilisé pour afficher les drapeaux avec flag-icons
 */

export const COUNTRY_ISO_CODES: Record<string, string> = {
  // Afrique de l'Est
  'Kenya': 'ke',
  'Tanzania': 'tz',
  'Uganda': 'ug',
  'Ethiopia': 'et',
  'Somalia': 'so',
  'Djibouti': 'dj',
  'Comoros': 'km',
  'Madagascar': 'mg',
  
  // Afrique de l'Ouest
  'Nigeria': 'ng',
  'Cameroon': 'cm',
  'Niger': 'ne',
  'Chad': 'td',
  'Benin': 'bj',
  'Togo': 'tg',
  'Gabon': 'ga',
  'Congo': 'cg',
  'RDC': 'cd',
  
  // Afrique Centrale
  'South Africa': 'za',
  'Zimbabwe': 'zw',
  'Zambia': 'zm',
  'Botswana': 'bw',
  'Mozambique': 'mz',
  'Malawi': 'mw',
  
  // Afrique du Nord
  'Morocco': 'ma',
  'Algeria': 'dz',
  'Tunisia': 'tn',
  'Libya': 'ly',
  'Egypt': 'eg',
  
  // Europe de l'Ouest
  'Portugal': 'pt',
  'Ireland': 'ie',
  'United Kingdom': 'gb',
  'UK': 'gb',
  
  // Europe Centrale
  'France': 'fr',
  'Germany': 'de',
  'Italy': 'it',
  'Spain': 'es',
  'Belgium': 'be',
  'Netherlands': 'nl',
  'Switzerland': 'ch',
  'Austria': 'at',
  'Poland': 'pl',
  'Czech Republic': 'cz',
  'Hungary': 'hu',
  'Sweden': 'se',
  'Norway': 'no',
  'Denmark': 'dk',
  
  // Europe de l'Est
  'Greece': 'gr',
  'Romania': 'ro',
  'Bulgaria': 'bg',
  'Ukraine': 'ua',
  'Finland': 'fi',
  
  // Moyen-Orient
  'UAE': 'ae',
  'Saudi Arabia': 'sa',
  'Qatar': 'qa',
  'Kuwait': 'kw',
  'Bahrain': 'bh',
  'Oman': 'om',
  'Israel': 'il',
  'Turkey': 'tr',
  
  // Asie
  'India': 'in',
  'Pakistan': 'pk',
  'Bangladesh': 'bd',
  'China': 'cn',
  'Japan': 'jp',
  'South Korea': 'kr',
  'Thailand': 'th',
  'Vietnam': 'vn',
  'Singapore': 'sg',
  'Malaysia': 'my',
  'Indonesia': 'id',
  'Philippines': 'ph',
  
  // Amériques
  'USA': 'us',
  'Canada': 'ca',
  'Mexico': 'mx',
  'Brazil': 'br',
  'Argentina': 'ar',
  'Chile': 'cl',
  'Colombia': 'co',
  'Peru': 'pe',
  
  // Océanie
  'Australia': 'au',
  'New Zealand': 'nz',
};

/**
 * Obtenir le code ISO d'un pays
 */
export const useCountryFlags = () => {
  const getCountryCode = (countryName: string): string => {
    return COUNTRY_ISO_CODES[countryName] || 'xx';
  };

  const getFlagClass = (countryName: string): string => {
    const code = getCountryCode(countryName);
    return `fi fi-${code}`;
  };

  return {
    getCountryCode,
    getFlagClass,
    COUNTRY_ISO_CODES,
  };
};
