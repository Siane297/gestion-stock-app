<template>
  <div class="profile-page flex flex-col gap-6">
    <!-- Header simple -->
    <SimplePageHeader 
      title="Paramètres du Profil" 
      description="Gérez vos informations personnelles, votre mot de passe et votre code PIN d'accès."
    />

    <!-- Un seul formulaire regroupant tout -->
    <div class="container mx-auto">
      <FormulaireDynamique
        title="Mise à jour du profil"
        description="Remplissez les champs ci-dessous pour mettre à jour votre compte."
        :fields="allFields"
        :loading="isUpdating"
        :show-header="false"
        submit-label="Enregistrer les modifications"
        @submit="handleUnifiedSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSecureAuth } from '~/composables/useSecureAuth';
import { useUserApi } from '~/composables/api/useUserApi';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique, { type FormField } from '~/components/form/FormulaireDynamique.vue';
import { useToast } from 'primevue/usetoast';

const { user, refreshAccessToken } = useSecureAuth();
const { updateUserProfile } = useUserApi();
const toast = useToast();

const isUpdating = ref(false);

// Nom à afficher
const displayName = computed(() => {
  return user.value?.name || user.value?.employee?.fullName || '';
});

// Tous les champs regroupés
const allFields = computed<FormField[]>(() => [
  // SECTION : INFORMATIONS PERSONNELLES
  {
    name: 'name',
    label: 'Nom Complet',
    type: 'text',
    placeholder: 'Votre nom complet',
    required: true,
    value: displayName.value,
  },
  {
    name: 'email',
    label: 'Adresse Email',
    type: 'email',
    placeholder: 'votre@email.com',
    required: true,
    value: user.value?.email || '',
  },
  
  // SECTION : SÉCURITÉ
  {
    name: 'currentPassword',
    label: 'Mot de passe actuel',
    type: 'password',
    placeholder: 'Requis pour toute modification de sécurité',
    required: false, // Optionnel si on ne change pas le pass/pin, mais le backend vérifiera si newPassword est présent
    helpText: 'Saisissez votre mot de passe actuel pour valider les changements sensibles.',
  },
  {
    name: 'newPassword',
    label: 'Nouveau mot de passe',
    type: 'password',
    placeholder: 'Laissez vide pour ne pas changer',
    required: false,
  },

  // SECTION : ACCÈS (PIN)
  {
    name: 'pin',
    label: 'Code PIN (Caisse)',
    type: 'password', // On utilise password pour masquer le PIN
    placeholder: '4 à 6 chiffres',
    required: false,
    helpText: 'Code d\'accès rapide pour le point de vente.',
  }
]);

// Gestion de la soumission unifiée
const handleUnifiedSubmit = async (data: Record<string, any>) => {
  isUpdating.value = true;
  try {
    // Préparer les données pour l'API
    const payload: any = {
      name: data.name,
      email: data.email,
    };

    // Ajouter le mot de passe si rempli
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error('Le mot de passe actuel est requis pour définir un nouveau mot de passe.');
      }
      payload.currentPassword = data.currentPassword;
      payload.newPassword = data.newPassword;
    }

    // Ajouter le PIN si rempli (ou si currentPassword est présent pour valider le changement)
    if (data.pin !== undefined && data.pin !== '') {
        // Le backend pourrait exiger currentPassword pour le PIN aussi par sécurité
        if (data.pin.length > 0 && data.pin.length < 4) {
             throw new Error('Le code PIN doit contenir au moins 4 chiffres.');
        }
        payload.pin = data.pin;
        if (data.currentPassword) {
            payload.currentPassword = data.currentPassword;
        }
    }

    const success = await updateUserProfile(payload);
    
    if (success) {
      toast.add({ 
        severity: 'success', 
        summary: 'Succès', 
        detail: 'Votre profil a été mis à jour avec succès.', 
        life: 3000 
      });
      await refreshAccessToken(); // Rafraîchir les infos locales
    }
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Erreur', 
      detail: error.message || error.data?.message || 'Une erreur est survenue lors de la mise à jour.', 
      life: 5000 
    });
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
.profile-page {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>