<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <label class="font-semibold text-gray-700">
        {{ label }}
      </label>
      <button
        type="button"
        @click="openPopup"
        class="text-sm px-3 py-1.5 bg-[#064654] text-white rounded-lg hover:bg-[#064654]/90 transition-colors flex items-center gap-2"
      >
        <i class="pi pi-plus"></i>
        Ajouter
      </button>
    </div>

    <!-- Liste des conditionnements -->
    <div class="grid grid-cols-1 bg-bleu/50 rounded-lg border-2 border-dashed p-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="bg-white border rounded-xl p-4 relative group hover:shadow-md transition-shadow"
      >
        <button
          type="button"
          @click="removeItem(index)"
          class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>

        <div class="font-bold text-lg text-[#064654] mb-1">{{ item.nom }}</div>
        
        <div class="text-sm text-gray-600 space-y-1">
          <div class="flex justify-between">
            <span>Quantité Base:</span>
            <span class="font-medium">{{ item.quantite_base }}</span>
          </div>
          <div class="flex justify-between">
            <span>Prix Vente:</span>
            <span class="font-medium font-mono bg-green-50 text-green-700 px-1 rounded">{{ item.prix_vente }}</span>
          </div>
          <div v-if="item.code_barre" class="flex justify-between">
            <span>Code Barre:</span>
            <span class="font-mono text-xs bg-gray-100 px-1 rounded">{{ item.code_barre }}</span>
          </div>
        </div>
      </div>

      <!-- Placeholder Empty State -->
      <div
        v-if="items.length === 0"
        class="col-span-full  border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-white"
      >
        <i class="pi pi-box text-3xl mb-2"></i>
        <p class="text-sm">Aucun conditionnement ajouté</p>
        <button
          type="button"
          @click="openPopup"
          class="mt-2 text-primary font-medium hover:underline text-sm"
        >
          Ajouter un nouveau
        </button>
      </div>
    </div>

    <!-- Popup Form -->
    <FormPopupDynamique
      v-model:visible="showPopup"
      title="Nouveau Conditionnement"
      description="Ajouter un format de vente (ex: Pack de 6, Carton...)"
      headerTitle="Ajouter Conditionnement"
      :fields="popupFields"
      submit-label="Ajouter"
      @submit="handlePopupSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';

interface ConditionnementItem {
  nom: string;
  quantite_base: number;
  prix_vente: number;
  code_barre?: string;
  action?: 'create' | 'update' | 'delete';
}

interface Props {
  modelValue?: ConditionnementItem[];
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: 'Conditionnements'
});

const emit = defineEmits<{
  'update:modelValue': [value: ConditionnementItem[]];
}>();

const showPopup = ref(false);
const items = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const openPopup = () => {
  showPopup.value = true;
};

const popupFields = [
  {
    name: 'nom',
    label: 'Nom',
    type: 'text' as const,
    placeholder: 'Ex: Pack de 6, Carton',
    required: true
  },
  {
    name: 'quantite_base',
    label: 'Quantité Base',
    type: 'number' as const,
    placeholder: 'Ex: 6, 24...',
    required: true,
    min: 1
  },
  {
    name: 'prix_vente',
    label: 'Prix de Vente',
    type: 'number' as const,
    placeholder: '0.00',
    required: true
  },
  {
    name: 'code_barre',
    label: 'Code Barre',
    type: 'text' as const,
    placeholder: 'Scanner ou saisir...',
    required: false
  }
];

const handlePopupSubmit = (data: any) => {
  const newItem: ConditionnementItem = {
    nom: data.nom,
    quantite_base: Number(data.quantite_base),
    prix_vente: Number(data.prix_vente),
    code_barre: data.code_barre,
    action: 'create' // Marquer comme créé
  };

  const newItems = [...items.value, newItem];
  emit('update:modelValue', newItems);
  showPopup.value = false;
};

const removeItem = (index: number) => {
  const newItems = [...items.value];
  newItems.splice(index, 1);
  emit('update:modelValue', newItems);
};
</script>
