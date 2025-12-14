<template>
  <div>
    <FormulaireDynamique
      title="Nouveau Fournisseur"
      description="Ajouter un nouveau fournisseur pour vos achats."
      :fields="fields"
      submit-label="Créer le fournisseur"
      cancel-label="Annuler"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useFournisseurApi } from '~/composables/api/useFournisseurApi';

const router = useRouter();
const toast = useToast();
const { createFournisseur } = useFournisseurApi();

const loading = ref(false);

const fields = computed(() => [
  {
    name: 'nom_entreprise',
    label: 'Nom de l\'entreprise',
    type: 'text' as const,
    placeholder: 'Ex: Distrib Express',
    required: true,
    fullWidth: true
  },
  {
    name: 'responsable',
    label: 'Nom du responsable',
    type: 'text' as const,
    placeholder: 'Ex: Jean Dupont',
    required: false
  },
  {
    name: 'email',
    label: 'Adresse email',
    type: 'email' as const,
    placeholder: 'contact@fournisseur.com',
    required: false
  },
  {
    name: 'telephone',
    label: 'Téléphone',
    type: 'text' as const,
    placeholder: '00 00 00 00 00',
    required: false
  },
  {
    name: 'delai_livraison',
    label: 'Délai moyen de livraison (jours)',
    type: 'number' as const,
    placeholder: 'Ex: 3',
    required: false,
    min: 0
  },
  {
    name: 'adresse',
    label: 'Adresse complète',
    type: 'textarea' as const,
    placeholder: 'Adresse du siège...',
    required: false,
    fullWidth: true
  }
]);

const handleSubmit = async (data: any) => {
  loading.value = true;
  try {
    const payload = {
        nom_entreprise: data.nom_entreprise,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        responsable: data.responsable,
        delai_livraison: data.delai_livraison ? Number(data.delai_livraison) : undefined
    };

    const result = await createFournisseur(payload);
    
    if (result) {
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Fournisseur créé avec succès',
        life: 3000
      });
      router.push('/fournisseur'); // Retour à la liste
    } else {
        throw new Error("Échec de la création");
    }
  } catch (error: any) {
    console.error(error);
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.message || 'Impossible de créer le fournisseur',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>