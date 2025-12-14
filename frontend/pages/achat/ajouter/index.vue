<template>
  <div>
    <!-- Formulaire dynamique -->
    <FormulaireDynamique
      title="Nouvel Achat"
      description="Saisissez les informations de la commande et les produits reçus."
      :fields="achatFields"
      submit-label="Enregistrer l'achat"
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
import { useAchatApi } from '~/composables/api/useAchatApi';
import { useFournisseurApi } from '~/composables/api/useFournisseurApi';
import { useMagasinApi } from '~/composables/api/useMagasinApi';

const router = useRouter();
const toast = useToast();
const { createAchat, updateAchatStatut } = useAchatApi(); // updateStatutAchat needs to be verified if exposed
const { getFournisseurs } = useFournisseurApi();
const { getMagasins } = useMagasinApi();

const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);
const loading = ref(false);

const fournisseurs = ref<any[]>([]);
const magasins = ref<any[]>([]);

onMounted(async () => {
    try {
        const [f, m] = await Promise.all([getFournisseurs(), getMagasins()]);
        fournisseurs.value = f;
        magasins.value = m;
    } catch (e) {
        console.error("Erreur chargement listes", e);
    }
});

const achatFields = computed(() => [
  {
    name: 'fournisseur_id',
    label: 'Fournisseur',
    type: 'select' as const,
    placeholder: 'Sélectionner un fournisseur',
    required: true,
    options: fournisseurs.value,
    optionLabel: 'nom_entreprise',
    optionValue: 'id'
  },
  {
    name: 'magasin_id',
    label: 'Magasin de réception',
    type: 'select' as const,
    placeholder: 'Sélectionner un magasin',
    required: true,
    options: magasins.value,
    optionLabel: 'nom',
    optionValue: 'id'
  },
  {
    name: 'numero_commande',
    label: 'Numéro de commande',
    type: 'text' as const,
    placeholder: 'Ex: CMD-2024-001',
    required: false
  },
  {
    name: 'date_livraison_prevue',
    label: 'Date de réception',
    type: 'date' as const,
    required: true, // Pour définir la date de l'achat
    value: new Date()
  },
  {
      name: 'reception_immediate',
      label: 'Réceptionner immédiatement (Mise à jour du stock)',
      type: 'checkbox' as const,
      value: true,
      helpText: 'Si coché, le stock sera mis à jour immédiatement avec les lots saisis.'
  },
  {
    name: 'details',
    label: 'Produits',
    type: 'achat-lines' as const,
    required: true,
    fullWidth: true
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea' as const,
    required: false,
    fullWidth: true
  }
]);

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        if (!data.details || data.details.length === 0) {
            throw new Error("Veuillez ajouter au moins un produit.");
        }

        // 1. Création de l'achat
        const payload = {
            fournisseur_id: data.fournisseur_id,
            magasin_id: data.magasin_id,
            numero_commande: data.numero_commande,
            date_livraison_prevue: data.date_livraison_prevue,
            notes: data.notes,
            details: data.details.map((d: any) => ({
                produit_id: d.produit_id,
                quantite: Number(d.quantite),
                prix_unitaire: Number(d.prix_unitaire),
                prix_total: Number(d.prix_total),
                numero_lot: d.numero_lot || undefined,
                date_peremption: d.date_peremption || undefined,
                conditionnement_id: d.conditionnement_id || undefined,
                quantite_conditionnement: d.quantite_conditionnement ? Number(d.quantite_conditionnement) : undefined,
                prix_unitaire_conditionnement: d.prix_unitaire_conditionnement ? Number(d.prix_unitaire_conditionnement) : undefined
            }))
        };

        const achat = await createAchat(payload);
        if (!achat) throw new Error("Erreur lors de la création de la commande.");

        // 2. Réception immédiate si cochée
        if (data.reception_immediate) {
             // Verification de la conformité du statut RECU_COMPLET
            // On appelle l'API pour passer en RECU_COMPLET
            // Note: createAchat return type might need check.
            const updated = await updateAchatStatut(achat.id, 'RECU_COMPLET');
            if (!updated) {
                 toast.add({ severity: 'warn', summary: 'Attention', detail: 'Commande créée mais échec de la réception automatique.', life: 5000 });
            } else {
                 toast.add({ severity: 'success', summary: 'Succès', detail: 'Achat enregistré et stock mis à jour !', life: 3000 });
            }
        } else {
             toast.add({ severity: 'success', summary: 'Succès', detail: 'Commande enregistrée (Stock non impacté).', life: 3000 });
        }

        router.push('/achat'); // Retour à la liste (si elle existe, sinon accueil ou stock)

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
