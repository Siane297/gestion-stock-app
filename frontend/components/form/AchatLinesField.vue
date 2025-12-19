<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <label class="font-semibold text-gray-700">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <button
        type="button"
        @click="openPopup()"
        class="text-sm px-3 py-1.5 bg-[#064654] text-white rounded-lg hover:bg-[#064654]/90 transition-colors flex items-center gap-2"
      >
        <i class="pi pi-plus"></i>
        Ajouter un produit
      </button>
    </div>

    <!-- Liste des lignes d'achat -->
    <div
      class="grid grid-cols-1 bg-bleu/50 rounded-lg border-2 border-dashed p-4 gap-4"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        @click="openPopup(index)"
        class="bg-white border rounded-xl p-4 relative group hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
      >
        <button
          type="button"
          @click.stop="removeItem(index)"
          class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <i class="pi pi-times"></i>
        </button>

        <div class="flex justify-between items-start mb-2">
          <div>
            <div class="font-bold text-lg text-[#064654]">
              {{ getProductName(item.produit_id) }}
            </div>
            <div
              v-if="item.quantite_conditionnement"
              class="text-sm font-medium text-orange-600 bg-orange-50 px-4 py-1 rounded-full flex items-center gap-2 mt-1"
            >
              📦 {{ item.quantite_conditionnement }} colis ({{
                item.quantite
              }}
              unités)
              <div
                v-if="item.quantite_recue !== undefined"
                class="text-xs font-bold"
                :class="
                  item.quantite_recue >= item.quantite
                    ? 'text-green-600'
                    : 'text-orange-600'
                "
              >
                Reçu :
                {{
                  item.conditionnement_id
                    ? item.quantite_recue /
                      (item.quantite / item.quantite_conditionnement)
                    : item.quantite_recue
                }}
                / {{ item.quantite_conditionnement }} colis
              </div>
            </div>
            <div
              v-else
              class="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-1 rounded-full inline-block mt-1"
            >
              🔢 {{ item.quantite }} unités
              <div
                v-if="item.quantite_recue !== undefined"
                class="text-xs font-bold mt-1"
                :class="
                  item.quantite_recue >= item.quantite
                    ? 'text-green-600'
                    : 'text-orange-600'
                "
              >
                Reçu : {{ item.quantite_recue }} / {{ item.quantite }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-lg text-[#064654]">
              {{ formatPrice(item.prix_total) }}
            </div>
            <div class="text-xs text-gray-400">Total ligne</div>
          </div>
        </div>

        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 border-t pt-3 mt-1"
        >
          <div>
            <span class="block text-xs text-gray-400">Prix Unitaire</span>
            <span class="font-medium font-mono">{{
              formatPrice(item.prix_unitaire)
            }}</span>
          </div>
          <div
            v-if="item.conditionnement_id && item.conditionnement_id !== 'UNIT'"
          >
            <span class="block text-xs text-gray-400">Prix Colis</span>
            <span class="font-medium font-mono text-orange-600">{{
              formatPrice(getPrixConditionnement(item))
            }}</span>
          </div>
          <div v-if="item.numero_lot">
            <span class="block text-xs text-gray-400">Lot</span>
            <span
              class="font-medium font-mono bg-yellow-50 text-yellow-700 px-1 rounded"
              >{{ item.numero_lot }}</span
            >
          </div>
          <div v-if="item.date_peremption">
            <span class="block text-xs text-gray-400">Expiration</span>
            <span class="font-medium text-red-600">{{
              formatDate(item.date_peremption)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Placeholder Empty State -->
      <div
        v-if="items.length === 0"
        class="col-span-full border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-white"
      >
        <i class="pi pi-shopping-cart text-3xl mb-2"></i>
        <p class="text-sm">Aucun produit ajouté à la commande</p>
        <button
          type="button"
          @click="openPopup()"
          class="mt-2 text-primary font-medium hover:underline text-sm"
        >
          Ajouter un produit
        </button>
      </div>
    </div>

    <!-- Custom Dialog Form -->
    <Dialog v-model:visible="showPopup" modal
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" @hide="resetPopup"
      :showHeader="false" class="p-0 overflow-hidden">
      <SimplePageHeader 
        :title="editingIndex !== null ? 'Modifier la ligne' : 'Ajouter un produit'"
        :description="editingIndex !== null ? 'Ajustez les détails du produit sélectionné.' : 'Sélectionnez un produit et définissez ses quantités.'"
        class="!rounded-none"
      />
      <div class="flex flex-col gap-4 p-6">
        <!-- 1. Sélection Produit -->
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-gray-700"
            >Produit <span class="text-red-500">*</span></label
          >
          <Select
            v-model="form.produit_id"
            :options="produits"
            optionLabel="nom"
            optionValue="id"
            placeholder="Sélectionner un produit"
            filter
            class="w-full"
            @change="onProductChange"
            :disabled="editingIndex !== null"
          />
          <!-- On empêche de changer le produit en modification pour simplifier -->
        </div>

        <!-- 2. Conditionnement (Si dispo) -->
        <div
          v-if="conditionnementOptions.length > 0"
          class="flex flex-col gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100"
        >
          <label class="font-semibold text-orange-800 flex items-center gap-2">
            <i class="pi pi-box"></i> Conditionnement d'achat
          </label>
          <!-- <p class="text-xs text-orange-600 mb-1">Acheter par colis plutôt que par unité.</p> -->
          <Select
            v-model="form.conditionnement_id"
            :options="conditionnementOptions"
            optionLabel="label"
            optionValue="id"
            placeholder="Choisir un conditionnement (Optionnel)"
            class="w-full"
            showClear
            @change="onConditionnementChange"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 3. Quantité -->
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">
              {{
                form.conditionnement_id
                  ? "Nombre de Colis"
                  : "Quantité (Unités)"
              }}
              <span class="text-red-500">*</span>
            </label>
            <InputNumber
              v-model="form.quantite_saisie"
              :min="1"
              showButtons
              buttonLayout="horizontal"
              :step="1"
              :useGrouping="false"
              inputClass="text-center"
              class="w-full"
              @input="(e) => (form.quantite_saisie = Number(e.value) || 0)"
            >
              <template #incrementbuttonicon>
                <span class="pi pi-plus" />
              </template>
              <template #decrementbuttonicon>
                <span class="pi pi-minus" />
              </template>
            </InputNumber>
            <small
              v-if="form.conditionnement_id && selectedConditionnement"
              class="text-gray-500"
            >
              Soit
              <strong>{{
                (form.quantite_saisie || 0) *
                selectedConditionnement.quantite_base
              }}</strong>
              unités en stock.
            </small>
          </div>

          <!-- 4. Prix -->
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">
              {{
                form.conditionnement_id ? "Prix par Colis" : "Prix Unitaire"
              }}
              <span class="text-red-500">*</span>
            </label>
            <InputGroup>
              <InputGroupAddon
                v-if="currentCurrency?.symbolPosition === 'before'"
                class="font-bold text-gray-600 bg-gray-50 border-r-0"
              >
                {{ currentCurrency?.symbol }}
              </InputGroupAddon>

              <InputNumber
                v-model="form.prix_saisie"
                :min="0"
                :useGrouping="false"
                :maxFractionDigits="currencyDecimals"
                class="w-full"
                @input="(e) => (form.prix_saisie = Number(e.value) || 0)"
              />

              <InputGroupAddon
                v-if="currentCurrency?.symbolPosition !== 'before'"
                class="font-bold text-gray-600 bg-gray-50 border-l-0"
              >
                {{ currentCurrency?.symbol }}
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <!-- 4.5 Quantité Reçue (Si modification) -->
        <div
          v-if="editingIndex !== null"
          class="p-3 bg-green-50 rounded-lg border border-green-200"
        >
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-green-800">
              Quantité Reçue ({{
                form.conditionnement_id ? "Colis" : "Unités"
              }})
            </label>
            <div class="flex items-center gap-3">
              <InputNumber
                v-model="form.quantite_recue_saisie"
                :min="0"
                :max="form.quantite_saisie"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                inputClass="text-center font-bold text-green-700"
                class="w-full"
              >
                <template #incrementbuttonicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
              <span class="text-sm text-green-600 whitespace-nowrap">
                / {{ form.quantite_saisie }}
                {{ form.conditionnement_id ? "Colis" : "Unités" }}
              </span>
            </div>
            <small class="text-green-600"
              >Saisissez ce qui a été effectivement livré.</small
            >
          </div>
        </div>

        <!-- 5. Total Readonly -->
        <div
          class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border"
        >
          <span class="font-semibold text-gray-600">Total Ligne :</span>
          <span class="text-xl font-bold text-[#064654]">{{
            formatPrice(formTotal)
          }}</span>
        </div>

        <!-- 6. Détails Lot (Optionnel) -->
        <div class="border-t pt-4 mt-2">
          <button
            type="button"
            @click="showLotDetails = !showLotDetails"
            class="text-sm font-medium text-primary flex items-center gap-2 mb-2"
          >
            <i
              :class="
                showLotDetails ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
              "
            ></i>
            Informations de lot (Optionnel)
          </button>

          <div
            v-if="showLotDetails"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn"
          >
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700"
                >Numéro de Lot</label
              >
              <InputText
                v-model="form.numero_lot"
                placeholder="Ex: BATCH-001"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-700"
                >Date d'expiration</label
              >
              <DatePicker
                v-model="form.date_peremption"
                dateFormat="dd/mm/yy"
                showIcon
                fluid
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <AppButton
            label="Annuler"
            icon="pi pi-times"
            variant="outline"
            @click="showPopup = false"
          />
          <AppButton
            :label="editingIndex !== null ? 'Mettre à jour' : 'Ajouter'"
            icon="pi pi-check"
            variant="primary"
            @click="submitDirect"
            :disabled="!isValid"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import SimplePageHeader from "~/components/banner/SimplePageHeader.vue";
import { useProduitApi } from "~/composables/api/useProduitApi";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { useCurrency } from "~/composables/useCurrency";
import AppButton from "~/components/button/AppButton.vue";

interface AchatLineItem {
  produit_id: string;
  conditionnement_id?: string;
  quantite: number; // Unités commandées
  quantite_recue?: number; // Unités reçues
  quantite_conditionnement?: number; // Colis commandés
  prix_unitaire: number; // PU
  prix_unitaire_conditionnement?: number; // Prix Colis
  prix_total: number;
  numero_lot?: string;
  date_peremption?: Date | string;
}

interface Props {
  modelValue?: AchatLineItem[];
  label?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: "Produits",
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: AchatLineItem[]];
}>();

const { getProduits } = useProduitApi();
const { formatPrice, currentCurrency } = useCurrency();
const produits = ref<any[]>([]);
const showPopup = ref(false);
const showLotDetails = ref(false);
const editingIndex = ref<number | null>(null);

// Form State
const form = reactive({
  produit_id: "",
  conditionnement_id: "",
  quantite_saisie: 1, // Peut être unités ou colis selon contexte
  quantite_recue_saisie: 0, // Nouveau champ saisi
  prix_saisie: 0, // Peut être PU ou PrixColis selon contexte
  numero_lot: "",
  date_peremption: undefined as Date | undefined,
});

const formTotal = computed(() => {
  const qty = Number(form.quantite_saisie || 0);
  const price = Number(form.prix_saisie || 0);
  return qty * price;
});

const currencyCode = computed(() => currentCurrency.value?.code || "KMF");
const currencySuffix = computed(
  () => ` ${currentCurrency.value?.symbol || "KMF"}`
);
const currencyDecimals = computed(
  () => currentCurrency.value?.decimalPlaces ?? 0
);

const items = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
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
  const p = produits.value.find((x) => x.id === id);
  return p ? p.nom : "Produit inconnu";
};

const formatDate = (d: string | Date | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
};

const getPrixConditionnement = (item: AchatLineItem) => {
  if (item.prix_unitaire_conditionnement)
    return item.prix_unitaire_conditionnement;

  // Calculer à la volée
  if (item.conditionnement_id) {
    const prod = produits.value.find((p) => p.id === item.produit_id);
    const pack = prod?.conditionnements?.find(
      (c: any) => c.id === item.conditionnement_id
    );
    if (pack) {
      return item.prix_unitaire * pack.quantite_base;
    }
  }
  return 0;
};

const getQuantiteColis = (item: AchatLineItem) => {
  if (item.quantite_conditionnement) return item.quantite_conditionnement;
  // Tenter de calculer si on a le conditionnement et la quantité
  if (
    item.conditionnement_id &&
    item.conditionnement_id !== "UNIT" &&
    item.quantite
  ) {
    const prod = produits.value.find((p) => p.id === item.produit_id);
    const pack = prod?.conditionnements?.find(
      (c: any) => c.id === item.conditionnement_id
    );
    if (pack && pack.quantite_base > 0) {
      return item.quantite / pack.quantite_base;
    }
  }
  return 0;
};

// calculateTotal removed, replaced by formTotal computed

const openPopup = (index: number | null = null) => {
  editingIndex.value = index;

  if (index !== null) {
    // Edit mode: populate form
    const item = items.value[index];
    if (item) {
      form.produit_id = item.produit_id;

      // On vérifie d'abord si un conditionnement spécifique est sauvegardé
      if (item.conditionnement_id && item.conditionnement_id !== "UNIT") {
        form.conditionnement_id = item.conditionnement_id;

        // Priorité à la quantité conditionnement explicite, sinon calcul
        if (item.quantite_conditionnement) {
          form.quantite_saisie = item.quantite_conditionnement;
        } else {
          form.quantite_saisie = getQuantiteColis(item) || item.quantite || 0; // Fallback safe
        }

        // Calcul prix colis ou récupération
        form.prix_saisie = getPrixConditionnement(item) || 0;

        // Conversion reçue (Unités -> Colis)
        // On doit retrouver combien de colis ont été reçus
        if (item.quantite_recue && selectedConditionnement.value) {
          // Math.round pour éviter les erreurs de virgule flottante
          form.quantite_recue_saisie =
            Math.round(
              (item.quantite_recue /
                selectedConditionnement.value.quantite_base) *
                100
            ) / 100;
        } else if (
          item.quantite_recue &&
          item.quantite_conditionnement &&
          item.quantite
        ) {
          // Fallback si selectedConditionnement n'est pas encore calculé (rare car computed)
          // On utilise le ratio Qty / QtyColis
          const ratio = item.quantite / item.quantite_conditionnement;
          form.quantite_recue_saisie =
            Math.round((item.quantite_recue / ratio) * 100) / 100;
        } else {
          form.quantite_recue_saisie = 0;
        }
      } else {
        // Mode unit
        form.conditionnement_id = "";
        form.quantite_saisie = item.quantite;
        form.prix_saisie = item.prix_unitaire;
        form.quantite_recue_saisie = item.quantite_recue || 0;
      }

      form.numero_lot = item.numero_lot || "";
      form.date_peremption = item.date_peremption
        ? new Date(item.date_peremption)
        : undefined;

      if (item.numero_lot || item.date_peremption) {
        showLotDetails.value = true;
      } else {
        showLotDetails.value = false;
      }
    }
  } else {
    // Reset form for new
    form.produit_id = "";
    form.conditionnement_id = "";
    form.quantite_saisie = 1;
    form.prix_saisie = 0;
    form.numero_lot = "";
    form.date_peremption = undefined;
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
  return produits.value.find((p) => p.id === form.produit_id);
});

const conditionnementOptions = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.conditionnements)
    return [];
  return selectedProduct.value.conditionnements.map((c: any) => ({
    label: `${c.nom} (x${c.quantite_base})`,
    id: c.id,
    ...c,
  }));
});

const selectedConditionnement = computed(() => {
  if (!form.conditionnement_id) return null;
  return conditionnementOptions.value.find(
    (c: any) => c.id === form.conditionnement_id
  );
});

const onProductChange = () => {
  form.conditionnement_id = ""; // Reset packaging
  form.prix_saisie = 0;
};

const onConditionnementChange = () => {
  // No explicit total calculation needed anymore (computed)
};

const isValid = computed(() => {
  return form.produit_id && form.quantite_saisie > 0 && form.prix_saisie >= 0;
});

const submitDirect = () => {
  if (!isValid.value) return;

  let quantiteFinale = form.quantite_saisie;
  let prixUnitaireFinale = form.prix_saisie;
  let quantiteColis: number | undefined = undefined;
  let prixColis: number | undefined = undefined;
  let quantiteRecueFinale = 0; // Added declaration

  if (form.conditionnement_id && selectedConditionnement.value) {
    // Mode Colis
    quantiteColis = form.quantite_saisie;
    prixColis = form.prix_saisie;

    // Conversion pour le stockage interne (Unités)
    quantiteFinale =
      quantiteColis * selectedConditionnement.value.quantite_base;
    prixUnitaireFinale =
      prixColis / selectedConditionnement.value.quantite_base;

    // Conversion reçue (Unités)
    quantiteRecueFinale =
      (form.quantite_recue_saisie || 0) *
      selectedConditionnement.value.quantite_base;
  } else {
    // Mode Unité
    quantiteRecueFinale = form.quantite_recue_saisie || 0;
  }

  const newItem: AchatLineItem = {
    produit_id: form.produit_id,
    conditionnement_id: form.conditionnement_id || undefined,
    quantite: quantiteFinale, // Unités
    quantite_recue: quantiteRecueFinale, // Unités
    quantite_conditionnement: quantiteColis, // Colis
    prix_unitaire: prixUnitaireFinale, // PU
    prix_unitaire_conditionnement: prixColis, // Prix Colis
    prix_total: formTotal.value,
    numero_lot: form.numero_lot,
    date_peremption: form.date_peremption,
  };

  const newItems = [...items.value];

  if (editingIndex.value !== null && editingIndex.value < newItems.length) {
    // Update
    newItems[editingIndex.value] = newItem;
  } else {
    // Add
    newItems.push(newItem);
  }

  emit("update:modelValue", newItems);
  showPopup.value = false;
  editingIndex.value = null; // Important reset
};

const removeItem = (index: number) => {
  const newItems = [...items.value];
  newItems.splice(index, 1);
  emit("update:modelValue", newItems);
};
</script>
