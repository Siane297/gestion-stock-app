import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProduitApi } from './useProduitApi';
import { useVenteApi, type CreateVenteDto, type MethodePaiement } from './useVenteApi';
import { useClientApi } from './useClientApi';
import { useMagasinStore } from '~/stores/magasin';

// Types pour le POS
export interface PosProductItem {
  uniqueId: string;
  productId: string;
  conditionnementId?: string; // ID du conditionnement spécifique
  name: string;
  price: number;
  isPack: boolean;
  packLabel?: string;
  quantityInBase: number;
  stockAvailable: number;
  image?: string;
  color?: string;
  categoryName?: string;
}

export interface CartItem {
  uniqueId: string;
  productId: string;
  conditionnementId?: string;
  name: string;
  price: number;
  quantity: number;
  isPack: boolean;
  packLabel?: string;
  quantityInBase?: number;
  total: number;
}

export const usePos = defineStore('pos', () => {
  const { getProduits } = useProduitApi();
  const { createVente } = useVenteApi();
  const { getClients } = useClientApi();
  const magasinStore = useMagasinStore(); 
  
  // State
  const allProducts = ref<any[]>([]);
  const posItems = ref<PosProductItem[]>([]);
  const cart = ref<CartItem[]>([]);
  const searchQuery = ref('');
  const selectedCategory = ref<string | null>(null);
  const loading = ref(false);
  // On utilise le store global pour l'ID magasin
  const currentMagasinId = computed(() => magasinStore.currentMagasinId);
  const currentMagasin = computed(() => magasinStore.currentMagasin); 
  
  const clients = ref<any[]>([]);
  const selectedClientId = ref<string | null>(null);

  // Getters
  const filteredItems = computed(() => {
    let items = posItems.value;

    if (selectedCategory.value) {
      items = items.filter(i => i.categoryName === selectedCategory.value);
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.packLabel && i.packLabel.toLowerCase().includes(q))
      );
    }

    return items;
  });

  const cartTotal = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.total, 0);
  });

  const cartCount = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Actions
  const initPos = async () => {
    loading.value = true;
    try {
      // 1. S'assurer que le magasin est chargé via le store global
      if (!magasinStore.currentMagasinId) {
         await magasinStore.initialize();
      }

      // 2. Charger les clients
      const clientsList = await getClients({ est_actif: true });
      clients.value = clientsList;

      // 3. Charger les produits
      allProducts.value = await getProduits();
      flattenCatalog();
    } catch (error) {
      console.error("Erreur chargement POS:", error);
    } finally {
      loading.value = false;
    }
  };

  const loadCatalog = initPos; // Alias pour compatibilité

  const flattenCatalog = () => {
    const items: PosProductItem[] = [];
    const magId = currentMagasinId.value;

    allProducts.value.forEach(p => {
      // Calcul du stock global (pour la boutique courante)
      let stockProduit = 0;
      if (p.stocks && magId) {
          const stockEntry = p.stocks.find((s: any) => s.magasin_id === magId);
          stockProduit = stockEntry ? stockEntry.quantite : 0;
      }

      const config = useRuntimeConfig();
      const apiBase = config.public.apiBase as string; // ex: http://localhost:3001/api
      // Extraire l'origine (http://localhost:3001)
      let serverUrl = '';
      try {
          if (apiBase.startsWith('http')) {
              serverUrl = new URL(apiBase).origin;
          } else {
             // Fallback si chemin relatif (rare en dev nuxt proxy)
             serverUrl = ''; 
          }
      } catch (e) {
          console.error("Erreur parsing API Base URL", e);
      }

      const getFullImageUrl = (path?: string) => {
          if (!path) return undefined;
          if (path.startsWith('http')) return path; // Déjà absolu (ex: google drive old)
          return `${serverUrl}${path}`;
      };

      const hasDefinedUnit = p.conditionnements?.some((c: any) => c.quantite_base === 1);

      // 1. Unité de base (si aucune unité explicite définie)
      if (!hasDefinedUnit && p.prix_vente && p.prix_vente > 0) {
        if (stockProduit > 0) { // Filtrage Stock POS
            items.push({
            uniqueId: `${p.id}_UNIT`,
            productId: p.id,
            conditionnementId: undefined, 
            name: p.nom,
            price: p.prix_vente,
            isPack: false,
            packLabel: p.unite?.nom,
            quantityInBase: 1,
            stockAvailable: stockProduit,
            categoryName: p.categorie?.nom,
            image: getFullImageUrl(p.image_url)
            });
        }
      }

      // 2. Conditionnements
      if (p.conditionnements && p.conditionnements.length > 0) {
        p.conditionnements.forEach((c: any) => {
          const stockCond = Math.floor(stockProduit / c.quantite_base);
          if (stockCond > 0) { // Filtrage Stock POS
              items.push({
                uniqueId: `${p.id}_${c.id}`,
                productId: p.id,
                conditionnementId: c.id,
                name: `${p.nom}`,
                price: c.prix_vente,
                isPack: c.quantite_base > 1,
                packLabel: c.nom, // Sera "Unité", "Pack de 6", etc.
                quantityInBase: c.quantite_base,
                stockAvailable: stockCond,
                categoryName: p.categorie?.nom,
                image: getFullImageUrl(c.image_url) || getFullImageUrl(p.image_url) // Image spécifique ou fallback produit
              });
          }
        });
      }
    });

    posItems.value = items;
  };

  const addToCart = (item: PosProductItem) => {
    const existing = cart.value.find(i => i.uniqueId === item.uniqueId);
    
    if (existing) {
      existing.quantity++;
      existing.total = existing.quantity * existing.price;
    } else {
      cart.value.push({
        uniqueId: item.uniqueId,
        productId: item.productId,
        conditionnementId: item.conditionnementId,
        name: item.name,
        price: item.price,
        quantity: 1,
        isPack: item.isPack,
        packLabel: item.packLabel,
        quantityInBase: item.quantityInBase,
        total: item.price
      });
    }
  };

  const removeFromCart = (uniqueId: string) => {
    const index = cart.value.findIndex(i => i.uniqueId === uniqueId);
    if (index !== -1) {
      cart.value.splice(index, 1);
    }
  };

  const updateQuantity = (uniqueId: string, delta: number) => {
    const item = cart.value.find(i => i.uniqueId === uniqueId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeFromCart(uniqueId);
      } else {
        item.total = item.quantity * item.price;
      }
    }
  };

  const clearCart = () => {
    cart.value = [];
    selectedClientId.value = null; // Reinit client
  };

  const submitSale = async (paymentData: { method: MethodePaiement, amountReceived: number, change: number }): Promise<{ venteId: string } | null> => {
     if (!currentMagasinId.value) {
         console.error("Aucun magasin sélectionné");
         return null;
     }

     const payload: CreateVenteDto = {
         magasin_id: currentMagasinId.value,
         client_id: selectedClientId.value || undefined,
         methode_paiement: paymentData.method,
         montant_total: cartTotal.value,
         montant_paye: paymentData.amountReceived,
         montant_rendu: paymentData.change,
         details: cart.value.map(item => ({
             produit_id: item.productId,
             conditionnement_id: item.conditionnementId,
             quantite: item.quantity,
             prix_unitaire: item.price,
             prix_total: item.total
         }))
     };

     try {
         const result = await createVente(payload);
         if (result && result.id) {
            clearCart(); 
            // Recharger le catalogue pour mettre à jour les stocks
            await loadCatalog();
            return { venteId: result.id };
         }
         return null;
     } catch (e) {
         console.error("Erreur vente", e);
         throw e;
     }
  };

  return {
    posItems, cart, searchQuery, selectedCategory, loading, currentMagasin,
    clients, selectedClientId,
    filteredItems, cartTotal, cartCount,
    loadCatalog, addToCart, removeFromCart, updateQuantity, clearCart, submitSale
  };
});
