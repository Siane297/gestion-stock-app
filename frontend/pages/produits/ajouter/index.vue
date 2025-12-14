<template>
  <div>
    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
      <!-- Formulaire dynamique -->
      <FormulaireDynamique
        title="Ajouter un produit"
        description="Remplissez le formulaire pour créer un nouveau produit dans le catalogue"
        :fields="productFields"
        submit-label="Enregistrer"
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

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import FormulaireDynamique from "~/components/form/FormulaireDynamique.vue";
import FormPopupDynamique from "~/components/form/FormPopupDynamique.vue";
import { useProduitApi } from "~/composables/api/useProduitApi";
import { useCategorieProduitApi } from "~/composables/api/useCategorieProduitApi";

const { createProduit } = useProduitApi();
const { getCategories, createCategory } = useCategorieProduitApi();
const toast = useToast();

const router = useRouter();

// Référence du formulaire
const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);

// État
const loading = ref(false);

// Listes des catégories
const categories = ref<Array<{ id: string; nom: string }>>([]);
const loadingLists = ref(false);

// États du popup catégorie
const showCategoryDialog = ref(false);
const loadingCategory = ref(false);

// Charger les catégories
const loadCategories = async () => {
  loadingLists.value = true;
  try {
    const categoriesData = await getCategories();
    categories.value = categoriesData;
    console.log("Catégories chargées:", categories.value.length);
  } catch (error) {
    console.error("Erreur chargement catégories:", error);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: "Erreur lors du chargement des catégories",
      life: 3000,
    });
  } finally {
    loadingLists.value = false;
  }
};

// Charger au montage
onMounted(() => {
  loadCategories();
});

// Définition des champs du formulaire produit
const productFields = computed(() => [
  {
    name: "nom",
    label: "Nom du produit",
    type: "text" as const,
    placeholder: "Ex: Smartphone X",
    required: true,
  },
  {
    name: "code_barre",
    label: "Code barre",
    type: "text" as const,
    placeholder: "Scanner ou saisir le code",
    required: false,
  },
  {
    name: "unite",
    label: "Unité de base",
    type: "select" as const,
    placeholder: "Sélectionnez l'unité",
    required: true,
    value: "UNITE", // Valeur par défaut
    options: [
      { label: "Unité (pièce)", value: "UNITE" },
      { label: "Kilogramme (kg)", value: "KG" },
      { label: "Litre (L)", value: "LITRE" },
      { label: "Mètre (m)", value: "METRE" },
      { label: "Paquet", value: "PAQUET" },
      { label: "Autre", value: "AUTRE" },
    ],
    optionLabel: "label",
    optionValue: "value",
  },
  {
    name: "categorie_id",
    label: "Catégorie",
    type: "select-with-add" as const,
    placeholder: "Sélectionnez une catégorie",
    required: false, // Selon modèle, nullable mais souvent utile
    options: categories.value,
    optionLabel: "nom",
    optionValue: "id",
  },
  {
    name: "prix_achat",
    label: "Prix d'achat",
    type: "number" as const,
    placeholder: "0.00",
    required: false,
  },
  {
    name: "prix_vente",
    label: "Prix de vente",
    type: "number" as const,
    placeholder: "0.00",
    required: true,
  },
  {
    name: "gere_peremption",
    label: "Gère la péremption",
    type: "checkbox" as const,
    required: false,
    helpText:
      "Cochez cette case pour activer le suivi des lots et dates de péremption.",
  },

  // {
  //   name: 'marge_min_pourcent',
  //   label: 'Alerte marge (%)',
  //   type: 'number' as const,
  //   placeholder: 'Ex: 20',
  //   required: false,
  //   helpText: 'Pourcentage de marge minimum souhaité'
  // },
  {
    name: "conditionnements",
    label: "Conditionnements",
    type: "conditionnement" as const,
    required: false,
  },
  // {
  //   name: 'description',
  //   label: 'Description',
  //   type: 'textarea' as const,
  //   placeholder: 'Description détaillée du produit...',
  //   required: false
  // }
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
      prix_achat: data.prix_achat ? Number(data.prix_achat) : undefined,
      prix_vente: Number(data.prix_vente),
      unite: data.unite || "UNITE",
      marge_min_pourcent: data.marge_min_pourcent
        ? Number(data.marge_min_pourcent)
        : undefined,
      gere_peremption: data.gere_peremption || false,
      description: data.description || undefined,
      est_actif: true,
      conditionnements: data.conditionnements
        ? data.conditionnements.map((c: any) => ({
            nom: c.nom,
            quantite_base: Number(c.quantite_base),
            prix_vente: Number(c.prix_vente),
            code_barre: c.code_barre || undefined,
          }))
        : undefined,
    };

    const produit = await createProduit(produitPayload);

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

    // Optionnel : Rediriger ou rester sur la page pour ajouter un autre
    // router.push('/produits');
  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement:", error);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail:
        error.message || "Une erreur est survenue lors de l'enregistrement",
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
  if (field.name === "categorie_id") {
    showCategoryDialog.value = true;
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

    // Ajouter la nouvelle catégorie à la liste
    categories.value.push(newCategory);

    toast.add({
      severity: "success",
      summary: "Succès",
      detail: "Catégorie créée avec succès",
      life: 3000,
    });

    // Fermer le dialog
    showCategoryDialog.value = false;

    // Sélectionner automatiquement après un court délai
    await nextTick();
    if (formRef.value && (formRef.value as any).formData) {
      (formRef.value as any).formData.categorie_id = newCategory.id;
    }
  } catch (error: any) {
    console.error("Erreur création catégorie:", error);
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: error.message || "Erreur lors de la création de la catégorie",
      life: 3000,
    });
  } finally {
    loadingCategory.value = false;
  }
};
</script>
