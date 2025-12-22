<template>
  <div>
    <!-- <SimplePageHeader
      title="Ajouter un Magasin"
      description="Créez un nouveau point de vente ou entrepôt"
    /> -->

    <div class="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gris">
        <FormulaireDynamique
            title="Informations du Magasin"
            description="Renseignez les détails de votre nouvel établissement."
            :fields="magasinFields"
            :loading="loading"
            submit-label="Créer le magasin"
            cancel-label="Retour"
            @submit="handleSubmit"
            @cancel="handleCancel"
        />
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'magasins:creer'
});

import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import { useMagasinApi, type CreateMagasinDto } from '~/composables/api/useMagasinApi';

const router = useRouter();
const toast = useToast();
const { createMagasin } = useMagasinApi();

const loading = ref(false);

const magasinFields = computed(() => [
    {
        name: 'nom',
        label: 'Nom du Magasin',
        type: 'text' as const,
        required: true,
        placeholder: 'Ex: Boutique Centre-Ville'
    },
    {
        name: 'localisation',
        label: 'Adresse / Localisation',
        type: 'text' as const,
        required: false,
        placeholder: 'Ex: 12 Rue du Commerce, Cotonou'
    },
    {
        name: 'email',
        label: 'Email de contact',
        type: 'email' as const,
        required: false,
        placeholder: 'contact@magasin.com'
    },
    {
        name: 'telephone',
        label: 'Téléphone',
        type: 'text' as const,
        required: false,
        placeholder: '+229 00 00 00 00'
    },
    // {
    //     name: 'heure_ouverture',
    //     label: 'Heure d\'ouverture',
    //     type: 'time' as const,
    //     required: false
    // },
    // {
    //     name: 'heure_fermeture',
    //     label: 'Heure de fermeture',
    //     type: 'time' as const,
    //     required: false
    // }
]);

const handleSubmit = async (data: any) => {
    loading.value = true;
    try {
        // Formatage des heures si nécessaire (Input 'time' peut renvoyer Date ou string)
        // On suppose que l'API attend "HH:mm"
        const formatTime = (date: Date | string) => {
            if (!date) return undefined;
            if (typeof date === 'string') return date;
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        };

        const payload: CreateMagasinDto = {
            nom: data.nom,
            localisation: data.localisation,
            email: data.email,
            telephone: data.telephone,
            // heure_ouverture: formatTime(data.heure_ouverture),
            // heure_fermeture: formatTime(data.heure_fermeture)
        };

        await createMagasin(payload);
        toast.add({ severity: 'success', summary: 'Succès', detail: 'Magasin créé avec succès', life: 3000 });
        setTimeout(() => {
            router.push('/store'); // Redirection vers la liste (à créer si inexistante)
        }, 1500);
    } catch (e: any) {
        console.error("Erreur création magasin", e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de créer le magasin', life: 5000 });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/store');
};
</script>