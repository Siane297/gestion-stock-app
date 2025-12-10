<template>
    <div class="bg-white rounded-xl border-2 border-gray-200 hover:border-bleu transition-all duration-300 overflow-hidden group hover:shadow-lg">
        <!-- Bannière Logo / Icône -->
        <!-- <div class="relative h-32 bg-primary m-3 rounded-lg flex items-center justify-center overflow-hidden">
            <template v-if="organization.logo">
                <img :src="getLogoUrl(organization.logo)" :alt="organization.name" class=" w-52 object-cover" />
            </template>
            <template v-else>
                <Icon icon="lucide:building-2" class="text-white text-6xl " />
            </template>
        </div> -->

        <!-- Contenu -->
        <div class="p-5">
            <div class="flex mb-4 bg-header rounded-lg p-5 items-center justify-around">
                <!-- Nom de l'organisation -->
                <h3 class="text-lg font-bold text-white truncate">{{ organization.name }}</h3>
                <!-- Badge de statut d'abonnement -->
                <div class="">
                    <SubscriptionBadge :status="organization.subscriptionStatus" />
                </div>
            </div>
            <!-- Email Organisation -->
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Icon icon="lucide:mail" class="text-gray-400" />
                <span class="truncate">{{ organization.emailOrganisation || organization.email }}</span>
            </div>

             <!-- Date de création -->
            <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Icon icon="lucide:calendar" class="text-gray-400" />
                <span>Créé le {{ formatDate(organization.createdAt) }}</span>
            </div>

            <!-- Badges : Employés & Jours restants -->
            <div class="flex items-center gap-2 mb-4 flex-wrap">
                <div class="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Icon icon="lucide:users" class="text-base" />
                    <span>{{ organization.employeeCount }} employés</span>
                </div>
                
                <!-- Jours restants -->
                <div 
                    v-if="organization.daysRemaining !== null"
                    :class="[
                        'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                        daysRemainingColor
                    ]"
                >
                    <Icon icon="lucide:clock" class="text-base" />
                    <span>{{ organization.daysRemaining }} j restants</span>
                </div>

                <!-- Prix mensuel si actif -->
                <div 
                    v-if="organization.monthlyPrice && organization.subscriptionStatus === 'ACTIVE'"
                    class="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                    <Icon icon="lucide:euro" class="text-base" />
                    <span>{{ organization.monthlyPrice }}€/mois</span>
                </div>
            </div>

           

            <!-- Séparateur -->
            <div class="border-t border-gray-200 my-4"></div>

            <!-- Actions -->
            <div class="flex items-center justify-between gap-2">
                <!-- Toggle Bloquer/Débloquer -->
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">
                        {{ organization.blocked ? 'Bloquée' : 'Active' }}
                    </span>
                    <ToggleSwitch 
                        v-model="isActive" 
                        @change="handleToggle" 
                        :disabled="isUpdating"
                        :class="{ 'opacity-50 cursor-not-allowed': isUpdating }" 
                    />
                </div>

                <!-- Boutons d'action -->
                <div class="flex items-center gap-2">
                    <!-- Bouton Historique -->
                    <button 
                        @click="emit('show-history', organization)"
                        class="p-2 rounded-lg hover:bg-gray-50 border border-gris/40 transition-colors text-gray-500 hover:text-noir"
                        title="Historique des paiements"
                    >
                        <Icon icon="lucide:history" class="text-lg" />
                    </button>

                    <!-- Bouton Activer/Renouveler -->
                    <button 
                        v-if="showActivateButton"
                        @click="emit('activate', organization)"
                        class="p-2 rounded-lg hover:bg-green-50 border border-green-200 transition-colors text-green-600 hover:text-green-700"
                        :title="activateButtonTitle"
                    >
                        <Icon :icon="activateButtonIcon" class="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    /* Effet 3D pour le header */
.shadow-3d-header {
  box-shadow: 
    /* 0 6px 12px -2px rgba(0, 0, 0, 0.1), */
    0 4px 8px -2px rgba(0, 0, 0, 0.06),
    inset 0 -3px 6px rgba(140, 140, 140, 0.1),
    inset 0 3px 6px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}
</style>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import ToggleSwitch from 'primevue/toggleswitch';
import SubscriptionBadge from '~/components/badge/SubscriptionBadge.vue';
import type { Organization } from '~/composables/api/useOrganizationApi';

interface Props {
    organization: Organization;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'toggle-block': [id: string, blocked: boolean];
    'activate': [organization: Organization];
    'show-history': [organization: Organization];
}>();

const isUpdating = ref(false);

// État local pour le switch (Active = true, Bloquée = false)
const isActive = ref(!props.organization.blocked);

// Surveiller les changements externes de la prop blocked
watch(() => props.organization.blocked, (newBlocked) => {
    isActive.value = !newBlocked;
});

// Couleur des jours restants
const daysRemainingColor = computed(() => {
    const days = props.organization.daysRemaining;
    if (days === null) return 'bg-gray-100 text-gray-600';
    if (days <= 3) return 'bg-red-50 text-red-700';
    if (days <= 7) return 'bg-orange-50 text-orange-700';
    return 'bg-gray-100 text-gray-600';
});

// Afficher le bouton d'activation/renouvellement
const showActivateButton = computed(() => {
    const status = props.organization.subscriptionStatus;
    // Afficher pour EXPIRED ou BLOCKED, ou si l'abonnement actif expire bientôt
    return status === 'EXPIRED' || status === 'BLOCKED' || 
           (status === 'ACTIVE' && props.organization.daysRemaining !== null && props.organization.daysRemaining <= 7);
});

const activateButtonTitle = computed(() => {
    const status = props.organization.subscriptionStatus;
    if (status === 'EXPIRED' || status === 'BLOCKED') return 'Activer l\'abonnement';
    return 'Renouveler l\'abonnement';
});

const activateButtonIcon = computed(() => {
    const status = props.organization.subscriptionStatus;
    if (status === 'EXPIRED' || status === 'BLOCKED') return 'lucide:play-circle';
    return 'lucide:refresh-cw';
});

// Obtenir l'URL complète du logo
const getLogoUrl = (logo: string | null): string => {
    if (!logo) return '';
    const config = useRuntimeConfig();
    if (logo.startsWith('http')) {
        return logo;
    }
    const baseUrl = config.public.apiBase.replace(/\/$/, '');
    const logoPath = logo.startsWith('/') ? logo : `/${logo}`;
    return `${baseUrl}${logoPath}`;
};

// Formater la date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// Gérer le basculement
const handleToggle = async () => {
    isUpdating.value = true;
    try {
        const newBlockedStatus = !isActive.value;
        emit('toggle-block', props.organization.id, newBlockedStatus);
    } finally {
        setTimeout(() => {
            isUpdating.value = false;
        }, 500);
    }
};
</script>
