<template>
    <Dialog v-model:visible="visible" modal header="Historique des paiements" :style="{ width: '700px' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="space-y-4">
            <!-- Informations de l'organisation -->
            <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:store" class="text-white text-lg" />
                    </div>
                    <div>
                        <h3 class="font-semibold text-noir">{{ organization?.name }}</h3>
                        <p class="text-sm text-gray-500">{{ organization?.storeCount }} boutique(s)</p>
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
                <PaymentHistoryCard 
                    v-for="payment in payments" 
                    :key="payment.id"
                    :payment="payment"
                    :currency="organization?.currency || 'KMF'"
                />
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
                <AppButton variant="outline" label="Fermer" @click="visible = false" />
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
import PaymentHistoryCard from '~/components/card/PaymentHistoryCard.vue';
import type { Organization } from '~/composables/api/useOrganizationApi';
import type { PaymentHistory } from '~/composables/api/useSubscriptionApi';

interface Props {
    organization: Organization | null;
    payments: PaymentHistory[];
    loading?: boolean;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', { default: false });
</script>
