import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProduitApi } from './useProduitApi';
import { useVenteApi, type CreateVenteDto, type MethodePaiement } from './useVenteApi';
import { useClientApi } from './useClientApi';
import { useMagasinStore } from '~/stores/magasin';
import { useCaisseStore } from '~/stores/caisse';

// Types pour le POS
export interface PosProductItem {
  uniqueId: string;
  productId: string;
  conditionnementId?: string;
  name: string;
  price: number;
  isPack: boolean;
  packLabel?: string;
  quantityInBase: number;
  stockAvailable: number;
  image?: string;
  color?: string;
  categoryName?: string;
  code_barre?: string;
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

export interface HeldOrder {
  id: string;
  cart: CartItem[];
  clientId?: string | null;
  total: number;
  timestamp: string;
}

export const usePos = defineStore('pos', () => {
  const { getProduits } = useProduitApi();
  const { createVente } = useVenteApi();
  const { getClients } = useClientApi();
  const magasinStore = useMagasinStore(); 
  const caisseStore = useCaisseStore();
  
  // State
  const allProducts = ref<any[]>([]);
  const posItems = ref<PosProductItem[]>([]);
  const cart = ref<CartItem[]>([]);
  const searchQuery = ref('');
  const selectedCategory = ref<string | null>(null);
  const loading = ref(false);
  const currentMagasinId = computed(() => magasinStore.currentMagasinId);
  const currentMagasin = computed(() => magasinStore.currentMagasin); 
  
  const clients = ref<any[]>([]);
  const selectedClientId = ref<string | null>(null);

  // Commandes en attente
  const heldOrders = ref<HeldOrder[]>([]);

  // Getters
  const filteredItems = computed(() => {
    let items = posItems.value;
    if (selectedCategory.value) {
      items = items.filter((i: PosProductItem) => i.categoryName === selectedCategory.value);
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      items = items.filter((i: PosProductItem) => 
        i.name.toLowerCase().includes(q) || 
        (i.packLabel && i.packLabel.toLowerCase().includes(q))
      );
    }
    return items;
  });

  const cartTotal = computed(() => {
    return cart.value.reduce((sum: number, item: CartItem) => sum + item.total, 0);
  });

  const cartCount = computed(() => {
    return cart.value.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  });

  // Actions
  const initPos = async () => {
    loading.value = true;
    try {
      if (!magasinStore.currentMagasinId) {
         await magasinStore.initialize();
      }
      const clientsList = await getClients({ est_actif: true });
      clients.value = clientsList;
      allProducts.value = await getProduits();
      flattenCatalog();
      
      // Charger les commandes en attente depuis localStorage
      const saved = localStorage.getItem('pos_held_orders');
      if (saved) {
          try {
              heldOrders.value = JSON.parse(saved);
          } catch (e) {
              console.error("Erreur parsing held orders", e);
          }
      }
    } catch (error) {
      console.error("Erreur chargement POS:", error);
    } finally {
      loading.value = false;
    }
  };

  const loadCatalog = initPos;

  // Persister les commandes en attente au changement
  watch(heldOrders, (val) => {
      localStorage.setItem('pos_held_orders', JSON.stringify(val));
  }, { deep: true });

  const flattenCatalog = () => {
    const items: PosProductItem[] = [];
    const magId = currentMagasinId.value;

    allProducts.value.forEach(p => {
      let stockProduit = 0;
      if (p.stocks && magId) {
          const stockEntry = p.stocks.find((s: any) => s.magasin_id === magId);
          stockProduit = stockEntry ? stockEntry.quantite : 0;
      }

      const config = useRuntimeConfig();
      const apiBase = config.public.apiBase as string;
      let serverUrl = '';
      try {
          if (apiBase.startsWith('http')) {
              serverUrl = new URL(apiBase).origin;
          }
      } catch (e) {}

      const getFullImageUrl = (path?: string) => {
          if (!path) return undefined;
          if (path.startsWith('http')) return path;
          return `${serverUrl}${path}`;
      };

      const hasDefinedUnit = p.conditionnements?.some((c: any) => c.quantite_base === 1);

      if (!hasDefinedUnit && p.prix_vente && p.prix_vente > 0) {
        if (stockProduit > 0) {
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
            image: getFullImageUrl(p.image_url),
            code_barre: p.code_barre
            });
        }
      }

      if (p.conditionnements && p.conditionnements.length > 0) {
        p.conditionnements.forEach((c: any) => {
          const stockCond = Math.floor(stockProduit / c.quantite_base);
          if (stockCond > 0) {
              items.push({
                uniqueId: `${p.id}_${c.id}`,
                productId: p.id,
                conditionnementId: c.id,
                name: `${p.nom}`,
                price: c.prix_vente,
                isPack: c.quantite_base > 1,
                packLabel: c.nom,
                quantityInBase: c.quantite_base,
                stockAvailable: stockCond,
                categoryName: p.categorie?.nom,
                image: getFullImageUrl(c.image_url) || getFullImageUrl(p.image_url),
                code_barre: c.code_barre || p.code_barre
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
    selectedClientId.value = null;
  };

  // --- Actions "En attente" ---
  const holdCurrentCart = () => {
      if (cart.value.length === 0) return;
      
      const newOrder: HeldOrder = {
          id: Math.random().toString(36).substring(2, 9), // Simple ID
          cart: [...cart.value],
          clientId: selectedClientId.value,
          total: cartTotal.value,
          timestamp: new Date().toISOString()
      };
      
      heldOrders.value.unshift(newOrder); // Plus récent en premier
      clearCart();
  };

  const resumeHeldOrder = (orderId: string) => {
      const order = heldOrders.value.find(o => o.id === orderId);
      if (!order) return;
      
      cart.value = [...order.cart];
      selectedClientId.value = order.clientId || null;
      
      // Retirer de la liste après reprise
      removeHeldOrder(orderId);
  };

  const removeHeldOrder = (orderId: string) => {
      const index = heldOrders.value.findIndex(o => o.id === orderId);
      if (index !== -1) {
          heldOrders.value.splice(index, 1);
      }
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
         session_caisse_id: caisseStore.activeSession?.id,
         details: cart.value.map((item: CartItem) => ({
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
    clients, selectedClientId, heldOrders,
    filteredItems, cartTotal, cartCount,
    loadCatalog, addToCart, removeFromCart, updateQuantity, clearCart, 
    submitSale, holdCurrentCart, resumeHeldOrder, removeHeldOrder
  };
});
