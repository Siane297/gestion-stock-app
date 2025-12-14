<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <label class="font-semibold text-gray-700">
        {{ label }}
      </label>
      <button type="button" @click="openPopup()"
        class="text-sm px-3 py-1.5 bg-[#064654] text-white rounded-lg hover:bg-[#064654]/90 transition-colors flex items-center gap-2">
        <i class="pi pi-plus"></i>
        Ajouter un produit
      </button>
    </div>

    <!-- Liste des lignes d'achat -->
    <div class="grid grid-cols-1 bg-bleu/50 rounded-lg border-2 border-dashed p-4 gap-4">
      <div v-for="(item, index) in items" :key="index" @click="openPopup(index)"
        class="bg-white border rounded-xl p-4 relative group hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
        <button type="button" @click.stop="removeItem(index)"
          class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10">
          <i class="pi pi-times"></i>
        </button>

        <div class="flex justify-between items-start mb-2">
          <div>
            <div class="font-bold text-lg text-[#064654]">{{ getProductName(item.produit_id) }}</div>
            <div v-if="item.quantite_conditionnement"
              class="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-1">
              📦 {{ item.quantite_conditionnement }} colis ({{ item.quantite }} unités)
            </div>
            <div v-else
              class="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
              🔢 {{ item.quantite }} unités
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-lg text-[#064654]">{{ item.prix_total.toFixed(2) }} KMF</div>
            <div class="text-xs text-gray-400">Total ligne</div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 border-t pt-3 mt-1">
          <div>
            <span class="block text-xs text-gray-400">Prix Unitaire</span>
            <span class="font-medium font-mono">{{ item.prix_unitaire.toFixed(2) }}</span>
          </div>
          <div v-if="item.prix_unitaire_conditionnement">
            <span class="block text-xs text-gray-400">Prix Colis</span>
            <span class="font-medium font-mono text-orange-600">{{ item.prix_unitaire_conditionnement.toFixed(2)
              }}</span>
          </div>
          <div v-if="item.numero_lot">
            <span class="block text-xs text-gray-400">Lot</span>
            <span class="font-medium font-mono bg-yellow-50 text-yellow-700 px-1 rounded">{{ item.numero_lot }}</span>
          </div>
          <div v-if="item.date_peremption">
            <span class="block text-xs text-gray-400">Expiration</span>
            <span class="font-medium text-red-600">{{ formatDate(item.date_peremption) }}</span>
          </div>
        </div>
      </div>

      <!-- Placeholder Empty State -->
      <div v-if="items.length === 0"
        class="col-span-full border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-white">
        <i class="pi pi-shopping-cart text-3xl mb-2"></i>
        <p class="text-sm">Aucun produit ajouté à la commande</p>
        <button type="button" @click="openPopup()" class="mt-2 text-primary font-medium hover:underline text-sm">
          Ajouter un produit
        </button>
      </div>
    </div>

    <!-- Custom Dialog Form -->
    <Dialog v-model:visible="showPopup" modal
      :header="editingIndex !== null ? 'Modifier la ligne' : 'Ajouter un produit'" :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" @hide="resetPopup">
      <div class="flex flex-col gap-4 py-4">

        <!-- 1. Sélection Produit -->
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700">Produit <span class="text-red-500">*</span></label>
          <Select v-model="form.produit_id" :options="produits" optionLabel="nom" optionValue="id"
            placeholder="Sélectionner un produit" filter class="w-full" @change="onProductChange"
            :disabled="editingIndex !== null" />
          <!-- On empêche de changer le produit en modification pour simplifier -->
        </div>

        <!-- 2. Conditionnement (Si dispo) -->
        <div v-if="conditionnementOptions.length > 0"
          class="flex flex-col gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <label class="font-semibold text-orange-800 flex items-center gap-2">
            <i class="pi pi-box"></i> Conditionnement d'achat
          </label>
          <!-- <p class="text-xs text-orange-600 mb-1">Acheter par colis plutôt que par unité.</p> -->
          <Select v-model="form.conditionnement_id" :options="conditionnementOptions" optionLabel="label"
            optionValue="id" placeholder="Choisir un conditionnement (Optionnel)" class="w-full" showClear
            @change="onConditionnementChange" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 3. Quantité -->
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">
              {{ form.conditionnement_id ? 'Nombre de Colis' : 'Quantité (Unités)' }} <span
                class="text-red-500">*</span>
            </label>
            <InputNumber v-model="form.quantite_saisie" :min="1" showButtons buttonLayout="horizontal" :step="1"
              inputClass="text-center" class="w-full" @update:modelValue="calculateTotal">
              <template #incrementbuttonicon>
                <span class="pi pi-plus" />
              </template>
              <template #decrementbuttonicon>
                <span class="pi pi-minus" />
              </template>
            </InputNumber>
            <small v-if="form.conditionnement_id && selectedConditionnement" class="text-gray-500">
              Soit <strong>{{ (form.quantite_saisie || 0) * selectedConditionnement.quantite_base }}</strong> unités en
              stock.
            </small>
          </div>

          <!-- 4. Prix -->
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">
              {{ form.conditionnement_id ? 'Prix par Colis' : 'Prix Unitaire' }} <span class="text-red-500">*</span>
            </label>
            <InputNumber v-model="form.prix_saisie" mode="currency" currency="KMF" locale="fr-FR" :min="0"
              class="w-full" @update:modelValue="calculateTotal" />
          </div>
        </div>

        <!-- 5. Total Readonly -->
        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
          <span class="font-semibold text-gray-600">Total Ligne :</span>
          <span class="text-xl font-bold text-[#064654]">{{ (form.total || 0).toLocaleString('fr-FR') }} KMF</span>
        </div>

        <!-- 6. Détails Lot (Optionnel) -->
        <div class="border-t pt-4 mt-2">
          <button type="button" @click="showLotDetails = !showLotDetails"
            class="text-sm font-medium text-primary flex items-center gap-2 mb-2">
            <i :class="showLotDetails ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            Informations de lot (Optionnel)
          </button>

          <div v-if="showLotDetails" class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">Numéro de Lot</label>
              <InputText v-model="form.numero_lot" placeholder="Ex: BATCH-001" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700">Date d'expiration</label>
              <DatePicker v-model="form.date_peremption" dateFormat="dd/mm/yy" showIcon fluid />
            </div>
          </div>
        </div>

      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Annuler" icon="pi pi-times" text @click="showPopup = false" />
          <Button :label="editingIndex !== null ? 'Mettre à jour' : 'Ajouter'" icon="pi pi-check" @click="submitDirect"
            :disabled="!isValid" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useProduitApi } from '~/composables/api/useProduitApi';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';

interface AchatLineItem {
  produit_id: string;
  conditionnement_id?: string;
  quantite: number; // Unités
  quantite_conditionnement?: number; // Colis
  prix_unitaire: number; // PU
  prix_unitaire_conditionnement?: number; // Prix Colis
  prix_total: number;
  numero_lot?: string;
  date_peremption?: Date | string;
}

interface Props {
  modelValue?: AchatLineItem[];
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: 'Produits'
});

const emit = defineEmits<{
  'update:modelValue': [value: AchatLineItem[]];
}>();

const { getProduits } = useProduitApi();
const produits = ref<any[]>([]);
const showPopup = ref(false);
const showLotDetails = ref(false);
const editingIndex = ref<number | null>(null);

// Form State
const form = reactive({
  produit_id: '',
  conditionnement_id: '',
  quantite_saisie: 1, // Peut être unités ou colis selon contexte
  prix_saisie: 0, // Peut être PU ou PrixColis selon contexte
  numero_lot: '',
  date_peremption: undefined as Date | undefined,
  total: 0
});

const items = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Load products
onMounted(async () => {
  try {
    produits.value = await getProduits();
  } catch (e) {
    console.error("Erreur chargement produits", e);
  }
});

const getProductName = (id: string) => {
  const p = produits.value.find(x => x.id === id);
  return p ? p.nom : 'Produit inconnu';
};

const formatDate = (d: string | Date | undefined) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString();
};

const openPopup = (index: number | null = null) => {
  editingIndex.value = index;

  if (index !== null) {
    // Edit mode: populate form
    const item = items.value[index];
    if (item) {
      form.produit_id = item.produit_id;
      form.conditionnement_id = item.conditionnement_id || '';

      if (item.conditionnement_id) {
        // Mode colis
        form.quantite_saisie = item.quantite_conditionnement || 0;
        form.prix_saisie = item.prix_unitaire_conditionnement || 0;
      } else {
        // Mode unitaire
        form.quantite_saisie = item.quantite;
        form.prix_saisie = item.prix_unitaire;
      }

      form.numero_lot = item.numero_lot || '';
      form.date_peremption = item.date_peremption ? new Date(item.date_peremption) : undefined;

      if (item.numero_lot || item.date_peremption) {
        showLotDetails.value = true;
      } else {
        showLotDetails.value = false;
      }
      calculateTotal(); // Recelcule total based on populated values
    }
  } else {
    // Reset form for new
    form.produit_id = '';
    form.conditionnement_id = '';
    form.quantite_saisie = 1;
    form.prix_saisie = 0;
    form.numero_lot = '';
    form.date_peremption = undefined;
    form.total = 0;
    showLotDetails.value = false;
  }

  showPopup.value = true;
};

const resetPopup = () => {
  // Called mostly by hide event or manual cancel
  editingIndex.value = null;
  // form reset is done on openPopup(null) or not strictly needed here if we always init in open.
};

// --- Logic ---

const selectedProduct = computed(() => {
  return produits.value.find(p => p.id === form.produit_id);
});

const conditionnementOptions = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.conditionnements) return [];
  return selectedProduct.value.conditionnements.map((c: any) => ({
    label: `${c.nom} (x${c.quantite_base})`,
    id: c.id,
    ...c
  }));
});

const selectedConditionnement = computed(() => {
  if (!form.conditionnement_id) return null;
  return conditionnementOptions.value.find((c: any) => c.id === form.conditionnement_id);
});

const onProductChange = () => {
  form.conditionnement_id = ''; // Reset packaging
  form.prix_saisie = 0;
};

const onConditionnementChange = () => {
  calculateTotal();
};

const calculateTotal = () => {
  const qty = Number(form.quantite_saisie || 0);
  const price = Number(form.prix_saisie || 0);
  form.total = qty * price;
};

const isValid = computed(() => {
  return form.produit_id && form.quantite_saisie > 0 && form.prix_saisie >= 0;
});

const submitDirect = () => {
  if (!isValid.value) return;

  let quantiteFinale = form.quantite_saisie;
  let prixUnitaireFinale = form.prix_saisie;
  let quantiteColis = undefined;
  let prixColis = undefined;

  if (form.conditionnement_id && selectedConditionnement.value) {
    // Mode Colis
    quantiteColis = form.quantite_saisie;
    prixColis = form.prix_saisie;

    // Conversion pour le stockage interne (Unités)
    quantiteFinale = quantiteColis * selectedConditionnement.value.quantite_base;
    prixUnitaireFinale = prixColis / selectedConditionnement.value.quantite_base;
  }

  const newItem: AchatLineItem = {
    produit_id: form.produit_id,
    conditionnement_id: form.conditionnement_id || undefined,
    quantite: quantiteFinale,             // Unités
    quantite_conditionnement: quantiteColis, // Colis
    prix_unitaire: prixUnitaireFinale,    // PU
    prix_unitaire_conditionnement: prixColis, // Prix Colis
    prix_total: form.total,
    numero_lot: form.numero_lot,
    date_peremption: form.date_peremption
  };

  const newItems = [...items.value];

  if (editingIndex.value !== null && editingIndex.value < newItems.length) {
    // Update
    newItems[editingIndex.value] = newItem;
  } else {
    // Add
    newItems.push(newItem);
  }

  emit('update:modelValue', newItems);
  showPopup.value = false;
  editingIndex.value = null; // Important reset
};

const removeItem = (index: number) => {
  const newItems = [...items.value];
  newItems.splice(index, 1);
  emit('update:modelValue', newItems);
};
</script>
