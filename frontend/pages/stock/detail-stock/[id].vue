<template>
  <div class="space-y-6">
    <!-- Header: Info Produit & Actions -->
    <div v-if="details" class="bg-side2 p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-lg bg-white flex items-center justify-center p-2 border border-gray-100">
              <img v-if="details.product.image_url" :src="details.product.image_url" class="w-full h-full object-contain" />
              <Icon v-else icon="tabler:box" class="text-3xl text-gray-400" />
          </div>
          <div>
              <div class="flex items-center gap-2">
                  <h1 class="text-xl font-bold text-white">{{ details.product.nom }}</h1>
                  <Badge :value="details.product.categorie?.nom || 'Sans catégorie'" severity="info" class="!rounded-lg !text-[10px]" />
                  <Badge 
                      :value="details.kpi.is_low_stock ? 'Stock Faible' : 'En Stock'" 
                      :severity="details.kpi.is_low_stock ? 'danger' : 'success'"
                      class="!rounded-lg !text-[10px]"
                  />
              </div>
              <div class="flex items-center gap-3 text-sm text-white mt-1">
                  <span v-if="details.product.code_barre" class="flex items-center gap-1">
                      <Icon icon="tabler:barcode" /> {{ details.product.code_barre }}
                  </span>
                  <span class="flex items-center gap-1">
                      <Icon icon="tabler:tag" /> {{ formatPrice(details.product.prix_vente) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Icon icon="tabler:scale" /> {{ details.product.unite?.symbole || details.product.unite.nom }}
                  </span>
              </div>
          </div>
      </div>

      <div class="flex items-center gap-2">
           <AppButton 
              label="Prochain Mouvement"
              icon-left="pi pi-plus"
              @click="navigateTo(`/stock/ajouter`)"
           />
           <AppButton 
              variant="secondary"
              icon-left="pi pi-pencil"
              @click="navigateTo(`/produits/modifier/${details.product.id}`)"
           />
           <AppButton 
              variant="secondary"
              icon-left="pi pi-arrow-left"
              @click="router.back()"
           />
      </div>
    </div>

    <!-- KPIs -->
    <div v-if="details" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStat 
            label="Stock Total" 
            :value="details.kpi.total_stock" 
            icon="tabler:box-seam" 
            variant="primary" 
        />
        <CardStat 
            label="Valeur Estimée" 
            :value="formatPrice(details.kpi.stock_value)" 
            icon="tabler:coin" 
            variant="success" 
        />
        <CardStat 
            label="Ventes (30j)" 
            :value="details.kpi.rotation_30d" 
            icon="tabler:refresh" 
            variant="warning"
            trend-label="ventes" 
        />
    </div>

    <!-- Contenu Principal : Onglets Tableaux -->
    <div v-if="details" class="bg-white flex flex-col gap-4 rounded-lg p-4 border border-gray-100 shadow-sm overflow-hidden h-full">
        <div class="">
             <TabSelector v-model="activeTab" :options="tabs" />
        </div>

        <div class="p-0 h-full">
             <!-- Onglet 1: Historique Mouvements -->
             <div v-if="activeTab === 'mouvements'">
                 <TableSimple 
                    :data="details.recent_movements" 
                    :columns="movementColumns"
                    :loading="loading"
                    :show-actions="false"
                 >
                    <template #column-type="{ data }: { data: any }">
                        <span :class="getTypeBadgeClass(data.type)" class="px-2 py-1 rounded text-xs font-semibold">
                            {{ formatType(data.type) }}
                        </span>
                    </template>
                    <template #column-date_creation="{ data }: { data: any }">
                        {{ formatDate(data.date_creation) }}
                    </template>
                    <template #column-quantite="{ data }: { data: any }">
                         <span :class="isPositiveMovement(data) ? 'text-green-600' : 'text-red-600'" class="font-bold">
                             {{ isPositiveMovement(data) ? '+' : '-' }}{{ data.quantite }}
                         </span>
                    </template>
                    <template #column-utilisateur="{ data }: { data: any }">
                        <div class="flex items-center gap-1 text-gray-500">
                             <Icon icon="tabler:user" class="text-xs" /> 
                             {{ data.utilisateur?.employee?.fullName || data.utilisateur?.email || 'Système' }}
                        </div>
                    </template>
                 </TableSimple>
             </div>

             <!-- Onglet 2: Lots (Conditionnel) -->
             <div v-else-if="activeTab === 'lots'">
                 <!-- <div v-if="!details.lots.length" class="p-10 flex flex-col items-center justify-center text-gray-400">
                      <Icon icon="tabler:box-off" class="text-4xl mb-2" />
                      <p>Aucun lot actif pour ce produit.</p>
                 </div> -->
                 <TableSimple 
                    v-if="details.product.gere_peremption"
                    :data="details.lots" 
                    :columns="lotColumns"
                    :loading="loading"
                    :show-actions="false"
                 >
                    <template #column-date_peremption="{ data }: { data: any }">
                         <span :class="getExpirationClass(data.date_peremption)" class="flex items-center gap-1 font-medium">
                             {{ formatDate(data.date_peremption) }}
                             <Icon v-if="isExpired(data.date_peremption)" icon="tabler:alert-circle" />
                         </span>
                    </template>
                 </TableSimple>
             </div>
             
             <!-- Onglet 3: Répartition Magasins -->
             <div v-else-if="activeTab === 'stores'">
                 <TableSimple 
                    :data="details.stocks_by_store" 
                    :columns="storeColumns"
                    :loading="loading"
                    :show-actions="false"
                 />
             </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useStockApi, type ProductStockDetails } from '~/composables/api/useStockApi';
import { useCurrency } from '~/composables/useCurrency';
import { useDate } from '~/composables/useDate';
import CardStat from '~/components/card/CardStat.vue';
import TableSimple from '~/components/table/TableSimple.vue';
import TabSelector from '~/components/common/TabSelector.vue';
import AppButton from '~/components/button/AppButton.vue';
import Badge from 'primevue/badge';

const route = useRoute();
const router = useRouter();
const { getProductStockDetails } = useStockApi();
const { formatPrice } = useCurrency();
const { formatDate: formatDateShort } = useDate();

const productId = route.params.id as string;
const loading = ref(true);
const details = ref<ProductStockDetails | null>(null);

// Tabs Configuration
const activeTab = ref('mouvements');
const tabs = computed(() => {
    const t = [
        { value: 'mouvements', label: 'Historique Mouvements', icon: 'tabler:history' },
        { value: 'stores', label: 'Stock par Magasin', icon: 'tabler:building-store' }
    ];
    // Ajout conditionnel de l'onglet Lots
    if (details.value?.product.gere_peremption) {
        t.splice(1, 0, { value: 'lots', label: 'Gestion des Lots', icon: 'tabler:packages' });
    }
    return t;
});

// Table Columns Configuration
const movementColumns = [
    { field: 'date_creation', header: 'Date', sortable: true, customRender: true },
    { field: 'type', header: 'Type', sortable: true, customRender: true },
    { field: 'quantite', header: 'Quantité', sortable: true, customRender: true },
    { field: 'raison', header: 'Raison / Référence' },
    { field: 'utilisateur', header: 'Vendeur', customRender: true },
];

const lotColumns = [
    { field: 'numero_lot', header: 'Numéro de Lot', sortable: true },
    { field: 'date_peremption', header: 'Date Péremption', sortable: true, customRender: true },
    { field: 'quantite', header: 'Quantité Restante', sortable: true },
    { field: 'magasin_nom', header: 'Emplacement' },
];

const storeColumns = [
    { field: 'magasin.nom', header: 'Magasin', sortable: true },
    { field: 'quantite', header: 'Stock Physique', sortable: true },
];

// Helpers
const formatDate = (d: string) => formatDateShort(d);

const formatType = (type: string) => {
    const map: Record<string, string> = {
        'ENTREE_ACHAT': 'Entrée',
        'ENTREE_INITIALE': 'Stock Initial',
        'ENTREE_RETOUR': 'Retour client',
        'SORTIE_VENTE': 'Vente',
        'SORTIE_PERISSABLE': 'Périssable',
        'SORTIE_INVENDU': 'Invendu',
        'AJUSTEMENT': 'Ajustement',
        'TRANSFERT': 'Transfert'
    };
    return map[type] || type;
};

const getTypeBadgeClass = (type: string) => {
    if (['ENTREE_ACHAT', 'ENTREE_INITIALE', 'ENTREE_RETOUR'].includes(type)) return 'bg-green-100 text-green-700';
    if (type === 'AJUSTEMENT') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
};

// Détermine si un mouvement est positif (entrée) ou négatif (sortie)
const isPositiveMovement = (data: any): boolean => {
    const type = data.type;
    const raison = data.raison?.toLowerCase() || '';
    
    // Types d'entrée classiques
    if (['ENTREE_ACHAT', 'ENTREE_INITIALE', 'ENTREE_RETOUR'].includes(type)) {
        return true;
    }
    
    // Pour AJUSTEMENT, on détecte via la raison
    if (type === 'AJUSTEMENT') {
        // Si la raison contient "surplus" ou "ajout", c'est une entrée
        if (raison.includes('surplus') || raison.includes('ajout')) {
            return true;
        }
        // Sinon c'est une sortie (manque, retrait, etc.)
        return false;
    }
    
    // Tous les autres types (SORTIE_VENTE, SORTIE_PERISSABLE, TRANSFERT) sont des sorties
    return false;
};

const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

const getExpirationClass = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const threeMonths = new Date(); 
    threeMonths.setMonth(now.getMonth() + 3);

    if (d < now) return 'text-red-600 font-bold';
    if (d < threeMonths) return 'text-orange-500 font-bold';
    return 'text-green-600';
};

// Fetch Data
const fetchDetails = async () => {
    loading.value = true;
    try {
        details.value = await getProductStockDetails(productId);
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchDetails();
});
</script>