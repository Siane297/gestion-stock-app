<template>
    <span :class="badgeClasses">
        <Icon v-if="showIcon" :icon="badgeIcon" class="text-sm" />
        {{ badgeLabel }}
    </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { SubscriptionStatus } from '~/composables/api/useOrganizationApi';

interface Props {
    status?: SubscriptionStatus | null;
    showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showIcon: true,
});

const badgeConfig = {
    TRIAL: {
        label: 'Essai',
        icon: 'lucide:clock',
        classes: 'bg-blue-100 text-blue-700',
    },
    ACTIVE: {
        label: 'Actif',
        icon: 'lucide:check-circle',
        classes: 'bg-green-100 text-green-700',
    },
    EXPIRED: {
        label: 'Expiré',
        icon: 'lucide:alert-circle',
        classes: 'bg-orange-100 text-orange-700',
    },
    BLOCKED: {
        label: 'Bloqué',
        icon: 'lucide:ban',
        classes: 'bg-red-100 text-red-700',
    },
};

const badgeClasses = computed(() => {
    const config = props.status ? badgeConfig[props.status] : null;
    return [
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        config?.classes || 'bg-gray-100 text-gray-600',
    ];
});

const badgeLabel = computed(() => {
    return props.status ? badgeConfig[props.status]?.label || 'Inconnu' : 'Inconnu';
});

const badgeIcon = computed(() => {
    return props.status ? badgeConfig[props.status]?.icon || 'lucide:help-circle' : 'lucide:help-circle';
});
</script>
