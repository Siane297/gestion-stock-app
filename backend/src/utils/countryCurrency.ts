/**
 * Mapping des pays vers leurs devises
 * Utilisé pour détecter automatiquement la devise selon le pays de l'organisation
 */

/**
 * Structure d'une devise
 */
export interface Currency {
  code: string;       // Code ISO 4217 (ex: "KES", "USD", "EUR")
  symbol: string;     // Symbole (ex: "KSh", "$", "€")
  name: string;       // Nom complet
  nameFr: string;     // Nom en français
  decimalPlaces: number; // Nombre de décimales (généralement 2)
  symbolPosition: 'before' | 'after'; // Position du symbole
  thousandSeparator: string; // Séparateur de milliers
  decimalSeparator: string;  // Séparateur décimal
}

/**
 * Mapping des pays vers leurs devises
 */
export const COUNTRY_CURRENCIES: Record<string, Currency> = {
  // Afrique de l'Est
  'Kenya': { 
    code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', nameFr: 'Shilling Kényan',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Tanzania': { 
    code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', nameFr: 'Shilling Tanzanien',
    decimalPlaces: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Uganda': { 
    code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', nameFr: 'Shilling Ougandais',
    decimalPlaces: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Ethiopia': { 
    code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', nameFr: 'Birr Éthiopien',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Somalia': { 
    code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', nameFr: 'Shilling Kényan',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Djibouti': { 
    code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc', nameFr: 'Franc Djiboutien',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Comoros': { 
    code: 'KMF', symbol: 'KMF', name: 'Comorian Franc', nameFr: 'Franc Comorien',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Madagascar': { 
    code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary', nameFr: 'Ariary Malgache',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },

  // Afrique de l'Ouest (Zone CFA)
  'Senegal': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Ivory Coast': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Côte d\'Ivoire': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Mali': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Burkina Faso': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Niger': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Togo': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Benin': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Guinea-Bissau': { 
    code: 'XOF', symbol: 'FCFA', name: 'CFA Franc BCEAO', nameFr: 'Franc CFA BCEAO',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },

  // Afrique Centrale (Zone CFA)
  'Cameroon': { 
    code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', nameFr: 'Franc CFA BEAC',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Chad': { 
    code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', nameFr: 'Franc CFA BEAC',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Gabon': { 
    code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', nameFr: 'Franc CFA BEAC',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Congo': { 
    code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', nameFr: 'Franc CFA BEAC',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Central African Republic': { 
    code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', nameFr: 'Franc CFA BEAC',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Equatorial Guinea': { 
    code: 'XAF', symbol: 'FCFA', name: 'CFA Franc BEAC', nameFr: 'Franc CFA BEAC',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },

  // Afrique - Autres
  'Nigeria': { 
    code: 'NGN', symbol: '₦', name: 'Nigerian Naira', nameFr: 'Naira Nigérian',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'RDC': { 
    code: 'CDF', symbol: 'FC', name: 'Congolese Franc', nameFr: 'Franc Congolais',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Congo-Kinshasa': { 
    code: 'CDF', symbol: 'FC', name: 'Congolese Franc', nameFr: 'Franc Congolais',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Democratic Republic of Congo': { 
    code: 'CDF', symbol: 'FC', name: 'Congolese Franc', nameFr: 'Franc Congolais',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'South Africa': { 
    code: 'ZAR', symbol: 'R', name: 'South African Rand', nameFr: 'Rand Sud-Africain',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Ghana': { 
    code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', nameFr: 'Cédi Ghanéen',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Morocco': { 
    code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', nameFr: 'Dirham Marocain',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Algeria': { 
    code: 'DZD', symbol: 'DA', name: 'Algerian Dinar', nameFr: 'Dinar Algérien',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Tunisia': { 
    code: 'TND', symbol: 'DT', name: 'Tunisian Dinar', nameFr: 'Dinar Tunisien',
    decimalPlaces: 3, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Egypt': { 
    code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', nameFr: 'Livre Égyptienne',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Rwanda': { 
    code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', nameFr: 'Franc Rwandais',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Burundi': { 
    code: 'BIF', symbol: 'FBu', name: 'Burundian Franc', nameFr: 'Franc Burundais',
    decimalPlaces: 0, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },

  // Europe
  'France': { 
    code: 'EUR', symbol: '€', name: 'Euro', nameFr: 'Euro',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Germany': { 
    code: 'EUR', symbol: '€', name: 'Euro', nameFr: 'Euro',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ','
  },
  'Italy': { 
    code: 'EUR', symbol: '€', name: 'Euro', nameFr: 'Euro',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ','
  },
  'Spain': { 
    code: 'EUR', symbol: '€', name: 'Euro', nameFr: 'Euro',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ','
  },
  'Belgium': { 
    code: 'EUR', symbol: '€', name: 'Euro', nameFr: 'Euro',
    decimalPlaces: 2, symbolPosition: 'after', thousandSeparator: ' ', decimalSeparator: ','
  },
  'Netherlands': { 
    code: 'EUR', symbol: '€', name: 'Euro', nameFr: 'Euro',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ','
  },
  'Switzerland': { 
    code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', nameFr: 'Franc Suisse',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: '\'', decimalSeparator: '.'
  },
  'United Kingdom': { 
    code: 'GBP', symbol: '£', name: 'British Pound', nameFr: 'Livre Sterling',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'UK': { 
    code: 'GBP', symbol: '£', name: 'British Pound', nameFr: 'Livre Sterling',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },

  // Amérique
  'USA': { 
    code: 'USD', symbol: '$', name: 'US Dollar', nameFr: 'Dollar Américain',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'United States': { 
    code: 'USD', symbol: '$', name: 'US Dollar', nameFr: 'Dollar Américain',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Canada': { 
    code: 'CAD', symbol: '$', name: 'Canadian Dollar', nameFr: 'Dollar Canadien',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Brazil': { 
    code: 'BRL', symbol: 'R$', name: 'Brazilian Real', nameFr: 'Réal Brésilien',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ','
  },

  // Moyen-Orient
  'UAE': { 
    code: 'AED', symbol: 'AED', name: 'UAE Dirham', nameFr: 'Dirham des EAU',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'United Arab Emirates': { 
    code: 'AED', symbol: 'AED', name: 'UAE Dirham', nameFr: 'Dirham des EAU',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Saudi Arabia': { 
    code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', nameFr: 'Riyal Saoudien',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },

  // Asie
  'India': { 
    code: 'INR', symbol: '₹', name: 'Indian Rupee', nameFr: 'Roupie Indienne',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'China': { 
    code: 'CNY', symbol: '¥', name: 'Chinese Yuan', nameFr: 'Yuan Chinois',
    decimalPlaces: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
  'Japan': { 
    code: 'JPY', symbol: '¥', name: 'Japanese Yen', nameFr: 'Yen Japonais',
    decimalPlaces: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.'
  },
};

/**
 * Devise par défaut (Comores)
 */
export const DEFAULT_CURRENCY: Currency = COUNTRY_CURRENCIES['Comoros']!;

/**
 * Liste de toutes les devises uniques (pour sélection admin)
 */
export const getAllCurrencies = (): Currency[] => {
  const uniqueCurrencies = new Map<string, Currency>();
  
  for (const currency of Object.values(COUNTRY_CURRENCIES)) {
    if (!uniqueCurrencies.has(currency.code)) {
      uniqueCurrencies.set(currency.code, currency);
    }
  }
  
  return Array.from(uniqueCurrencies.values()).sort((a, b) => a.code.localeCompare(b.code));
};

/**
 * Obtenir la devise d'un pays
 * @param country Nom du pays
 * @returns Devise du pays ou devise par défaut (KES)
 */
export const getCurrencyByCountry = (country: string): Currency => {
  // Normaliser le nom du pays (trim)
  const normalizedCountry = country.trim();
  
  // Recherche exacte
  if (COUNTRY_CURRENCIES[normalizedCountry]) {
    return COUNTRY_CURRENCIES[normalizedCountry];
  }
  
  // Recherche insensible à la casse
  const countryLower = normalizedCountry.toLowerCase();
  for (const [key, currency] of Object.entries(COUNTRY_CURRENCIES)) {
    if (key.toLowerCase() === countryLower) {
      return currency;
    }
  }
  
  // Par défaut : KES
  console.warn(`⚠️ Devise non trouvée pour le pays "${country}", utilisation de KES par défaut`);
  return DEFAULT_CURRENCY;
};

/**
 * Obtenir une devise par son code ISO
 * @param code Code ISO 4217 (ex: "EUR", "USD")
 * @returns Devise correspondante ou null
 */
export const getCurrencyByCode = (code: string): Currency | null => {
  const normalizedCode = code.toUpperCase().trim();
  
  for (const currency of Object.values(COUNTRY_CURRENCIES)) {
    if (currency.code === normalizedCode) {
      return currency;
    }
  }
  
  return null;
};

/**
 * Formater un montant avec la devise
 * @param amount Montant à formater
 * @param currency Devise à utiliser
 * @returns Montant formaté (ex: "KSh 1,234.56" ou "1 234,56 €")
 */
export const formatAmount = (amount: number, currency: Currency): string => {
  // Arrondir selon le nombre de décimales
  const roundedAmount = amount.toFixed(currency.decimalPlaces);
  
  // Séparer partie entière et décimale
  const [integerPart, decimalPart] = roundedAmount.split('.');
  
  // Formater la partie entière avec séparateur de milliers
  const formattedInteger = (integerPart || '0').replace(
    /\B(?=(\d{3})+(?!\d))/g, 
    currency.thousandSeparator
  );
  
  // Reconstruire le nombre formaté
  let formattedNumber = formattedInteger;
  if (currency.decimalPlaces > 0 && decimalPart) {
    formattedNumber += currency.decimalSeparator + decimalPart;
  }
  
  // Ajouter le symbole selon la position
  if (currency.symbolPosition === 'before') {
    return `${currency.symbol} ${formattedNumber}`;
  } else {
    return `${formattedNumber} ${currency.symbol}`;
  }
};

/**
 * Formater un montant avec le pays (raccourci)
 * @param amount Montant à formater
 * @param country Nom du pays
 * @returns Montant formaté
 */
export const formatCurrency = (amount: number, country: string): string => {
  const currency = getCurrencyByCountry(country);
  return formatAmount(amount, currency);
};

/**
 * Formater un montant avec le code devise (raccourci)
 * @param amount Montant à formater
 * @param currencyCode Code ISO de la devise
 * @returns Montant formaté
 */
export const formatCurrencyByCode = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) {
    console.warn(`⚠️ Devise non trouvée pour le code "${currencyCode}", utilisation de KES`);
    return formatAmount(amount, DEFAULT_CURRENCY);
  }
  return formatAmount(amount, currency);
};
