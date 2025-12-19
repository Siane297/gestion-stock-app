import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

/**
 * Interface pour une devise
 */
export interface Currency {
  code: string;       // Code ISO 4217 (ex: "KMF", "EUR", "USD")
  symbol: string;     // Symbole (ex: "KMF", "€", "$")
  name: string;       // Nom complet
  nameFr: string;     // Nom en français
  decimalPlaces: number; // Nombre de décimales
  symbolPosition: 'before' | 'after'; // Position du symbole
  thousandSeparator: string; // Séparateur de milliers
  decimalSeparator: string;  // Séparateur décimal
}

/**
 * Interface pour la devise de l'organisation
 */
export interface OrganizationCurrencyResponse {
  currency: Currency;
  source: 'manual' | 'country';
  company: {
    id: string;
    name: string;
    country: string;
    currencyOverride?: string;
  };
}

/**
 * Composable pour la gestion des devises via l'API
 */
export const useCurrencyApi = () => {
  const { get, put } = useSecureApi();

  /**
   * Récupérer la liste de toutes les devises disponibles
   */
  const getAllCurrencies = async (): Promise<Currency[]> => {
    try {
      const response = await get<ApiResponse<Currency[]>>('/api/currencies');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des devises:', error);
      return [];
    }
  };

  /**
   * Récupérer la devise de l'organisation courante
   */
  const getOrganizationCurrency = async (): Promise<OrganizationCurrencyResponse | null> => {
    try {
      const response = await get<ApiResponse<OrganizationCurrencyResponse>>('/api/currencies/organization');
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la devise de l\'organisation:', error);
      return null;
    }
  };

  /**
   * Mettre à jour la devise de l'organisation (override manuel)
   */
  const updateOrganizationCurrency = async (currencyCode: string | null): Promise<OrganizationCurrencyResponse | null> => {
    try {
      const response = await put<ApiResponse<OrganizationCurrencyResponse>>('/api/currencies/organization', { currencyCode });
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la devise de l\'organisation:', error);
      throw error;
    }
  };

  /**
   * Récupérer la devise d'un pays spécifique
   */
  const getCurrencyByCountry = async (country: string): Promise<Currency | null> => {
    try {
      const response = await get<ApiResponse<Currency>>(`/api/currencies/by-country/${encodeURIComponent(country)}`);
      return response.data || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la devise pour le pays ${country}:`, error);
      return null;
    }
  };

  return {
    getAllCurrencies,
    getOrganizationCurrency,
    updateOrganizationCurrency,
    getCurrencyByCountry,
  };
};
