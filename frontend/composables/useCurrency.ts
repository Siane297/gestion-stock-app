import { ref, onMounted } from 'vue';
import { useCurrencyApi, type Currency } from '~/composables/api/useCurrencyApi';

// État global partagé pour la devise
const currentCurrency = ref<Currency | null>(null);
const isLoadingCurrency = ref(false);

/**
 * Composable central pour la gestion et le formatage des devises
 */
export const useCurrency = () => {
  const { getOrganizationCurrency } = useCurrencyApi();

  /**
   * Charger la devise de l'organisation si elle n'est pas déjà chargée
   */
  const loadCurrency = async () => {
    if (currentCurrency.value || isLoadingCurrency.value) return;

    isLoadingCurrency.value = true;
    try {
      const response = await getOrganizationCurrency();
      if (response && response.currency) {
        currentCurrency.value = response.currency;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la devise:', error);
    } finally {
      isLoadingCurrency.value = false;
    }
  };

  /**
   * Formater un montant selon la devise actuelle
   */
  const formatPrice = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '---';
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '---';

    // Si la devise n'est pas encore chargée, utiliser un formatage par défaut (KMF)
    const currency = currentCurrency.value || {
      code: 'KMF',
      symbol: 'KMF',
      decimalPlaces: 0,
      symbolPosition: 'after',
      thousandSeparator: ' ',
      decimalSeparator: ','
    };

    // Arrondir selon le nombre de décimales
    const roundedAmount = numAmount.toFixed(currency.decimalPlaces);
    const [integerPart, decimalPart] = roundedAmount.split('.');

    // Formater la partie entière avec les séparateurs de milliers
    const formattedInteger = (integerPart || '0').replace(
      /\B(?=(\d{3})+(?!\d))/g,
      currency.thousandSeparator
    );

    // Assembler le montant (Simplicité : on ne met de décimales que si decimalPlaces > 0)
    let result = formattedInteger;
    if (currency.decimalPlaces > 0 && decimalPart && parseInt(decimalPart) > 0) {
      result += currency.decimalSeparator + decimalPart;
    }

    // Ajouter le symbole (Toujours à la fin selon demande utilisateur)
    return `${result} ${currency.symbol}`;
  };

  // Charger automatiquement la devise au montage du composant si nécessaire
  onMounted(() => {
    loadCurrency();
  });

  return {
    currentCurrency,
    isLoadingCurrency,
    formatPrice,
    loadCurrency
  };
};
