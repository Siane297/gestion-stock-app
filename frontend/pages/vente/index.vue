<template>
  <div>
    <SimplePageHeader
      title="Historique des Ventes"
      description="Consultez et gérez l'historique de vos ventes"
    />

    <div class="mt-6">
      <TableGeneric
        :data="ventes"
        :columns="columns"
        :loading="loading"
        :search-fields="['client.nom', 'utilisateur.employee.fullName', 'id']"
        delete-label-field="id"
        :global-action="{
          label: 'Nouvelle Vente',
          icon: 'pi pi-plus',
          link: '/point-vente'
        }"
        @action:view="viewDetails"
        @action:delete="handleDelete"
      >
        <!-- Custom rendering for Products column -->
        <template #column-produits="{ data }">
          <div class="flex flex-col gap-1 text-sm">
              <div v-for="detail in ((data as unknown) as Vente).details" :key="detail.id" class="flex flex-wrap gap-1 items-center">
                  <span class="font-medium text-gray-700">{{ detail.produit?.nom }}</span>
                  <span class="text-gray-500 text-xs text-nowrap">
                     x{{ detail.quantite }} ({{ detail.conditionnement?.nom }})
                  </span>
              </div>
              <div v-if="!((data as unknown) as Vente).details || ((data as unknown) as Vente).details?.length === 0" class="text-gray-400 italic">
                  Aucun détail
              </div>
          </div>
        </template>
  
        <!-- Custom rendering for Status -->
        <template #column-statut="{ data }">
          <Tag :value="((data as unknown) as Vente).statut" :severity="getSeverity(((data as unknown) as Vente).statut)" />
        </template>
  
        <!-- Custom rendering for Payment -->
        <template #column-methode_paiement="{ data }">
          <Tag :value="((data as unknown) as Vente).methode_paiement" severity="secondary" />
        </template>
  
          <!-- Custom rendering for Date -->
          <template #column-date_creation="{ data }">
              {{ new Date(((data as unknown) as Vente).date_creation).toLocaleString('fr-FR') }}
          </template>
      </TableGeneric>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TableGeneric, { type TableColumn } from '~/components/table/TableGeneric.vue';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import { useVenteApi, type Vente } from '~/composables/api/useVenteApi';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const { getVentes, updateVenteStatut } = useVenteApi();
const toast = useToast();

const ventes = ref<Vente[]>([]);
const loading = ref(false);

const columns: TableColumn[] = [
  { field: 'date_creation', header: 'Date', sortable: true, customRender: true }, // Using customRender to format date
//   { field: 'client.nom', header: 'Client', sortable: true },
  { field: 'produits', header: 'Produits / Cond.', sortable: false, customRender: true },
  { field: 'montant_total', header: 'Total', sortable: true, type: 'price' },
  { field: 'methode_paiement', header: 'Paiement', sortable: true, customRender: true },
  { field: 'statut', header: 'Statut', sortable: true, customRender: true },
  { field: 'utilisateur.employee.fullName', header: 'Vendeur', sortable: true },
];

const loadVentes = async () => {
  loading.value = true;
  try {
    ventes.value = await getVentes();
  } catch (error) {
    console.error("Erreur chargement ventes", error);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les ventes', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const getSeverity = (status: string) => {
    switch (status) {
        case 'PAYEE': return 'success';
        case 'EN_ATTENTE': return 'warning';
        case 'ANNULEE': return 'danger';
        default: return 'info';
    }
};

const viewDetails = (vente: Vente) => {
    // TODO: Navigate to details page or show modal
    console.log("View", vente);
    // router.push(`/ventes/${vente.id}`); 
};

const handleDelete = async (vente: Vente) => {
    // Usually we don't 'delete' sales easily, maybe we cancel them?
    // For now assuming delete functionality is restricted or mapped to CANCEL
    try {
        await updateVenteStatut(vente.id, 'ANNULEE');
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Vente annulée', life: 3000 });
        loadVentes();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'annulation", life: 3000 });
    }
};

onMounted(() => {
  loadVentes();
});
</script>