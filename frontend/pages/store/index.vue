<template>
  <div>
    <SimplePageHeader
      title="Gestion des Magasins"
      description="Consultez et gérez vos points de vente et entrepôts"
    />

    <div class="mt-6">
      <TableGeneric
        :columns="columns"
        :data="magasins"
        :loading="loading"
        :global-action="{
          label: 'Nouveau Magasin',
          icon: 'pi pi-plus',
          link: '/store/ajouter'
        }"
        search-placeholder="Rechercher un magasin..."
        :search-fields="['nom', 'localisation', 'email']"
        delete-label-field="nom"
        @action:view="handleView"
        @action:edit="handleEdit"
        @action:delete="handleDelete"
      >
        <template #column-est_actif="{ data }">
            <Tag :value="(data as any).est_actif ? 'Actif' : 'Inactif'" :severity="(data as any).est_actif ? 'success' : 'secondary'" />
        </template>
      </TableGeneric>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import TableGeneric from '~/components/table/TableGeneric.vue';
import Tag from 'primevue/tag';
import { useMagasinApi } from '~/composables/api/useMagasinApi';

const { getMagasins, deleteMagasin } = useMagasinApi();
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();

const magasins = ref<any[]>([]);
const loading = ref(false);

const loadData = async () => {
    loading.value = true;
    try {
        magasins.value = await getMagasins();
    } catch (e) {
        console.error("Erreur chargement magasins", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les magasins', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const columns = [
  { field: 'nom', header: 'Nom', sortable: true },
  { field: 'localisation', header: 'Localisation', sortable: true },
  { field: 'telephone', header: 'Téléphone' },
  { field: 'email', header: 'Email' },
  { field: 'est_actif', header: 'Statut', customRender: true, sortable: true }
];

onMounted(() => {
    loadData();
});

const handleView = (item: any) => {
    // Rediriger vers détails ou stock du magasin
    router.push(`/store/${item.id}`); 
};

const handleEdit = (item: any) => {
    router.push(`/store/modifier/${item.id}`);
};

const handleDelete = async (item: any) => {
  try {
    await deleteMagasin(item.id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Magasin supprimé', life: 3000 });
    loadData(); // Refresh list
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer ce magasin', life: 5000 });
  }
};
</script>