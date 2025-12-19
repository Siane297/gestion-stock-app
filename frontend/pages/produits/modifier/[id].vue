<template>
  <div>
    <!-- <SimplePageHeader
      title="Modifier le Produit"
      description="Mettre à jour les informations du produit"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <div v-if="loadingInitial" class="flex justify-center p-8">
            <span class="text-gray-500">Chargement du produit...</span>
        </div>

      <!-- Formulaire dynamique -->
      <FormulaireDynamique
        v-else
        title="Détails du Produit"
        description="Modifiez les informations ci-dessous."
        :fields="productFields"
        submit-label="Enregistrer les modifications"
        cancel-label="Annuler"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @addClick="handleAddClick"
        ref="formRef"
      />
    </div>

    <!-- Popup pour ajouter une catégorie -->
    <FormPopupDynamique
      v-model:visible="showCategoryDialog"
      title="Ajouter une catégorie"
      description="Créez une nouvelle catégorie de produits"
      headerTitle="Nouvelle catégorie"
      :fields="categoryFields"
      submit-label="Créer"
      :loading="loadingCategory"
      @submit="handleCreateCategory"
      @cancel="showCategoryDialog = false"
    />

    <!-- Popup pour ajouter une unité -->
    <FormPopupDynamique
      v-model:visible="showUniteDialog"
      title="Ajouter une unité"
      description="Créez une nouvelle unité de mesure"
      headerTitle="Nouvelle unité"
      :fields="uniteFields"
      submit-label="Créer"
      :loading="loadingUnite"
      @submit="handleCreateUnite"
      @cancel="showUniteDialog = false"
    />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from "~/components/form/FormulaireDynamique.vue";
import FormPopupDynamique from "~/components/form/FormPopupDynamique.vue";
import { useProduitApi, type UpdateProduitDto, type Produit } from "~/composables/api/useProduitApi";
import { useUniteApi } from "~/composables/api/useUniteApi";
import { useCategorieProduitApi } from "~/composables/api/useCategorieProduitApi";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { getProduitById, updateProduit } = useProduitApi();
const { getCategories, createCategory } = useCategorieProduitApi();
const { getUnites, createUnite } = useUniteApi();
const { extractErrorMessage } = useErrorHandler();

const produitId = route.params.id as string;
const produit = ref<Produit | null>(null);

// Référence du formulaire
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);

// État
const loading = ref(false);
const loadingInitial = ref(true);

// Listes
const categories = ref<Array<{ id: string; nom: string }>>([]);
const unites = ref<Array<{ id: string; nom: string }>>([]);
const loadingLists = ref(false);

// États du popup catégorie et unité
const showCategoryDialog = ref(false);
const loadingCategory = ref(false);
const showUniteDialog = ref(false);
const loadingUnite = ref(false);

// Page Title Override
const pageTitleOverride = useState<string | null>('pageTitleOverride');

// Charger les données initiales
const loadData = async () => {
  loadingInitial.value = true;
  try {
    // 1. Charger listes
    const [catsData, unitesData] = await Promise.all([
        getCategories(),
        getUnites()
    ]);
    categories.value = catsData;
    unites.value = unitesData;

    // 2. Charger produit
    const data = await getProduitById(produitId);
    if (!data) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Produit introuvable', life: 3000 });
        setTimeout(() => router.push('/produits'), 1500);
        return;
    }
    produit.value = data;
    pageTitleOverride.value = `Modifier ${data.nom}`;

  } catch (error) {
    console.error("Erreur chargement:", error);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données', life: 3000 });
  } finally {
    loadingInitial.value = false;
  }
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
    pageTitleOverride.value = null;
});

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
    if (path.startsWith('http')) return path;
    return `${serverUrl}${path}`;
};

// Définition des champs
const productFields = computed(() => {
    if (!produit.value) return [];

    // Extract base values from default conditionnement (Unit)
    const baseConditionnement = produit.value.conditionnements?.find((c: any) => c.quantite_base === 1);
    const prixVente = baseConditionnement ? baseConditionnement.prix_vente : 0;
    const codeBarre = baseConditionnement ? baseConditionnement.code_barre : '';

    return [
   {
    name: "image",
    label: "Image du produit",
    type: "image" as const,
    required: false,
    value: getFullImageUrl(produit.value.image_url), // use snake_case property from backend
    placeholder: "Ajouter/Modifier image",
    acceptedFormats: "image/png,image/jpeg,image/jpg,image/webp",
    maxSize: 5
  },
  {
    name: "nom",
    label: "Nom du produit",
    type: "text" as const,
    placeholder: "Ex: Smartphone X",
    required: true,
    value: produit.value.nom
  },
  {
    name: "code_barre",
    label: "Code barre",
    type: "text" as const,
    placeholder: "Scanner ou saisir le code",
    required: false,
    value: codeBarre
  },
 
  {
    name: "unite_id",
    label: "Unité de base",
    type: "select-with-add" as const,
    placeholder: "Sélectionnez l'unité",
    required: true,
    value: produit.value.unite_id,
    options: unites.value,
    optionLabel: "nom",
    optionValue: "id",
  },
  {
    name: "categorie_id",
    label: "Catégorie",
    type: "select-with-add" as const,
    placeholder: "Sélectionnez une catégorie",
    required: false, 
    value: produit.value.categorie_id,
    options: categories.value,
    optionLabel: "nom",
    optionValue: "id",
  },
  {
    name: "prix_vente",
    label: "Prix de vente",
    type: "number" as const,
    placeholder: "0.00",
    required: true,
    value: prixVente
  },
  {
    name: "gere_peremption",
    label: "Gère la péremption",
    type: "checkbox" as const,
    required: false,
    value: produit.value.gere_peremption, 
    helpText: "Activer le suivi des lots et dates de péremption."
  },
  {
    name: "conditionnements",
    label: "Conditionnements",
    type: "conditionnement" as const,
    required: false,
    value: produit.value.conditionnements 
  },
  {
    name: 'est_actif',
    label: 'Produit Actif',
    type: 'checkbox' as const,
    required: false,
    value: produit.value.est_actif,
    helpText: 'Décochez pour archiver ce produit.'
  }
]});

// Gestion de la soumission
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // 1. Adaptation des conditionnements pour coller au DTO
    let condsPayload: any[] = [];
    
    // a. Map current items (Create or Update)
    if (data.conditionnements) {
        condsPayload = data.conditionnements.map((c: any) => ({
            id: c.id, 
            nom: c.nom,
            quantite_base: Number(c.quantite_base),
            prix_vente: Number(c.prix_vente),
            code_barre: c.code_barre,
            image_url: c.image_url,
            image_id: c.image_id,
            action: c.id ? 'update' : 'create' 
        }));
    }

    // b. Detect deleted items
    if (produit.value && produit.value.conditionnements) {
        const originalIds = produit.value.conditionnements.map((c: any) => c.id);
        const currentIds = data.conditionnements 
            ? data.conditionnements.map((c: any) => c.id).filter((id: any) => id)
            : [];
        
        const deletedIds = originalIds.filter(id => !currentIds.includes(id));
        
        deletedIds.forEach(id => {
            condsPayload.push({
                id: id,
                action: 'delete'
            });
        });
    }

    // 2. Prepare Payload
    const payload: UpdateProduitDto = {
      nom: data.nom,
      code_barre: data.code_barre || undefined,
      categorie_id: data.categorie_id || undefined, // undefined sends null if explicit in DTO? backend model relies on optional.
      // DTO defines optional string. sending undefined excludes field from update? 
      // Prisma update with undefined does nothing. We might want to send null to clear it.
      // Backend controller just passes body.
      // Let's keep logic simple for now.
      unite_id: data.unite_id,
      prix_achat: data.prix_achat ? Number(data.prix_achat) : undefined,
      prix_vente: Number(data.prix_vente),
      est_actif: data.est_actif,
      conditionnements: condsPayload.length > 0 ? condsPayload : undefined
    };



    let payloadToSend: any = payload;
    const files = data.$files as Record<string, File> | undefined;
    const imageFile = files?.['image'];

    // Check for conditionnement files
    const conditionnementFiles: { file: File, index: number, key: string }[] = [];
    if (data.conditionnements) {
        data.conditionnements.forEach((c: any, index: number) => {
            if (c.image_file) {
                 const key = `cond_img_${index}`;
                 conditionnementFiles.push({
                     file: c.image_file,
                     index: index,
                     key: key
                 });
                 // Update the payload item with the key so backend knows
                 if (payload.conditionnements && payload.conditionnements[index]) {
                     (payload.conditionnements[index] as any).image_key = key;
                 }
            }
        });
    }

    if (imageFile || conditionnementFiles.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
             if (value !== undefined && value !== null) {
                 if (key === 'conditionnements') {
                     formData.append(key, JSON.stringify(value));
                 } else {
                     formData.append(key, String(value));
                 }
             }
        });
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        conditionnementFiles.forEach(cf => {
            formData.append(cf.key, cf.file);
        });

        payloadToSend = formData;
    }

    const updated = await updateProduit(produitId, payloadToSend);

    if (!updated) {
      throw new Error("Échec de la modification");
    }

    toast.add({
      severity: "success",
      summary: "Succès",
      detail: "Produit modifié avec succès !",
      life: 3000,
    });

    setTimeout(() => {
        router.push('/produits');
    }, 1500);

  } catch (error: any) {
    console.error("Erreur enregistrement:", error);
    const errorMsg = extractErrorMessage(error, "Erreur lors de la modification");
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: errorMsg,
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push("/produits");
};

const handleAddClick = (field: any) => {
  if (field.name === "categorie_id") {
    showCategoryDialog.value = true;
  } else if (field.name === "unite_id") {
    showUniteDialog.value = true;
  }
};

// ... Logique Catégorie identique ...
const handleCreateCategory = async (data: Record<string, any>) => {
  loadingCategory.value = true;
  try {
    const newCategory = await createCategory({
      nom: data.nom,
      description: data.description,
    });
    if (!newCategory) throw new Error("Échec création catégorie");
    categories.value.push(newCategory);
    toast.add({ severity: "success", summary: "Succès", detail: "Catégorie créée", life: 3000 });
    showCategoryDialog.value = false;
    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.categorie_id = newCategory.id;
    }
  } catch (error: any) {
    const errorMsg = extractErrorMessage(error, "Erreur catégorie");
    toast.add({ severity: "error", summary: "Erreur", detail: errorMsg, life: 3000 });
  } finally {
    loadingCategory.value = false;
  }
};

const categoryFields = [
  { name: "nom", label: "Nom", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const, required: false }
];

// Unite
const uniteFields = [
  { name: "nom", label: "Nom de l'unité", type: "text" as const, required: true, placeholder: "Ex: Kg, L, Pièce..." }
];

const handleCreateUnite = async (data: Record<string, any>) => {
    loadingUnite.value = true;
    try {
        const newUnite = await createUnite({ nom: data.nom });
        if (!newUnite) throw new Error("Erreur création unité");
        unites.value.push(newUnite);
        toast.add({ severity: "success", summary: "Succès", detail: "Unité créée", life: 3000 });
        showUniteDialog.value = false;
        await nextTick();
        if (formRef.value && (formRef.value as any).formData) {
            (formRef.value as any).formData.unite_id = newUnite.id;
        }
    } catch(e: any) {
        const errorMsg = extractErrorMessage(e, "Erreur unité");
        toast.add({ severity: "error", summary: "Erreur", detail: errorMsg, life: 3000 });
    } finally {
        loadingUnite.value = false;
    }
};


</script>