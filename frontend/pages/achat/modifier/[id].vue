<template>
  <div>
    <div v-if="loadingData" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>

    <div v-else-if="!achat" class="text-center p-8 text-red-500">
      Achat non trouvé.
    </div>

    <div v-else>
       <!-- Header avec Statut -->
       <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Modifier Achat #{{ achat.numero_commande || achat.id.substring(0,8) }}</h1>
                <div class="text-sm text-gray-500">Créé le {{ new Date(achat.date_commande).toLocaleDateString() }}</div>
            </div>
            <div class="flex items-center gap-4">
                 <div class="flex flex-col items-end">
                     <span class="text-xs uppercase text-gray-500 font-semibold">Statut Actuel</span>
                     <span :class="getStatusClass(achat.statut)" class="px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                         {{ formatStatus(achat.statut) }}
                     </span>
                 </div>
            </div>
       </div>

      <!-- Formulaire dynamique -->
      <FormulaireDynamique
        title="Détails de la commande"
        description="Modifiez les informations ou mettez à jour le statut."
        :fields="achatFields"
        submit-label="Enregistrer les modifications"
        cancel-label="Retour"
        :loading="saving"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @change="onFormChange"
        ref="formRef"
      />
    </div>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'achats:modifier'
});

import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useAchatApi } from '~/composables/api/useAchatApi';
import { useFournisseurApi } from '~/composables/api/useFournisseurApi';
import { useMagasinApi } from '~/composables/api/useMagasinApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { getAchatById, updateAchat, updateAchatStatut } = useAchatApi();
const { getFournisseurs } = useFournisseurApi();
const { getMagasins } = useMagasinApi();
const { extractErrorMessage } = useErrorHandler();

const achatId = route.params.id as string;
const achat = ref<any>(null);
const loadingData = ref(true);
const saving = ref(false);

const fournisseurs = ref<any[]>([]);
const magasins = ref<any[]>([]);

const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);

// Chargement initial
onMounted(async () => {
    loadingData.value = true;
    try {
        const [a, f, m] = await Promise.all([
            getAchatById(achatId),
            getFournisseurs(),
            getMagasins()
        ]);
        achat.value = a;
        fournisseurs.value = f;
        magasins.value = m;
    } catch (e) {
        console.error("Erreur chargement", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: "Impossible de charger l'achat.", life: 5000 });
    } finally {
        loadingData.value = false;
    }
});

const isFinalized = computed(() => {
    return achat.value?.statut === 'RECU_COMPLET' || achat.value?.statut === 'PAYE' || achat.value?.statut === 'ANNULE';
});

// Champs du formulaire
const achatFields = computed(() => {
    if (!achat.value) return [];
    
    return [
      {
        name: 'statut',
        label: 'Statut de la commande',
        type: 'select' as const,
        required: true,
        options: [
            { label: 'Commande', value: 'COMMANDE' },
            { label: 'Reçu Partiellement', value: 'RECU_PARTIELLEMENT' },
            { label: 'Reçu Complet', value: 'RECU_COMPLET' },
            { label: 'Facture Reçue', value: 'FACTURE_RECU' },
            { label: 'Payé', value: 'PAYE' },
            { label: 'Annulé', value: 'ANNULE' },
        ],
        optionLabel: 'label',
        optionValue: 'value',
        value: currentForm.value.statut || achat.value.statut,
        disabled: achat.value.statut === 'ANNULE' ,
        helpText: "Attention : Passer à 'RECU_COMPLET' mettra à jour le stock automatiquement."
      },
      {
        name: 'fournisseur_id',
        label: 'Fournisseur',
        type: 'select' as const,
        required: true,
        options: fournisseurs.value,
        optionLabel: 'nom_entreprise',
        optionValue: 'id',
        value: achat.value.fournisseur_id,
        disabled: isFinalized.value
      },
      {
        name: 'magasin_id',
        label: 'Magasin de réception',
        type: 'select' as const,
        required: true,
        options: magasins.value,
        optionLabel: 'nom',
        optionValue: 'id',
        value: achat.value.magasin_id,
        disabled: isFinalized.value
      },
      {
        name: 'numero_commande',
        label: 'Numéro de commande',
        type: 'text' as const,
        required: false,
        value: achat.value.numero_commande,
        disabled: isFinalized.value
      },
      {
        name: 'date_livraison_prevue',
        label: 'Date de réception prévue',
        type: 'date' as const,
        required: false,
        value: achat.value.date_livraison_prevue ? new Date(achat.value.date_livraison_prevue) : null,
        disabled: isFinalized.value
      },
      {
        name: 'details',
        label: 'Produits',
        type: 'achat-lines' as const,
        required: true,
        fullWidth: true,
        // Conversion des détails existants pour le composant
        // Conversion des détails existants pour le composant - IMPORTANT : Utiliser la valeur courant du formulaire si elle existe pour ne pas écraser les changements
        value: (currentForm.value.details && currentForm.value.details.length > 0) ? currentForm.value.details : achat.value.details.map((d: any) => ({
            ...d,
            conditionnement_id: d.conditionnement_id, // Keep null if null
            // Le composant attend peut-être des champs spécifiques, on passe tout
        })),
        disabled: isFinalized.value // Désactiver l'édition des lignes si finalisé
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea' as const,
        required: false,
        fullWidth: true,
        value: achat.value.notes
      },
      // Champ conditionnel pour le reliquat
      ...(hasReducedQuantities.value ? [{
          name: 'create_reliquat',
          label: 'Générer une commande reliquat pour les quantités non reçues ?',
          type: 'checkbox' as const,
          binary: true,
          value: true, // Par défaut à true quand ça apparaît
          helpText: "Une nouvelle commande sera créée avec les quantités restantes."
      }] : [])
    ];
});

const currentForm = ref<any>({});

const onFormChange = (newData: any) => {
    currentForm.value = newData;
};

// Détecter si les quantités ont baissé
const hasReducedQuantities = computed(() => {
    if (!achat.value || !currentForm.value.details) return false;
    
    // On compare les détails initiaux avec ceux du formulaire
    // Attention: currentForm.value.details peut être incomplet au début
    const formDetails = currentForm.value.details;
    if (!Array.isArray(formDetails)) return false;

    // Pour chaque produit initial, on regarde s'il y en a moins dans le form
    return achat.value.details.some((initialLine: any) => {
        const formLine = formDetails.find((d: any) => d.produit_id === initialLine.produit_id);
        if (!formLine) return true; // Ligne supprimée = réduction
        return Number(formLine.quantite) < initialLine.quantite; // Quantité réduite
    });
});


const handleSubmit = async (data: any) => {
    saving.value = true;
    try {
        let statusChanged = false;
        
        // 1. Mise à jour contenu (si non finalisé, ou partiellement)
        // Note: Le backend 'update' refuse si RECU_COMPLET.
        // Si on est déjà en RECU_COMPLET et qu'on change juste une note ou le statut vers 'FACTURE_RECU', il faut voir si le backend update bloque tout.
        // Le backend update bloque : if (existing.statut === 'RECU_COMPLET' ...).
        // Donc si c'est déjà reçu, on ne peut RIEN update via 'update', il faut utiliser 'updateStatut' uniquement ou patcher le backend.
        
        if (!isFinalized.value) {
            const payload = {
                fournisseur_id: data.fournisseur_id,
                magasin_id: data.magasin_id,
                numero_commande: data.numero_commande,
                date_livraison_prevue: data.date_livraison_prevue,
                notes: data.notes,
                create_reliquat: data.create_reliquat,
                details: data.details.map((d: any) => ({
                    produit_id: d.produit_id,
                    quantite: Number(d.quantite),
                    quantite_recue: d.quantite_recue ? Number(d.quantite_recue) : 0,
                    prix_unitaire: Number(d.prix_unitaire),
                    prix_total: Number(d.prix_total),
                    numero_lot: d.numero_lot || undefined,
                    date_peremption: d.date_peremption || undefined,
                    conditionnement_id: d.conditionnement_id === 'UNIT' ? null : d.conditionnement_id,
                    quantite_conditionnement: d.quantite_conditionnement ? Number(d.quantite_conditionnement) : undefined,
                    prix_unitaire_conditionnement: d.prix_unitaire_conditionnement ? Number(d.prix_unitaire_conditionnement) : undefined
                }))
            };
            await updateAchat(achatId, payload);
        }

        // 2. Mise à jour Statut (si changé)
        if (data.statut !== achat.value.statut) {
             await updateAchatStatut(achatId, data.statut);
             statusChanged = true;
        }

        toast.add({ severity: 'success', summary: 'Succès', detail: 'Modifications enregistrées', life: 3000 });
        
        if (statusChanged && data.statut === 'RECU_COMPLET') {
             toast.add({ severity: 'info', summary: 'Stock mis à jour', detail: 'La réception a été validée et le stock incrémenté.', life: 5000 });
        }
        
        // Redirection vers la liste
        setTimeout(() => {
            router.push('/achat');
        }, 1000); // Petit délai pour laisser le temps de voir le toast

    } catch (error: any) {
        console.error("Update Error", error);
        const errorMsg = extractErrorMessage(error, "Erreur de mise à jour");
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg, life: 5000 });
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.back();
};

// UI Helpers
const getStatusClass = (status: string) => {
    switch (status) {
        case 'COMMANDE': return 'bg-blue-100 text-blue-700';
        case 'RECU_PARTIELLEMENT': return 'bg-orange-100 text-orange-700';
        case 'RECU_COMPLET': return 'bg-green-100 text-green-700';
        case 'FACTURE_RECU': return 'bg-purple-100 text-purple-700';
        case 'PAYE': return 'bg-gray-100 text-gray-700';
        case 'ANNULE': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-500';
    }
};

const formatStatus = (status: string) => {
    const map: Record<string, string> = {
        'COMMANDE': 'Commande',
        'RECU_PARTIELLEMENT': 'Reçu Partiel',
        'RECU_COMPLET': 'Reçu Complet',
        'FACTURE_RECU': 'Facturé',
        'PAYE': 'Payé',
        'ANNULE': 'Annulé'
    };
    return map[status] || status;
};
</script>