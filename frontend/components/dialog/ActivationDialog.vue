<template>
    <Dialog 
        v-model:visible="visible" 
        modal 
        :header="dialogTitle" 
        :style="{ width: '550px' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="!loading"
        :closeOnEscape="!loading"
    >
        <div class="space-y-6">
            <!-- Informations de l'organisation -->
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Icon icon="lucide:store" class="text-white text-xl" />
                    </div>
                    <div>
                        <h3 class="font-semibold text-noir">{{ organization?.name }}</h3>
                        <p class="text-sm text-gray-500">{{ organization?.storeCount }} boutique(s)</p>
                    </div>
                </div>
                <div class="text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                        <Icon icon="lucide:phone" class="text-gray-400" />
                        <span>{{ organization?.telephoneOrganisation }}</span>
                    </div>
                </div>
            </div>

            <!-- Formulaire dynamique -->
            <FormulaireDynamique
                ref="formRef"
                title=""
                description=""
                :fields="formFields"
                :show-header="false"
                :show-cancel-button="false"
                submit-label=""
                :loading="loading"
                @submit="onFormSubmit"
                @change="(data) => localFormData = data"
            />

            <!-- Résumé -->
            <div v-if="localFormData?.monthlyPrice && localFormData?.durationMonths" class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-medium text-noir mb-2">Résumé de l'activation</h4>
                <ul class="text-sm text-gray-700 space-y-1">
                    <li class="flex justify-between">
                        <span>Prix mensuel:</span>
                        <span class="font-medium">{{ formatPrice(localFormData.monthlyPrice) }}</span>
                    </li>
                    <li class="flex justify-between">
                        <span>Durée:</span>
                        <span class="font-medium">{{ getDurationLabel(localFormData.durationMonths) }}</span>
                    </li>
                    <li class="flex justify-between">
                        <span>Date de fin:</span>
                        <span class="font-medium">{{ formatEndDate(localFormData.durationMonths) }}</span>
                    </li>
                </ul>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end w-full gap-3">
                <AppButton 
                    variant="outline" 
                    label="Annuler" 
                    @click="handleClose"
                    :disabled="loading"
                    class="w-full sm:w-auto"
                />
                <AppButton 
                    variant="primary" 
                    :label="isRenewal ? 'Renouveler' : 'Activer l\'abonnement'"
                    :loading="loading"
                    :disabled="!isFormValid"
                    @click="handleSubmit"
                    class="w-full sm:w-auto"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Dialog from 'primevue/dialog';
import AppButton from '~/components/button/AppButton.vue';
import FormulaireDynamique from '~/components/form/FormulaireDynamique.vue';
import type { Organization } from '~/composables/api/useOrganizationApi';

interface Props {
    organization: Organization | null;
    isRenewal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isRenewal: false,
});

const emit = defineEmits<{
    'close': [];
    'submit': [data: { monthlyPrice: number; durationMonths: number; notes?: string }];
}>();

const visible = defineModel<boolean>('visible', { default: false });
const loading = defineModel<boolean>('loading', { default: false });

const formRef = ref<InstanceType<typeof FormulaireDynamique> | null>(null);
const localFormData = ref<any>(null);

// Options de durée (en mois)
const durationOptions = [
    { label: '1 mois', value: 1 },
    { label: '2 mois', value: 2 },
    { label: '3 mois', value: 3 },
    { label: '6 mois', value: 6 },
    { label: '12 mois (1 an)', value: 12 },
];

// Champs du formulaire dynamique
const formFields = computed(() => [
    {
        name: 'monthlyPrice',
        label: 'Prix mensuel',
        type: 'number' as const,
        placeholder: 'Ex: 50',
        required: true,
        min: 0,
        value: props.organization?.monthlyPrice || undefined,
    },
    {
        name: 'durationMonths',
        label: 'Durée de l\'abonnement',
        type: 'select' as const,
        placeholder: 'Sélectionner une durée',
        required: true,
        options: durationOptions,
        optionLabel: 'label',
        optionValue: 'value',
        value: 1,
    },
    {
        name: 'notes',
        label: 'Notes (optionnel)',
        type: 'textarea' as const,
        placeholder: 'Notes sur l\'abonnement, conditions négociées, etc.',
        required: false,
    },
]);

// Computed
const dialogTitle = computed(() => {
    return props.isRenewal ? 'Renouveler l\'abonnement' : 'Activer l\'abonnement';
});

const isFormValid = computed(() => {
    if (!localFormData.value) return false;
    return localFormData.value.monthlyPrice !== null && 
           localFormData.value.monthlyPrice > 0 && 
           localFormData.value.durationMonths > 0;
});

// Reset form when dialog closes
watch(visible, (newVal) => {
    if (!newVal && formRef.value) {
        formRef.value.resetForm();
    }
});

// Helpers
const getDurationLabel = (months: number): string => {
    const option = durationOptions.find(o => o.value === months);
    return option?.label || `${months} mois`;
};

const formatEndDate = (months: number): string => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    return endDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: props.organization?.currency || 'KMF',
        maximumFractionDigits: 0,
    }).format(price);
};

// Handlers
const handleClose = () => {
    visible.value = false;
    emit('close');
};

const onFormSubmit = (data: Record<string, any>) => {
    emit('submit', {
        monthlyPrice: data.monthlyPrice,
        durationMonths: data.durationMonths,
        notes: data.notes || undefined,
    });
};

const handleSubmit = () => {
    if (!isFormValid.value || !formRef.value) return;

    const formData = formRef.value.formData;
    emit('submit', {
        monthlyPrice: formData.monthlyPrice,
        durationMonths: formData.durationMonths,
        notes: formData.notes || undefined,
    });
};
</script>

<style scoped>
/* Masquer les boutons du formulaire dynamique car on a nos propres boutons dans le footer */
:deep(.flex.justify-end.gap-4.pt-6.border-t.border-gray-200) {
    display: none;
}

/* Retirer le padding et la bordure du conteneur du formulaire puisqu'on est déjà dans un dialog */
:deep(.bg-white.border-2.border-gris\/40.rounded-xl.p-8) {
    background: transparent;
    border: none;
    padding: 0;
}
</style>
