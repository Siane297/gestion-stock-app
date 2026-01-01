<template>
    <div class="container space-y-6">
        <!-- En-tête -->
        <SimplePageHeader title="Gestion des Organisations"
            description="Gérez toutes les organisations de la plateforme" />

        <!-- Statistiques -->
        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardStat 
                label="Organisations" 
                :value="stats.total" 
                icon="lucide:building-2" 
                variant="primary" 
                :loading="loading"
            />
            <CardStat 
                label="En Essai" 
                :value="stats.trial" 
                icon="lucide:clock" 
                variant="warning" 
                :loading="loading"
            />
            <CardStat 
                label="Actives" 
                :value="stats.active" 
                icon="lucide:check-circle" 
                variant="success" 
                :loading="loading"
            />
            <CardStat 
                label="Bloquées" 
                :value="stats.blocked" 
                icon="lucide:ban" 
                variant="danger" 
                :loading="loading"
            />
        </div>

        <div class=" bg-white rounded-xl border-2 border-gris/40 p-5 flex flex-col gap-4">
            <!-- Barre de recherche -->
            <div class="bg-white rounded-xl border-2 border-gris/40 p-5">
                <div class="w-full sm:w-96">
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search"></i>
                        </InputIcon>
                        <InputText v-model="searchQuery" placeholder="Rechercher une organisation..." class="w-full" />
                    </IconField>
                </div>
            </div>

            <!-- État de chargement -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton v-for="i in 6" :key="i" height="300px" class="rounded-xl" />
            </div>

            <!-- Grille des organisations -->
            <div v-else-if="filteredOrganizations.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <OrganizationCard v-for="org in filteredOrganizations" :key="org.id" :organization="org"
                    @toggle-block="handleToggleBlock" @activate="handleActivate" @show-history="handleShowHistory" />
            </div>

            <!-- État vide -->
            <div v-else class="bg-white rounded-xl border-2 border-gris/40 p-12 text-center">
                <Icon icon="lucide:building-2" class="text-6xl text-gray-300 mb-4 mx-auto" />
                <p class="text-gray-500 text-lg font-medium">Aucune organisation trouvée</p>
                <p class="text-gray-400 text-sm mt-2">Il n'y a aucune organisation enregistrée pour le moment</p>
            </div>
        </div>

        <!-- Dialog d'activation d'abonnement -->
        <ActivationDialog v-model:visible="showActivationDialog" v-model:loading="activationLoading"
            :organization="selectedOrganization" :is-renewal="isRenewal" @submit="handleActivationSubmit"
            @close="handleActivationClose" />

        <!-- Dialog d'historique des paiements -->
        <PaymentHistoryDialog v-model:visible="showHistoryDialog" :organization="selectedOrganization"
            :payments="paymentHistory" :loading="historyLoading" />

        <Toast />
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import CardStat from '~/components/card/CardStat.vue';
import OrganizationCard from '~/components/card/OrganizationCard.vue';
import ActivationDialog from '~/components/dialog/ActivationDialog.vue';
import PaymentHistoryDialog from '~/components/dialog/PaymentHistoryDialog.vue';
import {
    useOrganizationApi,
    type Organization,
} from '~/composables/api/useOrganizationApi';
import {
    useSubscriptionApi,
    type PaymentHistory as PaymentHistoryType,
    type ActivateSubscriptionDto
} from '~/composables/api/useSubscriptionApi';

// Protection : Super Admin uniquement
definePageMeta({
    middleware: ['auth', 'permissions'],
    layout: 'super-admin'
});

const {
    getAllOrganizations,
    toggleBlockOrganization,
} = useOrganizationApi();

const {
    activateSubscription,
    renewSubscription,
    getPaymentHistory,
} = useSubscriptionApi();

const toast = useToast();

// États principaux
const organizations = ref<Organization[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// États pour le dialog d'activation
const showActivationDialog = ref(false);
const activationLoading = ref(false);
const selectedOrganization = ref<Organization | null>(null);
const isRenewal = ref(false);

// États pour le dialog d'historique
const showHistoryDialog = ref(false);
const historyLoading = ref(false);
const paymentHistory = ref<PaymentHistoryType[]>([]);

// Organisations filtrées basées sur la recherche
const filteredOrganizations = computed(() => {
    if (!searchQuery.value) return organizations.value;

    const query = searchQuery.value.toLowerCase();
    return organizations.value.filter((org: Organization) =>
        org.name.toLowerCase().includes(query) ||
        org.email.toLowerCase().includes(query) ||
        (org.emailOrganisation && org.emailOrganisation.toLowerCase().includes(query))
    );
});

// Calculer les statistiques
const stats = computed(() => {
    const total = organizations.value.length;
    const trial = organizations.value.filter((o: Organization) => o.subscriptionStatus === 'TRIAL').length;
    const active = organizations.value.filter((o: Organization) => o.subscriptionStatus === 'ACTIVE').length;
    const blocked = organizations.value.filter((o: Organization) => o.blocked).length;

    return {
        total,
        trial,
        active,
        blocked
    };
});

// Charger les organisations
const loadOrganizations = async () => {
    loading.value = true;
    try {
        organizations.value = await getAllOrganizations();
    } catch (error: any) {
        console.error('Erreur lors du chargement des organisations:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message || 'Erreur lors du chargement des organisations',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

// Gérer le basculement bloquer/débloquer
const handleToggleBlock = async (id: string, blocked: boolean) => {
    const org = organizations.value.find((o: Organization) => o.id === id);

    // Si on débloque une organisation expirée, ouvrir le dialog d'activation
    if (!blocked && org && (org.subscriptionStatus === 'EXPIRED' || org.subscriptionStatus === 'BLOCKED')) {
        selectedOrganization.value = org;
        isRenewal.value = false;
        showActivationDialog.value = true;

        // Reset le toggle car on va pas modifier directement
        const orgRef = organizations.value.find((o: Organization) => o.id === id);
        if (orgRef) {
            orgRef.blocked = true;
        }
        return;
    }

    try {
        await toggleBlockOrganization(id, blocked);

        // Mettre à jour l'état local
        if (org) {
            org.blocked = blocked;
        }

        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: `Organisation ${blocked ? 'bloquée' : 'débloquée'} avec succès`,
            life: 3000
        });
    } catch (error: any) {
        console.error('Erreur lors du changement de statut:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message || 'Erreur lors de la mise à jour',
            life: 5000
        });

        if (org) {
            org.blocked = !blocked;
        }
    }
};

// Gérer l'ouverture du dialog d'activation
const handleActivate = (org: Organization) => {
    selectedOrganization.value = org;
    isRenewal.value = org.subscriptionStatus === 'ACTIVE';
    showActivationDialog.value = true;
};

// Gérer la soumission du dialog d'activation
const handleActivationSubmit = async (data: ActivateSubscriptionDto) => {
    if (!selectedOrganization.value) return;

    activationLoading.value = true;
    try {
        if (isRenewal.value) {
            await renewSubscription(selectedOrganization.value.id, data);
        } else {
            await activateSubscription(selectedOrganization.value.id, data);
        }

        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: isRenewal.value
                ? 'Abonnement renouvelé avec succès'
                : 'Abonnement activé avec succès',
            life: 3000
        });

        showActivationDialog.value = false;

        // Recharger les organisations pour voir les changements
        await loadOrganizations();
    } catch (error: any) {
        console.error('Erreur lors de l\'activation:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message || 'Erreur lors de l\'activation',
            life: 5000
        });
    } finally {
        activationLoading.value = false;
    }
};

// Fermer le dialog d'activation
const handleActivationClose = () => {
    selectedOrganization.value = null;
    isRenewal.value = false;
};

// Gérer l'affichage de l'historique des paiements
const handleShowHistory = async (org: Organization) => {
    selectedOrganization.value = org;
    showHistoryDialog.value = true;
    historyLoading.value = true;

    try {
        paymentHistory.value = await getPaymentHistory(org.id);
    } catch (error: any) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message || 'Erreur lors du chargement de l\'historique',
            life: 5000
        });
        paymentHistory.value = [];
    } finally {
        historyLoading.value = false;
    }
};

// Charger au montage
onMounted(() => {
    // Vérifier si l'utilisateur est SUPER_ADMIN
    const { user } = useSecureAuth();
    if (user.value?.role !== 'SUPER_ADMIN') {
        navigateTo('/accueil');
        return;
    }

    loadOrganizations();
});
</script>