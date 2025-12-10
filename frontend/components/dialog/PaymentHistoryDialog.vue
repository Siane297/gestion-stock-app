<template>
    <Dialog 
        v-model:visible="visible" 
        modal 
        header="Historique des paiements" 
        :style="{ width: '700px' }"
    >
        <div class="space-y-4">
            <!-- Informations de l'organisation -->
            <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:building-2" class="text-white text-lg" />
                    </div>
                    <div>
                        <h3 class="font-semibold text-noir">{{ organization?.name }}</h3>
                        <p class="text-sm text-gray-500">{{ organization?.employeeCount }} employé(s)</p>
                    </div>
                </div>
                <div class="text-right">
                    <SubscriptionBadge :status="organization?.subscriptionStatus" />
                    <p v-if="organization?.daysRemaining !== null" class="text-xs text-gray-500 mt-1">
                        {{ organization!.daysRemaining }} jour(s) restant(s)
                    </p>
                </div>
            </div>

            <!-- État de chargement -->
            <div v-if="loading" class="space-y-3">
                <Skeleton v-for="i in 3" :key="i" height="80px" class="rounded-lg" />
            </div>

            <!-- Liste des paiements -->
            <div v-else-if="payments.length > 0" class="space-y-3">
                <div 
                    v-for="payment in payments" 
                    :key="payment.id"
                    class="bg-white border border-gray-200 rounded-lg p-4 hover:border-bleu transition-colors"
                >
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Icon icon="lucide:check-circle" class="text-green-600 text-xl" />
                            </div>
                            <div>
                                <div class="font-semibold text-noir">
                                    {{ formatCurrency(payment.amount) }}
                                </div>
                                <div class="text-sm text-gray-500">
                                    {{ payment.durationDays }} jours d'abonnement
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">
                                {{ formatDate(payment.paymentDate) }}
                            </div>
                        </div>
                    </div>

                    <!-- Période couverte -->
                    <div class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm">
                        <div class="flex items-center gap-2 text-gray-600">
                            <Icon icon="lucide:calendar-check" class="text-gray-400" />
                            <span>Du {{ formatDate(payment.subscriptionStartDate) }}</span>
                        </div>
                        <Icon icon="lucide:arrow-right" class="text-gray-400" />
                        <div class="flex items-center gap-2 text-gray-600">
                            <Icon icon="lucide:calendar-x" class="text-gray-400" />
                            <span>Au {{ formatDate(payment.subscriptionEndDate) }}</span>
                        </div>
                    </div>

                    <!-- Notes -->
                    <div v-if="payment.notes" class="mt-2 text-sm text-gray-500 italic">
                        "{{ payment.notes }}"
                    </div>
                </div>
            </div>

            <!-- État vide -->
            <div v-else class="text-center py-8">
                <Icon icon="lucide:receipt" class="text-5xl text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">Aucun paiement enregistré</p>
                <p class="text-sm text-gray-400">L'historique des paiements apparaîtra ici</p>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end">
                <AppButton 
                    variant="outline" 
                    label="Fermer" 
                    @click="visible = false"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import Skeleton from 'primevue/skeleton';
import AppButton from '~/components/button/AppButton.vue';
import SubscriptionBadge from '~/components/badge/SubscriptionBadge.vue';
import type { Organization, PaymentHistoryItem } from '~/composables/api/useOrganizationApi';

interface Props {
    organization: Organization | null;
    payments: PaymentHistoryItem[];
    loading?: boolean;
}

defineProps<Props>();

const visible = defineModel<boolean>('visible', { default: false });

// Formatters
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};
</script>
