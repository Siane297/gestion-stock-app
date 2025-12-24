<template>
  <div>
    <!-- <SimplePageHeader
      title="Nouveau Mouvement de Stock"
      description="Enregistrer une entrée, sortie ou ajustement de stock"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Détails du Mouvement"
            description="Veuillez remplir les informations concernant le mouvement de stock."
            :fields="stockFields"
            :loading="loading"
            submit-label="Enregistrer le mouvement"
            cancel-label="Retour"
            @submit="handleSubmit"
            @cancel="handleCancel"
            @change="handleFormChange"
        />
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'stock:creer'
});

import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useStockApi, type CreateMouvementDto } from '~/composables/api/useStockApi';
import { useProduitApi } from '~/composables/api/useProduitApi';
import { useMagasinApi } from '~/composables/api/useMagasinApi';

const router = useRouter();
const toast = useToast();
const { createMouvement } = useStockApi();
const { getProduits } = useProduitApi();
const { getMagasins } = useMagasinApi(); 

const loading = ref(false);
const produits = ref<any[]>([]);
const magasins = ref<any[]>([]);
const currentFormState = ref<any>({}); // To track form state

const loadData = async () => {
    try {
        produits.value = await getProduits();
        magasins.value = await getMagasins();
    } catch (e) {
        console.error("Erreur chargement données formulaire stock", e);
    }
};

const handleFormChange = (data: any) => {
    currentFormState.value = data;
};

// Find selected product to get its packaging options
const selectedProduct = computed(() => {
    // console.log("Finding product for ID:", currentFormState.value.produit_id);
    if (!currentFormState.value.produit_id) return null;
    return produits.value.find(p => p.id === currentFormState.value.produit_id);
});

const conditionnementOptions = computed(() => {
    if (!selectedProduct.value) return [];
    
    // console.log("Selected Product:", selectedProduct.value);
    
    const options: any[] = [];

    // 1. Add all from DB
    if (selectedProduct.value.conditionnements) {
        selectedProduct.value.conditionnements.forEach((c: any) => {
            options.push({
                label: `${c.nom} (x${c.quantite_base})`,
                value: c.id,
                quantite_base: c.quantite_base
            });
        });
    }

    // 2. Check if we strictly need the default "Unité" abstract option
    // If NO conditionnement has quantite_base == 1, we add the default one.
    const hasBaseUnit = options.some(o => o.quantite_base === 1);
    
    if (!hasBaseUnit) {
        options.unshift({ 
            label: `Unité (${selectedProduct.value.unite || 'Pce'})`, 
            value: 'UNIT', 
            quantite_base: 1 
        });
    }

    return options;
});

const stockFields = computed(() => {
    const fields = [
    {
        name: 'magasin_id',
        label: 'Boutique',
        type: 'select' as const,
        required: true,
        options: magasins.value,
        optionLabel: 'nom',
        optionValue: 'id',
        placeholder: 'Sélectionner un magasin',
        fullWidth: true
    },
    {
        name: 'produit_id',
        label: 'Produit',
        type: 'select' as const,
        required: true,
        options: produits.value,
        optionLabel: 'nom',
        optionValue: 'id',
        placeholder: 'Sélectionner un produit',
        filter: true,
        fullWidth: true,
        value: currentFormState.value.produit_id
    },
    // Only show conditionnement if product is selected
    ...(selectedProduct.value ? [{
        name: 'conditionnement_id',
        label: "Conditionnement / Format d'achat",
        type: 'select-packaging' as const, 
        required: true, 
        options: conditionnementOptions.value,
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Choisir le format',
        value: currentFormState.value.conditionnement_id || 'UNIT', // Use current value or default
        fullWidth: true
    }] : []),
    {
        name: 'type',
        label: 'Type de Mouvement',
        type: 'select' as const,
        placeholder: 'Sélectionner un type de mouvement',
        required: true,
        options: [
            { label: 'Entrée', value: 'ENTREE_ACHAT' },
            { label: 'Retour', value: 'ENTREE_RETOUR' },
            { label: 'Vente', value: 'SORTIE_VENTE' },
            { label: 'Périssable', value: 'SORTIE_PERISSABLE' },
            { label: 'Ajustement', value: 'AJUSTEMENT' },
            { label: 'Transfert', value: 'TRANSFERT' },
        ],
        optionLabel: 'label',
        optionValue: 'value',
        value: currentFormState.value.type // Bind to state
    },
    // Show destination store only if Transfer
    ...(currentFormState.value.type === 'TRANSFERT' ? [{
        name: 'magasin_dest_id',
        label: 'Magasin de Destination',
        type: 'select' as const,
        required: true,
        options: magasins.value.filter(m => m.id !== currentFormState.value.magasin_id),
        optionLabel: 'nom',
        optionValue: 'id',
        placeholder: 'Sélectionner le magasin cible',
        value: currentFormState.value.magasin_dest_id // Bind value to state to ensure FormulaireDynamique picks it up if already set, or inits it.
    }] : []),
    {
        name: 'quantite',
        label: 'Quantité',
        type: 'number' as const,
        required: true,
        min: 1,
        placeholder: 'Nombre de colis/unités'
    },
    {
        name: 'raison',
        label: 'Raison / Commentaire',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Justification du mouvement (optionnel)'
    }
    ];
    return fields;
});

const handleSubmit = async (data: any) => {
    loading.value = true;
    console.log("Form Data Submitted:", data);
    try {
        // Calculate final quantity based on conditionnement
        let quantiteFinale = Number(data.quantite);
        const condId = data.conditionnement_id;
        
        if (condId && condId !== 'UNIT') {
             const selectedOption = conditionnementOptions.value.find(c => c.value === condId);
             if (selectedOption) {
                 quantiteFinale = quantiteFinale * selectedOption.quantite_base;
             }
        }

        const payload: CreateMouvementDto = {
            magasin_id: data.magasin_id,
            produit_id: data.produit_id,
            type: data.type,
            quantite: quantiteFinale,
            raison: data.raison,
            magasin_dest_id: data.magasin_dest_id // Optional param
        };

        const actionLabel = data.type === 'TRANSFERT' ? 'Transfert' : 'Mouvement';
        await createMouvement(payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: `${actionLabel} enregistré (${quantiteFinale} unités)`, life: 3000 });
        setTimeout(() => {
            router.push('/stock');
        }, 1500);
    } catch (e: any) {
        console.error("Erreur création mouvement", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Erreur lors de l\'enregistrement', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/stock');
};

onMounted(() => {
    loadData();
});
</script>