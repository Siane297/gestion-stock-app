<template>
    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:border-bleu transition-colors">
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
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { PaymentHistory } from '~/composables/api/useSubscriptionApi';

interface Props {
    payment: PaymentHistory;
    currency: string;
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'KMF',
});

// Formatters
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: props.currency,
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
