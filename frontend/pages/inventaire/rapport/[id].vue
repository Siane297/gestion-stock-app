<template>
  <div>
    <SimplePageHeader :title="`Rapport Inventaire ${inventaire?.numero || ''}`"
      :description="`${inventaire?.magasin?.nom || ''} - ${formatDate(inventaire?.date_creation)}`" />

    <!-- Statut et actions -->
    <div v-if="inventaire" class="mt-6 bg-white border-2 border-gris/40 rounded-xl p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4">
          <Tag :value="getStatutLabel(inventaire.statut)" :severity="getStatutSeverity(inventaire.statut)"
            class="text-lg px-4 h-full py-4" />

          <div class="flex flex-col gap-2">
            <div v-if="inventaire.utilisateur_debut" class="text-sm font-medium text-noir">
              Initié par: <span class="font-medium uppercase text-primary">{{ inventaire.utilisateur_debut.employee?.fullName ||
                inventaire.utilisateur_debut.email }}</span>
            </div>

            <div v-if="inventaire.utilisateur_validation" class="text-sm font-medium text-noir">
              Validé par: <span class="font-medium uppercase text-primary">{{ inventaire.utilisateur_validation.employee?.fullName ||
                inventaire.utilisateur_validation.email }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <AppButton v-if="inventaire.statut === 'TERMINE' && hasPermission('inventaire', 'valider')"
            label="Valider et Ajuster Stock" icon="pi pi-check-circle" variant="primary" @click="handleValidate"
            :loading="loadingValidate" :full-width="true" class="sm:!w-auto" />
          <AppButton v-if="['TERMINE', 'VALIDE'].includes(inventaire.statut)" label="Imprimer Rapport"
            icon="pi pi-print" variant="outline" class=" !bg-orange-500 text-white sm:!w-auto" :full-width="true" @click="handlePrint" :loading="loadingPrint" />
          <AppButton label="Retour" icon="pi pi-arrow-left" variant="outline"
            :full-width="true" class="sm:!w-auto"
            @click="router.push('/inventaire')" />
        </div>
      </div>
    </div>

    <!-- Statistiques récapitulatives -->
    <div v-if="inventaire?.stats" class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardStat icon="tabler:box" :value="inventaire.stats.total_produits" label="Total Produits" variant="info" />

      <CardStat icon="tabler:clipboard-check" :value="inventaire.stats.produits_comptes" label="Produits Comptés"
        :trend="inventaire.stats.progression" trendLabel="progression" variant="primary" />

      <CardStat icon="tabler:trending-up" :value="formatPrice(inventaire.stats.valeur_ecart_positif)"
        label="Écart Positif" variant="success" />

      <CardStat icon="tabler:trending-down" :value="formatPrice(inventaire.stats.valeur_ecart_negatif)"
        label="Écart Négatif" variant="danger" />
    </div>

    <!-- Tableau des détails -->
    <div class="mt-6 bg-white border-2 border-gris/40 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Détails par produit</h3>

      <!-- Filtres -->
      <div class="flex flex-wrap gap-4 mb-4">
        <Select v-model="filterEcart" :options="filterOptions" optionLabel="label" optionValue="value"
          placeholder="Filtrer par écart" showClear class="w-48" />

        <IconField iconPosition="left" class="flex-1">
          <InputIcon>
            <i class="pi pi-search"></i>
          </InputIcon>
          <InputText v-model="searchQuery" placeholder="Rechercher..." class="w-full" />
        </IconField>
      </div>

      <!-- Table -->
      <!-- Table Desktop -->
      <div class="hidden md:block">
        <DataTable :value="filteredDetails" :paginator="true" :rows="20" :rowsPerPageOptions="[10, 20, 50]"
          responsiveLayout="scroll" stripedRows class="custom-table" :loading="loading">
          <template #empty>
            <div class="text-center py-8 text-gray-500">
              Aucun produit trouvé
            </div>
          </template>

          <Column field="produit.nom" header="Produit" sortable
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ data.produit?.nom }}</span>
                <span v-if="data.lot" class="text-xs text-gray-500">(Lot: {{ data.lot.numero_lot }})</span>
              </div>
            </template>
          </Column>

          <Column field="quantite_theorique" header="Théorique" sortable
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4">
            <template #body="{ data }">
              <span class="font-medium">{{ data.quantite_theorique }}</span>
            </template>
          </Column>

          <Column field="quantite_comptee" header="Compté" sortable
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4">
            <template #body="{ data }">
              <span class="font-medium">{{ data.quantite_comptee ?? '-' }}</span>
            </template>
          </Column>

          <Column field="ecart" header="Écart" sortable
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4">
            <template #body="{ data }">
              <span v-if="data.ecart !== null" class="font-bold" :class="{
                'text-green-600': data.ecart > 0,
                'text-red-600': data.ecart < 0,
                'text-gray-500': data.ecart === 0
              }">
                {{ data.ecart > 0 ? '+' : '' }}{{ data.ecart }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </Column>

          <Column field="valeur_ecart" header="Valeur Écart" sortable
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4">
            <template #body="{ data }">
              <span v-if="data.valeur_ecart !== null" class="font-medium" :class="{
                'text-green-600': data.valeur_ecart > 0,
                'text-red-600': data.valeur_ecart < 0,
                'text-gray-500': data.valeur_ecart === 0
              }">
                {{ formatPrice(data.valeur_ecart) }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </Column>

          <Column field="est_compte" header="État" sortable
            headerClass="!bg-bleu text-black text-[13px] font-semibold py-3 px-4">
            <template #body="{ data }">
              <Tag :value="data.est_compte ? 'Compté' : 'Non compté'"
                :severity="data.est_compte ? 'success' : 'danger'" />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Vue Mobile -->
      <div class="grid grid-cols-2 gap-3 md:hidden">
        <div v-if="loading" class="col-span-2 text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>
        
        <template v-else-if="filteredDetails.length > 0">
          <MobileCard v-for="(detail, index) in paginatedMobileDetails" :key="index" class="!gap-2">
            <!-- Header: Produit -->
            <template #header>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-900 truncate text-[13px]">{{ detail.produit?.nom }}</div>
                <div class="flex flex-wrap items-center gap-1 mt-1">
                  <div class="flex items-center gap-1 text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                     <IconifyIcon icon="mdi:barcode" class="shrink-0" />
                     <span class="truncate">{{ detail.produit?.code_barre || 'Sans code' }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Body: Grid Details -->
            <div class="flex flex-col gap-2 text-sm">
                <!-- Tag en haut du corps pour gagner de la place en header -->
                <Badge :value="detail.est_compte ? 'Compté' : 'Non compté'" 
                     :severity="detail.est_compte ? 'success' : 'danger'" 
                     class="!text-[8px] self-start" />

                <!-- Stocks -->
                <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div class="flex justify-between items-center text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                        <span>Théorie</span>
                        <span>Compté</span>
                    </div>
                    <div class="flex justify-between items-baseline">
                        <span class="font-medium text-gray-600 text-xs">{{ detail.quantite_theorique }}</span>
                        <span class="font-bold text-sm" :class="detail.est_compte ? 'text-blue-600' : 'text-gray-400'">
                            {{ detail.quantite_comptee ?? '-' }}
                        </span>
                    </div>
                </div>

                <!-- Ecart & Valeur -->
                <div class="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col">
                     <div class="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">Écart</div>
                     
                     <div class="flex items-center justify-between">
                         <div v-if="detail.ecart != null" class="flex items-center gap-0.5 font-bold text-sm" :class="{
                            'text-green-600': (detail.ecart ?? 0) > 0,
                            'text-red-600': (detail.ecart ?? 0) < 0,
                            'text-gray-500': (detail.ecart ?? 0) === 0
                          }">
                            <IconifyIcon v-if="(detail.ecart ?? 0) > 0" icon="tabler:trending-up" class="text-xs" />
                            <IconifyIcon v-if="(detail.ecart ?? 0) < 0" icon="tabler:trending-down" class="text-xs" />
                            <span>{{ (detail.ecart ?? 0) > 0 ? '+' : '' }}{{ detail.ecart }}</span>
                         </div>
                         <span v-else class="text-gray-400 text-xs">-</span>

                         <div v-if="detail.valeur_ecart != null" class="text-[10px] font-bold" :class="{
                            'text-green-600': (detail.valeur_ecart ?? 0) > 0,
                            'text-red-600': (detail.valeur_ecart ?? 0) < 0,
                            'text-gray-500': (detail.valeur_ecart ?? 0) === 0
                          }">
                            {{ formatPrice(detail.valeur_ecart) }}
                         </div>
                     </div>
                </div>
            </div>
          </MobileCard>

          <!-- Paginator Mobile -->
          <div class="col-span-2 pt-2">
              <Paginator 
                  :rows="mobileRows" 
                  :totalRecords="filteredDetails.length" 
                  :rowsPerPageOptions="[10, 20, 50]"
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                  @page="onMobilePage"
                  class="custom-paginator-mobile"
              />
          </div>
        </template>
        
        <div v-else class="col-span-2 text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
             <IconifyIcon icon="tabler:database-off" class="text-4xl text-gray-300 mx-auto mb-2" />
             <p class="text-gray-500 font-medium">Aucun produit trouvé</p>
        </div>
      </div>
    </div>


    <ConfirmationDialog v-model:visible="showConfirmValidate"
      message="Cette action va ajuster les stocks selon les écarts détectés. Les mouvements de stock seront créés automatiquement. Cette action est irréversible. Voulez-vous continuer ?"
      header="Validation de l'inventaire" accept-label="Oui, valider" reject-label="Non, annuler"
      @accept="confirmValidate" />
  </div>
</template>

<script setup lang="ts">
import MobileCard from '~/components/mobile/MobileCard.vue';
import { Icon as IconifyIcon } from '@iconify/vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import CardStat from '~/components/card/CardStat.vue';
import { useInventaireApi, type Inventaire, type StatutInventaire } from '~/composables/api/useInventaireApi';
import { usePermissions } from '~/composables/usePermissions';
import { useCurrency } from '~/composables/useCurrency';
import { useSecurePdf } from '~/composables/useSecurePdf';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Paginator from 'primevue/paginator';
import Toast from 'primevue/toast';

const { getInventaireById, validateInventaire } = useInventaireApi();
const { hasPermission } = usePermissions();
const { formatPrice } = useCurrency();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const inventaireId = route.params.id as string;

const inventaire = ref<Inventaire | null>(null);
const loading = ref(true);
const searchQuery = ref('');
const filterEcart = ref<string | null>(null);
const loadingValidate = ref(false);
const loadingPrint = ref(false);
const showConfirmValidate = ref(false);

const { generateInventairePdf } = useSecurePdf();

const filterOptions = [
  { label: 'Tous', value: null },
  { label: 'Avec écart positif', value: 'positif' },
  { label: 'Avec écart négatif', value: 'negatif' },
  { label: 'Sans écart', value: 'zero' },
  { label: 'Non comptés', value: 'non_compte' },
];

const filteredDetails = computed(() => {
  if (!inventaire.value?.details) return [];

  let result = inventaire.value.details;

  // Filtre par écart
  if (filterEcart.value) {
    switch (filterEcart.value) {
      case 'positif':
        result = result.filter(d => (d.ecart || 0) > 0);
        break;
      case 'negatif':
        result = result.filter(d => (d.ecart || 0) < 0);
        break;
      case 'zero':
        result = result.filter(d => d.ecart === 0);
        break;
      case 'non_compte':
        result = result.filter(d => !d.est_compte);
        break;
    }
  }

  // Recherche
  const query = searchQuery.value.toLowerCase();
  if (query) {
    result = result.filter(d =>
      d.produit?.nom?.toLowerCase().includes(query) ||
      d.produit?.code_barre?.toLowerCase().includes(query) ||
      d.lot?.numero_lot?.toLowerCase().includes(query)
    );
  }

  return result;
});

// Pagination Mobile
const mobileFirst = ref(0);
const mobileRows = ref(10);

const paginatedMobileDetails = computed(() => {
  return filteredDetails.value.slice(mobileFirst.value, mobileFirst.value + mobileRows.value);
});

const onMobilePage = (event: any) => {
  mobileFirst.value = event.first;
  mobileRows.value = event.rows;
};

const loadInventaire = async () => {
  loading.value = true;
  try {
    inventaire.value = await getInventaireById(inventaireId);

    if (!inventaire.value) {
      toast.add({ severity: 'error', summary: 'Erreur', detail: 'Inventaire non trouvé', life: 3000 });
      router.push('/inventaire');
      return;
    }

    // Si l'inventaire est en cours, rediriger vers l'exécution
    if (inventaire.value.statut === 'EN_COURS') {
      router.push(`/inventaire/execution/${inventaireId}`);
      return;
    }
  } catch (e: any) {
    console.error('Erreur chargement inventaire', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger l\'inventaire', life: 3000 });
    router.push('/inventaire');
  } finally {
    loading.value = false;
  }
};

const handleValidate = () => {
  showConfirmValidate.value = true;
};

const confirmValidate = async () => {
  loadingValidate.value = true;
  try {
    await validateInventaire(inventaireId);
    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Inventaire validé. Les stocks ont été ajustés.',
      life: 5000
    });
    await loadInventaire();
  } catch (e: any) {
    console.error('Erreur validation', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de valider l\'inventaire', life: 3000 });
  } finally {
    loadingValidate.value = false;
  }
};

const handlePrint = async () => {
  loadingPrint.value = true;
  try {
    await generateInventairePdf(inventaireId);
  } catch (e) {
    // Erreur déjà gérée par le composable via toast
  } finally {
    loadingPrint.value = false;
  }
};

const getStatutLabel = (statut: StatutInventaire): string => {
  const labels: Record<StatutInventaire, string> = {
    BROUILLON: 'Brouillon',
    EN_COURS: 'En cours',
    TERMINE: 'Terminé',
    VALIDE: 'Validé'
  };
  return labels[statut] || statut;
};

const getStatutSeverity = (statut: StatutInventaire): string => {
  const severities: Record<StatutInventaire, string> = {
    BROUILLON: 'secondary',
    EN_COURS: 'info',
    TERMINE: 'warn',
    VALIDE: 'success'
  };
  return severities[statut] || 'secondary';
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

onMounted(() => {
  loadInventaire();
});
</script>

<style scoped>
:deep(.custom-table) {
  @apply rounded-lg border overflow-hidden shadow-sm;
}

:deep(.custom-table .p-datatable-tbody > tr > td) {
  @apply text-sm py-3 border-b border-gray-100;
}

:deep(.custom-paginator-mobile) {
    @apply !bg-transparent !p-0 !border-none;
}

:deep(.custom-paginator-mobile .p-paginator-content) {
    @apply !justify-center !gap-1;
}

:deep(.custom-paginator-mobile .p-paginator-page),
:deep(.custom-paginator-mobile .p-paginator-first),
:deep(.custom-paginator-mobile .p-paginator-prev),
:deep(.custom-paginator-mobile .p-paginator-next),
:deep(.custom-paginator-mobile .p-paginator-last) {
    @apply !min-w-[32px] !h-8 !text-xs !rounded-lg;
}
</style>
