<template>
  <div class="space-y-6">
    <!-- En-tête avec bouton Ajouter -->
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-semibold text-gray-700">{{ title }}</h3>
      <AppButton
        label="Ajouter"
        icon="lucide:plus"
        variant="primary"
        size="sm"
        @click="openAddDialog"
      />
    </div>

    <!-- Liste des éléments -->
    <div v-if="loading" class="flex justify-center py-8">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <p>Aucun élément trouvé</p>
      <AppButton
        label="Ajouter maintenant"
        variant="outline"
        size="sm"
        class="mt-2"
        @click="openAddDialog"
      />
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
      >
        <span class="font-medium text-gray-800">{{ item[itemLabel] }}</span>
        
        <div class="flex gap-2">
          <AppButton
            icon="lucide:pencil"
            variant="secondary"
            size="sm"
            class="text-blue-600 hover:bg-blue-50"
            @click="openEditDialog(item)"
          />
          <AppButton
            icon="lucide:trash-2"
            variant="secondary"
            size="sm"
            class="text-red-600 hover:bg-red-50"
            @click="confirmDelete(item)"
          />
        </div>
      </div>
    </div>

    <!-- Popup Formulaire -->
    <FormPopupDynamique
      v-model:visible="showDialog"
      :title="editingItem ? `Modifier ${singularTitle}` : `Ajouter ${singularTitle}`"
      :description="editingItem ? `Modifier les informations` : `Créer un nouvel élément`"
      :fields="computedFields"
      :loading="submitting"
      @submit="handleSubmit"
    />

    <!-- Dialog Confirmation Suppression -->
    <ConfirmationDialog
      v-model:visible="showDeleteDialog"
      header="Confirmation de suppression"
      message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
      acceptLabel="Supprimer"
      rejectLabel="Annuler"
      variant="danger"
      @accept="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import AppButton from '~/components/button/AppButton.vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import { useToast } from 'primevue/usetoast';

interface Props {
  title: string;
  singularTitle?: string;
  fetcher: () => Promise<any[]>;
  creator: (data: any) => Promise<any>;
  updater: (id: string, data: any) => Promise<any>;
  deleter: (id: string) => Promise<boolean>;
  formFields: any[];
  itemLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  singularTitle: 'élément',
  itemLabel: 'name',
});

const toast = useToast();
const items = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const editingItem = ref<any | null>(null);
const itemToDelete = ref<any | null>(null);

// Charger les données
const loadItems = async () => {
  loading.value = true;
  try {
    items.value = await props.fetcher();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de charger les données',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(loadItems);

// Configuration des champs du formulaire
const computedFields = computed(() => {
  if (!editingItem.value) return props.formFields;
  
  // Pré-remplir les champs en mode édition
  return props.formFields.map(field => ({
    ...field,
    value: editingItem.value[field.name]
  }));
});

// Actions
const openAddDialog = () => {
  editingItem.value = null;
  showDialog.value = true;
};

const openEditDialog = (item: any) => {
  editingItem.value = item;
  showDialog.value = true;
};

const confirmDelete = (item: any) => {
  itemToDelete.value = item;
  showDeleteDialog.value = true;
};

const handleSubmit = async (data: any) => {
  submitting.value = true;
  try {
    if (editingItem.value) {
      await props.updater(editingItem.value.id, data);
      toast.add({ severity: 'success', summary: 'Succès', detail: 'Modifié avec succès', life: 3000 });
    } else {
      await props.creator(data);
      toast.add({ severity: 'success', summary: 'Succès', detail: 'Créé avec succès', life: 3000 });
    }
    showDialog.value = false;
    loadItems(); // Recharger la liste
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue', life: 3000 });
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async () => {
  if (!itemToDelete.value) return;
  
  try {
    await props.deleter(itemToDelete.value.id);
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Supprimé avec succès', life: 3000 });
    loadItems();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer', life: 3000 });
  } finally {
    showDeleteDialog.value = false;
    itemToDelete.value = null;
  }
};
</script>
