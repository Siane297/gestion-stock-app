<template>
    <div
        class="bg-white rounded-xl border-2 border-gray-200 hover:border-bleu transition-all duration-300 overflow-hidden group hover:shadow-lg">
        <!-- Contenu -->
        <div class="p-5">
            <div class="relative flex mb-4 bg-side2 rounded-lg p-5 overflow-visible items-center justify-between">
                <!-- Arrière-plan lignes courbées -->
                <div class="absolute inset-0 pointer-events-none opacity-10">
                    <svg viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
                        class="w-full h-full">
                        <path d="M0 80 C 130 50 260 150 400 100 L 400 150 L 0 150 Z" fill="white" />
                        <path d="M0 100 C 100 130 300 40 400 120 L 400 150 L 0 150 Z" fill="white" opacity="0.5" />
                    </svg>
                </div>

                <!-- Contenu (titre + badge) -->
                <div class="relative z-10 flex items-center justify-between w-full">
                    <div class="flex items-center gap-2 w-full ">
                        <div class="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Icon icon="lucide:store" class="text-white text-xl" />
                        </div>
                        <h3 class="font-bold text-white">{{ organization.name }}</h3>
                    </div>

                    <!-- Badge de statut d'abonnement -->
                    <div class="absolute -top-8 -right-6">
                        <SubscriptionBadge :status="organization.subscriptionStatus" />
                    </div>
                </div>
            </div>
            <!-- Telephone Organisation -->
            <div class="flex items-center gap-2 text-sm text-noir mb-3">
                <Icon icon="lucide:phone" class="" />
                <span class="truncate">{{ organization.telephoneOrganisation }}</span>
            </div>

            <!-- Date de création -->
            <div class="flex items-center gap-2 text-sm text-noir mb-4">
                <Icon icon="lucide:calendar" class="" />
                <span>Créé le {{ formatDate(organization.createdAt) }}</span>
            </div>

            <!-- Badges : Employés & Jours restants -->
            <div class="flex items-center gap-2 mb-4 flex-wrap">
                <div
                    class="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Icon icon="lucide:store" class="text-base" />
                    <span>{{ organization.storeCount }} boutiques</span>
                </div>

                <!-- Jours restants -->
                <div v-if="organization.daysRemaining !== null" :class="[
                    'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                    daysRemainingColor
                ]">
                    <Icon icon="lucide:clock" class="text-base" />
                    <span>{{ organization.daysRemaining }} j restants</span>
                </div>

                <!-- Prix mensuel si actif -->
                <!-- <div v-if="organization.monthlyPrice && organization.subscriptionStatus === 'ACTIVE'"
                    class="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Icon icon="lucide:euro" class="text-base" v-if="!organization.currency" />
                    <span>{{ organization.monthlyPrice }} {{ organization.currency || '€' }}/mois</span>
                </div> -->
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
                    <ToggleSwitch v-model="isActive" @change="handleToggle" :disabled="isUpdating"
                        :class="{ 'opacity-50 cursor-not-allowed': isUpdating }" />
                </div>

                <!-- Boutons d'action -->
                <div class="flex items-center gap-2">
                    <!-- Bouton Historique -->
                    <button @click="emit('show-history', organization)"
                        class="p-2 rounded-lg hover:bg-gray-50 border border-gris/40 transition-colors text-gray-500 hover:text-noir"
                        title="Historique des paiements">
                        <Icon icon="lucide:history" class="text-lg" />
                    </button>

                    <!-- Bouton Activer/Renouveler -->
                    <button v-if="showActivateButton" @click="emit('activate', organization)"
                        class="p-2 rounded-lg hover:bg-green-50 border border-green-200 transition-colors text-green-600 hover:text-green-700"
                        :title="activateButtonTitle">
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
    // Afficher pour TRIAL, EXPIRED ou BLOCKED, ou si l'abonnement actif expire bientôt
    return status === 'TRIAL' || status === 'EXPIRED' || status === 'BLOCKED' ||
        (status === 'ACTIVE' && props.organization.daysRemaining !== null && props.organization.daysRemaining <= 7);
});

const activateButtonTitle = computed(() => {
    const status = props.organization.subscriptionStatus;
    if (status === 'TRIAL' || status === 'EXPIRED' || status === 'BLOCKED') return 'Activer l\'abonnement';
    return 'Renouveler l\'abonnement';
});

const activateButtonIcon = computed(() => {
    const status = props.organization.subscriptionStatus;
    if (status === 'TRIAL' || status === 'EXPIRED' || status === 'BLOCKED') return 'lucide:play-circle';
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
