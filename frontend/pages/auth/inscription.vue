<template>
  <StepperInscription
    :steps="inscriptionSteps"
    header-title="Bienvenue sur Pointage App"
    header-description="Créez votre espace de gestion en quelques étapes"
    :on-submit="handleRegister"
  />
</template>

<script setup lang="ts">
import StepperInscription from '~/components/stepper/StepperInscription.vue';
import { useSecureAuth } from '~/composables/useSecureAuth';
import { useCurrentUser } from '~/composables/api/useUserApi';

// Désactiver le layout
definePageMeta({
  layout: false,
});

const { register } = useSecureAuth();

// Configuration des étapes du stepper
const inscriptionSteps = [
  {
    title: 'Administrateur',
    fields: [
      {
        name: 'name',
        label: 'Nom complet',
        type: 'text' as const,
        placeholder: 'Jean Dupont',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'votre@email.com',
        required: true,
      },
      {
        name: 'password',
        label: 'Mot de passe',
        type: 'password' as const,
        placeholder: '••••••••',
        required: true,
        feedback: true,
      },
      {
        name: 'confirmPassword',
        label: 'Confirmer le mot de passe',
        type: 'password' as const,
        placeholder: '••••••••',
        required: true,
        feedback: false,
      },
    ],
  },
  {
    title: "Organisation",
    fields: [
      {
        name: 'companyName',
        label: "Nom de l'organisation",
        type: 'text' as const,
        placeholder: 'Ma Société',
        required: true,
      },
      {
        name: 'emailOrganisation',
        label: "Email de l'organisation",
        type: 'email' as const,
        placeholder: 'contact@masociete.com',
        required: true,
      },
      {
        name: 'telephoneOrganisation',
        label: "Téléphone de l'organisation",
        type: 'tel' as const,
        placeholder: '+269 123 45 67',
        required: true,
      },
      {
        name: 'country',
        label: 'Pays',
        type: 'select' as const,
        placeholder: 'Sélectionnez votre pays',
        required: true,
        showFlag: true,
        filter: true,
        optionLabel: 'label',
        optionValue: 'value',
        options: [
          { label: 'Kenya', value: 'Kenya', code: 'ke' },
          { label: 'Tanzania', value: 'Tanzania', code: 'tz' },
          { label: 'Uganda', value: 'Uganda', code: 'ug' },
          { label: 'Ethiopia', value: 'Ethiopia', code: 'et' },
          { label: 'Somalia', value: 'Somalia', code: 'so' },
          { label: 'Djibouti', value: 'Djibouti', code: 'dj' },
          { label: 'Comoros', value: 'Comoros', code: 'km' },
          { label: 'Madagascar', value: 'Madagascar', code: 'mg' },
          { label: 'Nigeria', value: 'Nigeria', code: 'ng' },
          { label: 'Cameroon', value: 'Cameroon', code: 'cm' },
          { label: 'Niger', value: 'Niger', code: 'ne' },
          { label: 'Chad', value: 'Chad', code: 'td' },
          { label: 'Benin', value: 'Benin', code: 'bj' },
          { label: 'Togo', value: 'Togo', code: 'tg' },
          { label: 'Gabon', value: 'Gabon', code: 'ga' },
          { label: 'Congo', value: 'Congo', code: 'cg' },
          { label: 'RDC', value: 'RDC', code: 'cd' },
          { label: 'South Africa', value: 'South Africa', code: 'za' },
          { label: 'Zimbabwe', value: 'Zimbabwe', code: 'zw' },
          { label: 'Zambia', value: 'Zambia', code: 'zm' },
          { label: 'Botswana', value: 'Botswana', code: 'bw' },
          { label: 'Mozambique', value: 'Mozambique', code: 'mz' },
          { label: 'Malawi', value: 'Malawi', code: 'mw' },
          { label: 'Morocco', value: 'Morocco', code: 'ma' },
          { label: 'Algeria', value: 'Algeria', code: 'dz' },
          { label: 'Tunisia', value: 'Tunisia', code: 'tn' },
          { label: 'Libya', value: 'Libya', code: 'ly' },
          { label: 'Egypt', value: 'Egypt', code: 'eg' },
          { label: 'Portugal', value: 'Portugal', code: 'pt' },
          { label: 'Ireland', value: 'Ireland', code: 'ie' },
          { label: 'United Kingdom', value: 'United Kingdom', code: 'gb' },
          { label: 'France', value: 'France', code: 'fr' },
          { label: 'Germany', value: 'Germany', code: 'de' },
          { label: 'Italy', value: 'Italy', code: 'it' },
          { label: 'Spain', value: 'Spain', code: 'es' },
          { label: 'Belgium', value: 'Belgium', code: 'be' },
          { label: 'Netherlands', value: 'Netherlands', code: 'nl' },
          { label: 'Switzerland', value: 'Switzerland', code: 'ch' },
          { label: 'Austria', value: 'Austria', code: 'at' },
          { label: 'Poland', value: 'Poland', code: 'pl' },
          { label: 'Czech Republic', value: 'Czech Republic', code: 'cz' },
          { label: 'Hungary', value: 'Hungary', code: 'hu' },
          { label: 'Sweden', value: 'Sweden', code: 'se' },
          { label: 'Norway', value: 'Norway', code: 'no' },
          { label: 'Denmark', value: 'Denmark', code: 'dk' },
          { label: 'Greece', value: 'Greece', code: 'gr' },
          { label: 'Romania', value: 'Romania', code: 'ro' },
          { label: 'Bulgaria', value: 'Bulgaria', code: 'bg' },
          { label: 'Ukraine', value: 'Ukraine', code: 'ua' },
          { label: 'Finland', value: 'Finland', code: 'fi' },
          { label: 'UAE', value: 'UAE', code: 'ae' },
          { label: 'Saudi Arabia', value: 'Saudi Arabia', code: 'sa' },
          { label: 'Qatar', value: 'Qatar', code: 'qa' },
          { label: 'Kuwait', value: 'Kuwait', code: 'kw' },
          { label: 'Bahrain', value: 'Bahrain', code: 'bh' },
          { label: 'Oman', value: 'Oman', code: 'om' },
          { label: 'Israel', value: 'Israel', code: 'il' },
          { label: 'Turkey', value: 'Turkey', code: 'tr' },
          { label: 'India', value: 'India', code: 'in' },
          { label: 'Pakistan', value: 'Pakistan', code: 'pk' },
          { label: 'Bangladesh', value: 'Bangladesh', code: 'bd' },
          { label: 'China', value: 'China', code: 'cn' },
          { label: 'Japan', value: 'Japan', code: 'jp' },
          { label: 'South Korea', value: 'South Korea', code: 'kr' },
          { label: 'Thailand', value: 'Thailand', code: 'th' },
          { label: 'Vietnam', value: 'Vietnam', code: 'vn' },
          { label: 'Singapore', value: 'Singapore', code: 'sg' },
          { label: 'Malaysia', value: 'Malaysia', code: 'my' },
          { label: 'Indonesia', value: 'Indonesia', code: 'id' },
          { label: 'Philippines', value: 'Philippines', code: 'ph' },
          { label: 'USA', value: 'USA', code: 'us' },
          { label: 'Canada', value: 'Canada', code: 'ca' },
          { label: 'Mexico', value: 'Mexico', code: 'mx' },
          { label: 'Brazil', value: 'Brazil', code: 'br' },
          { label: 'Argentina', value: 'Argentina', code: 'ar' },
          { label: 'Chile', value: 'Chile', code: 'cl' },
          { label: 'Colombia', value: 'Colombia', code: 'co' },
          { label: 'Peru', value: 'Peru', code: 'pe' },
          { label: 'Australia', value: 'Australia', code: 'au' },
          { label: 'New Zealand', value: 'New Zealand', code: 'nz' },
        ],
      },
      {
        name: 'address',
        label: 'Adresse (optionnel)',
        type: 'textarea' as const,
        placeholder: '123 Rue de la Paix, Moroni',
        required: false,
        fullWidth: true,
      },
    ],
  },
  {
    title: 'Résumé',
    isSummary: true,
  },
];

// Fonction de soumission
const handleRegister = async (data: Record<string, any>) => {
  try {
    const response = await register({
      name: data.name,
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      emailOrganisation: data.emailOrganisation,
      telephoneOrganisation: data.telephoneOrganisation,
      country: data.country,
      address: data.address || undefined,
    });

    if (response.success) {
      // Charger immédiatement les informations utilisateur afin que user.company.schemaName
      // soit disponible avant la première navigation (x-tenant-id envoyé dès le départ)
      const { fetchUser } = useCurrentUser();
      try {
        await fetchUser();
      } catch (e) {
        console.warn('[inscription] Impossible de charger l\'utilisateur juste après inscription', e);
      }
      // Rediriger vers la page de préparation
      await navigateTo('/auth/preparation');
      return { success: true };
    } else {
      return {
        success: false,
        message: response.message || "Erreur lors de l'inscription",
      };
    }
  } catch (error: any) {
    console.error("Erreur d'inscription:", error);
    return {
      success: false,
      message: error.data?.message || "Erreur lors de l'inscription",
    };
  }
};
</script>
