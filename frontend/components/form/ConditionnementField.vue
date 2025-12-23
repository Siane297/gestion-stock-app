<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <label class="font-semibold text-gray-700">
        {{ label }}
      </label>
      <button
        type="button"
        @click="openPopup()"
        class="text-sm px-3 py-1.5 bg-[#064654] text-white rounded-lg hover:bg-[#064654]/90 transition-colors flex items-center gap-2"
      >
        <i class="pi pi-plus"></i>
        Ajouter
      </button>
    </div>

    <!-- Liste des conditionnements -->
    <div class="grid grid-cols-1 bg-bleu/50 rounded-lg border-2 border-dashed p-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(item, index) in displayItems"
        :key="index"
        @click="openPopup(item)"
        class="bg-white border rounded-xl p-4 relative group hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
      >
        <button
          type="button"
          @click.stop="removeItem(item)"
          class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <i class="pi pi-times"></i>
        </button>

        <div class="font-bold text-lg text-[#064654] mb-1">{{ item.nom }}</div>
        
        <div class="text-sm text-gray-600 space-y-1">
          <div class="flex justify-between">
            <span>Quantité Base:</span>
            <span class="font-medium">{{ item.quantite_base }}</span>
          </div>
          <div v-if="item.prix_achat" class="flex justify-between">
            <span>Prix Achat:</span>
            <span class="font-medium font-mono bg-blue-50 text-blue-700 px-1 rounded">{{ formatPrice(item.prix_achat) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Prix Vente:</span>
            <span class="font-medium font-mono bg-green-50 text-green-700 px-1 rounded">{{ formatPrice(item.prix_vente) }}</span>
          </div>
          <div v-if="item.code_barre" class="flex justify-between">
            <span>Code Barre:</span>
            <span class="font-mono text-xs bg-gray-100 px-1 rounded">{{ item.code_barre }}</span>
          </div>
          <div v-if="item.image_url" class="mt-2">
            <img :src="getFullImageUrl(item.image_url)" class="w-full h-20 object-contain rounded border border-gray-100" />
          </div>
        </div>
      </div>

      <!-- Placeholder Empty State -->
      <div
        v-if="displayItems.length === 0"
        class="col-span-full  border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-white"
      >
        <i class="pi pi-box text-3xl mb-2"></i>
        <p class="text-sm">Aucun conditionnement ajouté</p>
        <button
          type="button"
          @click="openPopup()"
          class="mt-2 text-primary font-medium hover:underline text-sm"
        >
          Ajouter un nouveau
        </button>
      </div>
    </div>

    <!-- Popup Form -->
    <FormPopupDynamique
      v-model:visible="showPopup"
      :title="editingIndex !== null ? 'Modifier Conditionnement' : 'Nouveau Conditionnement'"
      :description="editingIndex !== null ? 'Modifier les détails du conditionnement' : 'Ajouter un format de vente (ex: Pack de 6, Carton...)'"
      :headerTitle="editingIndex !== null ? 'Modifier' : 'Ajouter'"
      :fields="popupFields"
      :submit-label="editingIndex !== null ? 'Mettre à jour' : 'Ajouter'"
      @submit="handlePopupSubmit"
      @cancel="resetPopup"
      
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import FormPopupDynamique from '~/components/form/FormPopupDynamique.vue';
import { useCurrency } from '~/composables/useCurrency';

export interface ConditionnementItem {
  id?: string;
  nom: string;
  quantite_base: number;
  prix_vente: number;
  prix_achat?: number;  // Prix d'achat du conditionnement
  code_barre?: string;
  image_url?: string;
  image_file?: File;
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

const { formatPrice } = useCurrency();

const showPopup = ref(false);
const editingIndex = ref<number | null>(null);

const items = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Champs de base
const baseFields = [
  {
    name: 'nom',
    label: 'Nom',
    type: 'text' as const,
    placeholder: 'Ex: Pack de 6, Carton',
    required: true,
    value: ''
  },
  {
    name: 'quantite_base',
    label: 'Quantité Base',
    type: 'number' as const,
    placeholder: 'Ex: 6, 24...',
    required: true,
    min: 1,
    value: ''
  },
  {
    name: 'prix_achat',
    label: "Prix d'Achat",
    type: 'currency' as const,
    placeholder: '0.00',
    required: false,
    value: '',
    helpText: "Prix d'achat unitaire pour ce conditionnement (optionnel)"
  },
  {
    name: 'prix_vente',
    label: 'Prix de Vente',
    type: 'currency' as const,
    placeholder: '0.00',
    required: true,
    value: ''
  },
  {
    name: 'code_barre',
    label: 'Code Barre',
    type: 'text' as const,
    placeholder: 'Scanner ou saisir...',
    required: false,
    value: ''
  },
  {
    name: 'image_url',
    label: 'Image',
    type: 'image' as const, // We will use Image type for the popup
    required: false,
    value: ''
  }
];

const displayItems = computed(() => {
    // Masquer l'unité de base (quantite_base = 1) car gérée dans le produit principal
    if (!Array.isArray(items.value)) return [];
    return items.value.filter(item => item.quantite_base !== 1);
});

// Champs calculés dynamiquement pour inclure les valeurs en mode édition
const popupFields = computed((): any[] => {
    if (editingIndex.value === null) {
        // Mode Ajout: Champs vides (ou valeurs par défaut)
        return baseFields.map(f => ({ ...f, value: undefined }));
    } else {
        // Mode Édition: Pré-remplir avec les valeurs de l'item sélectionné
        const item = items.value[editingIndex.value];
        if (!item) return baseFields; // Sécurité

        return baseFields.map(field => {
            // Safety access
            const val = item[field.name as keyof ConditionnementItem];
            let newVal = (field.name === 'quantite_base' || field.name === 'prix_vente')
                ? Number(val) 
                : val;
            
            // Convert relative URL to full URL for preview
            if (field.name === 'image_url' && typeof val === 'string') {
                newVal = getFullImageUrl(val);
            }

            return {
                ...field,
                value: newVal
            };
        });
    }
});

const openPopup = (item: ConditionnementItem | null = null) => {
  if (item) {
      // Trouver l'index réel dans la liste complète
      const realIndex = items.value.indexOf(item);
      editingIndex.value = realIndex;
  } else {
      // Nouvel item
      editingIndex.value = null;
  }
  showPopup.value = true;
};

const resetPopup = () => {
    editingIndex.value = null;
    showPopup.value = false;
};

const handlePopupSubmit = (data: any) => {
    // Sécurité: Récupérer l'item existant
    const currentItem = (editingIndex.value !== null && items.value && items.value[editingIndex.value])
        ? items.value[editingIndex.value]
        : undefined;

  const newItem: ConditionnementItem = {
    id: currentItem?.id,
    nom: data.nom,
    quantite_base: Number(data.quantite_base),
    prix_achat: data.prix_achat ? Number(data.prix_achat) : undefined,
    prix_vente: Number(data.prix_vente),
    code_barre: data.code_barre,
    image_url: data.image_url,
    image_file: data.$files && data.$files['image_url'] ? data.$files['image_url'] : undefined,
    action: currentItem?.id ? 'update' : 'create'
  };

  const newItems = [...items.value];
  
  if (editingIndex.value !== null && editingIndex.value < newItems.length) {
      // Mise à jour
      newItems[editingIndex.value] = newItem;
  } else {
      // Création
      newItems.push(newItem);
  }

  emit('update:modelValue', newItems);
  resetPopup();
};

const removeItem = (item: ConditionnementItem) => {
  const realIndex = items.value.indexOf(item);
  if (realIndex !== -1) {
      const newItems = [...items.value];
      newItems.splice(realIndex, 1);
      emit('update:modelValue', newItems);
  }
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBase as string;
let serverUrl = '';
try {
    if (apiBase.startsWith('http')) {
        serverUrl = new URL(apiBase).origin;
    }
} catch (e) {
    console.error("Erreur parsing API Base URL", e);
}

const getFullImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    return `${serverUrl}${path}`;
};
</script>
