<template>
  <div>
    <!-- Formulaire dynamique -->
    <FormulaireDynamique
      title="Mouvement de Stock"
      description="Enregistrer une entrée, sortie ou ajustement manuel de stock."
      :fields="mouvementFields"
      submit-label="Enregistrer le mouvement"
      cancel-label="Annuler"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
      ref="formRef"
    />

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useStockApi, type TypeMouvementStock } from '~/composables/api/useStockApi';
import { useProduitApi } from '~/composables/api/useProduitApi';
import { useMagasinApi } from '~/composables/api/useMagasinApi';

const router = useRouter();
const toast = useToast();
const { createMouvement } = useStockApi();
const { getProduits } = useProduitApi();
const { getMagasins } = useMagasinApi();

const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);
const loading = ref(false);

const produits = ref<any[]>([]);
const magasins = ref<any[]>([]);

const typeOptions = [
    { label: 'Ajustement (Inventaire)', value: 'AJUSTEMENT' },
    { label: 'Entrée (Retour Client)', value: 'ENTREE_RETOUR' },
    { label: 'Sortie (Périmé/Casse)', value: 'SORTIE_PERISSABLE' },
    { label: 'Entrée Manuelle', value: 'ENTREE_ACHAT' }, // Should be used with caution
    { label: 'Sortie Manuelle', value: 'SORTIE_VENTE' }   // Should be used with caution
];

onMounted(async () => {
    try {
        const [p, m] = await Promise.all([getProduits(), getMagasins()]);
        produits.value = p;
        magasins.value = m;
    } catch (e) {
        console.error("Erreur chargement listes", e);
    }
});

const mouvementFields = computed(() => [
  {
    name: 'magasin_id',
    label: 'Magasin',
    type: 'select' as const,
    placeholder: 'Sélectionner un magasin',
    required: true,
    options: magasins.value,
    optionLabel: 'nom',
    optionValue: 'id'
  },
  {
    name: 'produit_id',
    label: 'Produit',
    type: 'select' as const,
    placeholder: 'Sélectionner un produit',
    required: true,
    options: produits.value,
    optionLabel: 'nom',
    optionValue: 'id',
    filter: true
  },
  {
    name: 'type',
    label: 'Type de mouvement',
    type: 'select' as const,
    placeholder: 'Sélectionner le type',
    required: true,
    options: typeOptions,
    optionLabel: 'label',
    optionValue: 'value'
  },
  {
    name: 'quantite',
    label: 'Quantité',
    type: 'number' as const,
    placeholder: '0',
    required: true,
    min: 1
  },
  {
    name: 'numero_lot',
    label: 'Numéro de Lot (Optionnel)',
    type: 'text' as const,
    required: false,
    helpText: 'Remplir si le produit est géré par lot (crééra le lot si inexistant pour une entrée)'
  },
  {
    name: 'date_peremption',
    label: 'Date de péremption (Optionnel)',
    type: 'date' as const,
    required: false,
    helpText: 'Requis si création de nouveau lot'
  },
  {
    name: 'raison',
    label: 'Raison / Commentaire',
    type: 'textarea' as const,
    required: true,
    fullWidth: true
  }
]);

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        const payload = {
            magasin_id: data.magasin_id,
            produit_id: data.produit_id,
            type: data.type as TypeMouvementStock,
            quantite: Number(data.quantite),
            raison: data.raison,
            numero_lot: data.numero_lot || undefined,
            date_peremption: data.date_peremption || undefined
        };

        const result = await createMouvement(payload);
        if (!result) throw new Error("Erreur lors de l'enregistrement du mouvement.");

        toast.add({ 
            severity: 'success', 
            summary: 'Succès', 
            detail: `Mouvement enregistré. Nouveau stock: ${result.newStock?.quantite ?? '?'}`, 
            life: 3000 
        });

        // Reset form
        formRef.value?.resetForm();

    } catch (error: any) {
        console.error("Submit Error", error);
        toast.add({ severity: 'error', summary: 'Erreur', detail: error.message || "Erreur inconnue", life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.back();
};
</script>