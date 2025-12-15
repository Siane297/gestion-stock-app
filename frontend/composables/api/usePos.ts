import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProduitApi } from './useProduitApi';
import { useVenteApi, type CreateVenteDto, type MethodePaiement } from './useVenteApi';
import { useMagasinApi } from './useMagasinApi';
import { useClientApi } from './useClientApi';

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
  total: number;
}

export const usePos = defineStore('pos', () => {
  const { getProduits } = useProduitApi();
  const { createVente } = useVenteApi();
  const { getMagasins } = useMagasinApi();
  const { getClients } = useClientApi();
  
  // State
  const allProducts = ref<any[]>([]);
  const posItems = ref<PosProductItem[]>([]);
  const cart = ref<CartItem[]>([]);
  const searchQuery = ref('');
  const selectedCategory = ref<string | null>(null);
  const loading = ref(false);
  const currentMagasinId = ref<string | null>(null);
  const currentMagasin = ref<{ id: string, nom: string } | null>(null);
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
      // 1. Charger le magasin (pour l'instant le premier trouvé, ou default)
      if (!currentMagasinId.value) {
         const magasins = await getMagasins({ est_actif: true });
         if (magasins && magasins.length > 0) {
             const principal = magasins.find(m => m.nom.toLowerCase().includes('principal')) || magasins[0];
             if (principal) {
                 currentMagasinId.value = principal.id;
                 currentMagasin.value = principal;
             }
         }
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

      const hasDefinedUnit = p.conditionnements?.some((c: any) => c.quantite_base === 1);

      // 1. Unité de base (si aucune unité explicite définie)
      if (!hasDefinedUnit && p.prix_vente && p.prix_vente > 0) {
        items.push({
          uniqueId: `${p.id}_UNIT`,
          productId: p.id,
          conditionnementId: undefined, 
          name: p.nom,
          price: p.prix_vente,
          isPack: false,
          packLabel: 'Unité',
          quantityInBase: 1,
          stockAvailable: stockProduit,
          categoryName: p.categorie?.nom,
          image: p.photo
        });
      }

      // 2. Conditionnements
      if (p.conditionnements && p.conditionnements.length > 0) {
        p.conditionnements.forEach((c: any) => {
          items.push({
            uniqueId: `${p.id}_${c.id}`,
            productId: p.id,
            conditionnementId: c.id,
            name: `${p.nom}`,
            price: c.prix_vente,
            isPack: c.quantite_base > 1,
            packLabel: c.nom, // Sera "Unité", "Pack de 6", etc.
            quantityInBase: c.quantite_base,
            stockAvailable: Math.floor(stockProduit / c.quantite_base),
            categoryName: p.categorie?.nom,
            image: p.photo
          });
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

  const submitSale = async (paymentData: { method: MethodePaiement, amountReceived: number, change: number }): Promise<boolean> => {
     if (!currentMagasinId.value) {
         console.error("Aucun magasin sélectionné");
         return false;
     }

     const payload: CreateVenteDto = {
         magasin_id: currentMagasinId.value,
         client_id: selectedClientId.value || undefined,
         methode_paiement: paymentData.method,
         montant_total: cartTotal.value,
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
         if (result) {
            clearCart(); 
            return true;
         }
         return false;
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
