<template>
  <div>
    <div class="mt-6">
      <!-- Formulaire dynamique -->
       <ProduitFormulaire
         title="Ajouter un produit"
         description="Remplissez le formulaire pour créer un nouveau produit dans le catalogue"
         :groups="productGroups"
         submit-label="Enregistrer"
         cancel-label="Annuler"
         :loading="loading"
         @submit="handleSubmit"
         @cancel="handleCancel"
         @addClick="handleAddClick"
         @change="handleFormChange"
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
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'produits:creer'
});

import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import ProduitFormulaire from "~/components/form/ProduitFormulaire.vue";
import FormPopupDynamique from "~/components/form/FormPopupDynamique.vue";
// ... imports
import { useUniteApi } from "~/composables/api/useUniteApi";
import { useProduitApi } from "~/composables/api/useProduitApi";
import { useCategorieProduitApi } from "~/composables/api/useCategorieProduitApi";
import { useMagasinApi } from "~/composables/api/useMagasinApi";

const { createProduit } = useProduitApi();
const { getCategories, createCategory } = useCategorieProduitApi();
const { getUnites, createUnite } = useUniteApi();
const { getMagasins } = useMagasinApi();
const { extractErrorMessage } = useErrorHandler();
const toast = useToast();

const router = useRouter();

// Référence du formulaire
const formRef = ref<InstanceType<typeof ProduitFormulaire> | null>(null);

// État
const loading = ref(false);

// Listes
const categories = ref<Array<{ id: string; nom: string }>>([]);
const unites = ref<Array<{ id: string; nom: string }>>([]);
const magasins = ref<Array<{ id: string; nom: string }>>([]);
const loadingLists = ref(false);
const formState = ref<Record<string, any>>({});
 
const handleFormChange = (data: Record<string, any>) => {
  formState.value = data;
};

// États du popup catégorie et unité
const showCategoryDialog = ref(false);
const loadingCategory = ref(false);
const showUniteDialog = ref(false);
const loadingUnite = ref(false);

// Charger les listes
const loadLists = async () => {
  loadingLists.value = true;
  try {
    const [catsData, unitesData, magasinsData] = await Promise.all([
        getCategories(),
        getUnites(),
        getMagasins() // Charger la liste des magasins
    ]);
    categories.value = catsData;
    unites.value = unitesData;
    magasins.value = magasinsData;
  } catch (error) {
    console.error("Erreur chargement listes:", error);
    toast.add({ severity: "error", summary: "Erreur", detail: "Erreur chargement données", life: 3000 });
  } finally {
    loadingLists.value = false;
  }
};

// Charger au montage
onMounted(() => {
  loadLists();
});

// Définition des groupes de champs du formulaire produit
const productGroups = computed(() => [
  {
    title: "Informations Générales",
    icon: "pi pi-info-circle",
    fields: [
      {
        name: "image",
        label: "Image du produit",
        type: "image" as const,
        required: false,
        placeholder: "Ajouter une image",
        acceptedFormats: "image/png,image/jpeg,image/jpg,image/webp",
        maxSize: 5, // 5MB
        helpText: "Format accepté : PNG, JPG, WEBP. Max 5Mo."
      },
      {
        name: "nom",
        label: "Nom du produit",
        type: "text" as const,
        placeholder: "Ex: Smartphone X",
        required: true,
      },
      // {
      //   name: "description",
      //   label: "Description",
      //   type: "textarea" as const,
      //   placeholder: "Description détaillée du produit...",
      //   required: false,
      // },
      {
        name: "code_barre",
        label: "Code barre",
        type: "text" as const,
        placeholder: "Scanner ou saisir le code",
        required: false,
      },
      {
        name: "unite_id",
        label: "Unité de base",
        type: "select-with-add" as const,
        placeholder: "Sélectionnez l'unité",
        required: true,
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
        options: categories.value,
        optionLabel: "nom",
        optionValue: "id",
      },
    ]
  },
  {
    title: "Tarification",
    icon: "pi pi-tag",
    fields: [
      {
        name: "prix_achat",
        label: "Prix d'achat",
        type: "currency" as const,
        placeholder: "0.00",
        required: true,
      },
      {
        name: "prix_vente",
        label: "Prix de vente",
        type: "currency" as const,
        placeholder: "0.00",
        required: true,
      },
      {
        name: "marge_min_pourcent",
        label: "Marge minimum (%)",
        type: "number" as const,
        placeholder: "Ex: 20",
        required: false,
        min: 0,
        max: 100,
        helpText: "Seuil d'alerte si la marge descend sous ce pourcentage."
      },
      {
        name: "tva_pourcentage",
        label: "TVA (%)",
        type: "number" as const,
        placeholder: "Ex: 15",
        required: false,
        min: 0,
        max: 100,
      },
    ]
  },
  {
    title: "Stock & Configuration",
    icon: "pi pi-box",
    fields: [
      {
        name: "magasin_id",
        label: "Magasin pour stock initial",
        type: "select" as const,
        placeholder: "Sélectionnez un magasin",
        required: false,
        options: magasins.value,
        optionLabel: "nom",
        optionValue: "id",
        helpText: "Si vous êtes votre propre fournisseur, saisissez directement la quantité en stock."
      },
      {
        name: "quantite_initiale",
        label: "Quantité initiale en stock",
        type: "number" as const,
        placeholder: "Ex: 100",
        required: false,
        min: 0,
        helpText: "Nombre d'unités disponibles en stock pour ce produit."
      },
      {
        name: "stock_minimum",
        label: "Seuil d'alerte (Stock min)",
        type: "number" as const,
        placeholder: "Ex: 10",
        required: false,
        min: 0,
        helpText: "Vous recevrez une alerte si le stock descend sous ce seuil."
      },
       {
         name: "gere_peremption",
         label: "Gère la péremption",
         type: "checkbox" as const,
         required: false,
         helpText: "Cochez cette case pour activer le suivi des lots et dates de péremption.",
       },
        {
          name: "numero_lot",
          name2: "date_peremption",
          label: "Informations du Lot Initial",
          type: "lot-fields" as const,
          icon: "pi pi-box",
          visible: !!formState.value.gere_peremption,
          fullWidth: true
        },
     ]
   },
  {
    title: "Vente & Formats",
    icon: "pi pi-shopping-bag",
    fields: [
      {
        name: "conditionnements",
        label: "Conditionnements",
        type: "conditionnement" as const,
        required: false,
      },
    ]
  }
]);

// Gestion de la soumission
const handleSubmit = async (data: Record<string, any>) => {
  loading.value = true;

  try {
    // Préparer les données
    const produitPayload = {
      nom: data.nom,
      code_barre: data.code_barre || undefined,
      categorie_id: data.categorie_id || undefined,
      unite_id: data.unite_id || undefined,
      prix_achat: data.prix_achat ? Number(data.prix_achat) : undefined,
      prix_vente: Number(data.prix_vente),
      marge_min_pourcent: data.marge_min_pourcent
        ? Number(data.marge_min_pourcent)
        : undefined,
      gere_peremption: data.gere_peremption || false,
      description: data.description || undefined,
       est_actif: true,
       // Stock initial (si fourni)
       magasin_id: data.magasin_id || undefined,
       quantite_initiale: data.quantite_initiale && data.quantite_initiale > 0 
         ? Number(data.quantite_initiale) 
         : undefined,
       stock_minimum: data.stock_minimum !== undefined ? Number(data.stock_minimum) : undefined,
       numero_lot: data.numero_lot || undefined,
       date_peremption: data.date_peremption || undefined,
      conditionnements: data.conditionnements
        ? data.conditionnements.map((c: any) => ({
            nom: c.nom,
            quantite_base: Number(c.quantite_base),
            prix_vente: Number(c.prix_vente),
            prix_achat: c.prix_achat ? Number(c.prix_achat) : undefined,
            code_barre: c.code_barre || undefined,
          }))
        : undefined,

    };

    // Construction du FormData si nécessaire (si image présente)
    const files = data.$files as Record<string, File> | undefined;
    const imageFile = files?.['image'];
    
    // Check for conditionnement files
    const conditionnementFiles: { file: File, index: number, key: string }[] = [];
    if (produitPayload.conditionnements) {
        produitPayload.conditionnements.forEach((c: any, index: number) => {
            const originalItem = data.conditionnements[index];
            if (originalItem && originalItem.image_file) {
                const key = `cond_img_${index}`;
                conditionnementFiles.push({
                    file: originalItem.image_file,
                    index: index,
                    key: key
                });
                c.image_key = key; 
            }
        });
    }

    let payloadToSend: any = produitPayload;

    if (imageFile || conditionnementFiles.length > 0) {
        const formData = new FormData();
        
        // Append main fields
        Object.entries(produitPayload).forEach(([key, value]) => {
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

    const produit = await createProduit(payloadToSend);

    if (!produit) {
      throw new Error("Échec de la création du produit");
    }

    // Réinitialiser le formulaire
    formRef.value?.resetForm();

    toast.add({
      severity: "success",
      summary: "Succès",
      detail: "Produit ajouté avec succès !",
      life: 3000,
    });

  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement:", error);
    const errorMsg = extractErrorMessage(error, "Une erreur est survenue lors de l'enregistrement");
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

// Annuler / Retour
const handleCancel = () => {
  router.push("/produits");
};

// Gérer le clic sur le bouton + d'un champ
const handleAddClick = (field: any) => {
  console.log("handleAddClick triggered for:", field.name);
  if (field.name === "categorie_id") {
    console.log("Opening Category Dialog");
    showCategoryDialog.value = true;
  } else if (field.name === "unite_id") {
    console.log("Opening Unite Dialog");
    showUniteDialog.value = true;
  } else {
    console.log("Unknown field for add click:", field.name);
  }
};

// Champs pour le formulaire de catégorie
const categoryFields = [
  {
    name: "nom",
    label: "Nom de la catégorie",
    type: "text" as const,
    placeholder: "Ex: Électronique, Vêtements...",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Description optionnelle...",
    required: false,
  },
];

// Créer une nouvelle catégorie
const handleCreateCategory = async (data: Record<string, any>) => {
  loadingCategory.value = true;
  try {
    const newCategory = await createCategory({
      nom: data.nom,
      description: data.description,
    });

    if (!newCategory) {
      throw new Error("Échec de la création de la catégorie");
    }

    categories.value.push(newCategory);

    toast.add({
      severity: "success",
      summary: "Succès",
      detail: "Catégorie créée avec succès",
      life: 3000,
    });

    showCategoryDialog.value = false;

    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.categorie_id = newCategory.id;
    }
  } catch (error: any) {
    console.error("Erreur création catégorie:", error);
    const errorMsg = extractErrorMessage(error, "Erreur lors de la création de la catégorie");
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: errorMsg,
      life: 3000,
    });
  } finally {
    loadingCategory.value = false;
  }
};

// Champs formulaire unité
const uniteFields = [
  { name: "nom", label: "Nom de l'unité", type: "text" as const, required: true, placeholder: "Ex: Kilogramme, Litre, Pièce..." }
];

// Créer une nouvelle unité
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
        const errorMsg = extractErrorMessage(e, "Erreur création unité");
        toast.add({ severity: "error", summary: "Erreur", detail: errorMsg, life: 3000 });
    } finally {
        loadingUnite.value = false;
    }
};
</script>
