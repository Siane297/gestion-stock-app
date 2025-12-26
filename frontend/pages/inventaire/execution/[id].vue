<template>
  <div>
    <SimplePageHeader
      :title="`Inventaire ${inventaire?.numero || ''}`"
      :description="`Comptage des stocks - ${inventaire?.magasin?.nom || ''}`"
    />

    <!-- Barre de progression globale -->
    <div v-if="inventaire" class="mt-6 bg-white border-2 border-gris/40 rounded-xl p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-gray-700">Progression</span>
            <span class="text-lg font-bold text-primary">{{ inventaire.stats?.progression || 0 }}%</span>
          </div>
          <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary rounded-full transition-all duration-500" 
              :style="{ width: `${inventaire.stats?.progression || 0}%` }"
            ></div>
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-500">
            <span>{{ inventaire.stats?.produits_comptes || 0 }} comptés</span>
            <span>{{ inventaire.stats?.total_produits || 0 }} produits</span>
          </div>
        </div>
        
        <div class="flex gap-3">
          <AppButton
            v-if="canFinalize"
            label="Finaliser l'inventaire"
            icon="pi pi-check"
            variant="primary"
            @click="handleFinalize"
            :loading="loadingFinalize"
          />
        </div>
      </div>
    </div>

    <!-- Barre de recherche -->
    <div class="mt-4 bg-white border-2 border-gris/40 rounded-xl p-4">
      <IconField iconPosition="left">
        <InputIcon>
          <i class="pi pi-search"></i>
        </InputIcon>
        <InputText
          v-model="searchQuery"
          placeholder="Rechercher un produit (nom ou code barre)..."
          class="w-full"
        />
      </IconField>
    </div>

    <!-- Liste des produits à compter -->
    <div class="mt-4">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
      </div>

      <!-- Produits en grille 2 colonnes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InventaireComptageCard
          v-for="detail in filteredDetails" 
          :key="detail.id"
          v-model="comptages[detail.id]"
          :detail="detail"
          :loading="savingDetail === detail.id"
          @save="saveComptage"
          @change="handleComptageChange"
        />
      </div>

      <!-- Empty state -->
      <div v-if="!loading && filteredDetails.length === 0" class="text-center py-12 text-gray-500">
        <i class="pi pi-search text-4xl mb-4"></i>
        <p>Aucun produit trouvé</p>
      </div>
    </div>

    <Toast />
    
    <!-- Dialog de confirmation pour finalisation partielle -->
    <ConfirmationDialog
      v-model:visible="showConfirmFinalize"
      :message="confirmFinalizeMessage"
      header="Finaliser l'inventaire avec des produits non comptés"
      accept-label="Oui, finaliser"
      reject-label="Non, continuer le comptage"
      @accept="proceedFinalize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import { useInventaireApi, type Inventaire, type InventaireDetail } from '~/composables/api/useInventaireApi';
import { usePermissions } from '~/composables/usePermissions';
import InventaireComptageCard from '~/components/inventaire/InventaireComptageCard.vue';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Toast from 'primevue/toast';

const { getInventaireById, updateComptage, finalizeInventaire } = useInventaireApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const inventaireId = route.params.id as string;

const inventaire = ref<Inventaire | null>(null);
const loading = ref(true);
const searchQuery = ref('');
const comptages = ref<Record<string, number | null | undefined>>({});
const savingDetail = ref<string | null>(null);
const loadingFinalize = ref(false);
const showConfirmFinalize = ref(false);

// Vérification des permissions
if (!hasPermission('inventaire', 'modifier')) {
  router.push('/inventaire');
}

const filteredDetails = computed(() => {
  if (!inventaire.value?.details) return [];
  
  const query = searchQuery.value.toLowerCase();
  if (!query) return inventaire.value.details;
  
  return inventaire.value.details.filter(d => 
    d.produit?.nom?.toLowerCase().includes(query) ||
    d.produit?.code_barre?.toLowerCase().includes(query) ||
    d.lot?.numero_lot?.toLowerCase().includes(query)
  );
});

const canFinalize = computed(() => {
  if (!inventaire.value) return false;
  if (inventaire.value.statut !== 'EN_COURS') return false;
  // Permettre la finalisation dès qu'au moins un produit est compté
  return (inventaire.value.stats?.produits_comptes || 0) > 0;
});

const confirmFinalizeMessage = computed(() => {
  const nonComptes = inventaire.value?.details?.filter(d => !d.est_compte).length || 0;
  return `⚠️ Attention : ${nonComptes} produit(s) n'ont pas été comptés.\n\n` +
         `Ces produits conserveront leur stock théorique actuel et ne seront pas ajustés.\n\n` +
         `Voulez-vous vraiment finaliser l'inventaire maintenant ?`;
});

const loadInventaire = async () => {
  loading.value = true;
  try {
    inventaire.value = await getInventaireById(inventaireId);
    
    if (!inventaire.value) {
      toast.add({ severity: 'error', summary: 'Erreur', detail: 'Inventaire non trouvé', life: 3000 });
      router.push('/inventaire');
      return;
    }
    
    if (inventaire.value.statut !== 'EN_COURS') {
      if (inventaire.value.statut === 'BROUILLON') {
        toast.add({ severity: 'warn', summary: 'Attention', detail: 'Cet inventaire n\'a pas encore été démarré', life: 3000 });
      }
      router.push(`/inventaire/rapport/${inventaireId}`);
      return;
    }
    
    // Initialiser les comptages avec les valeurs existantes
    inventaire.value.details?.forEach(detail => {
      comptages.value[detail.id] = detail.quantite_comptee ?? detail.quantite_theorique;
    });
  } catch (e: any) {
    console.error('Erreur chargement inventaire', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger l\'inventaire', life: 3000 });
    router.push('/inventaire');
  } finally {
    loading.value = false;
  }
};

const handleComptageChange = (detail: InventaireDetail) => {
  // Juste mettre à jour localement, la sauvegarde se fait au clic sur le bouton
};

const saveComptage = async (detail: InventaireDetail) => {
  const quantite = comptages.value[detail.id];
  if (quantite === undefined || quantite === null) return;
  
  savingDetail.value = detail.id;
  try {
    const updated = await updateComptage(inventaireId, detail.id, { quantite_comptee: quantite });
    
    // Mettre à jour le détail localement
    if (inventaire.value?.details) {
      const index = inventaire.value.details.findIndex(d => d.id === detail.id);
      if (index !== -1 && updated) {
        inventaire.value.details[index] = updated;
      }
    }
    
    // Recharger les stats
    await loadInventaire();
    
    toast.add({ severity: 'success', summary: 'Enregistré', detail: `${detail.produit?.nom} compté`, life: 2000 });
  } catch (e: any) {
    console.error('Erreur sauvegarde comptage', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible d\'enregistrer le comptage', life: 3000 });
  } finally {
    savingDetail.value = null;
  }
};

const handleFinalize = async () => {
  if (!inventaire.value) return;
  
  // Vérifier s'il reste des produits non comptés
  const nonComptes = inventaire.value.details?.filter(d => !d.est_compte).length || 0;
  
  if (nonComptes > 0) {
    // Afficher un dialog de confirmation
    showConfirmFinalize.value = true;
    return;
  }
  
  // Si tous les produits sont comptés, finaliser directement
  await proceedFinalize();
};

const proceedFinalize = async () => {
  if (!inventaire.value) return;
  
  loadingFinalize.value = true;
  try {
    await finalizeInventaire(inventaireId);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Inventaire finalisé', life: 3000 });
    router.push(`/inventaire/rapport/${inventaireId}`);
  } catch (e: any) {
    console.error('Erreur finalisation', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de finaliser l\'inventaire', life: 3000 });
  } finally {
    loadingFinalize.value = false;
  }
};

onMounted(() => {
  loadInventaire();
});
</script>
