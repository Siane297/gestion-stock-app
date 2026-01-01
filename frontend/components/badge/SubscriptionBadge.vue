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
        classes: 'bg-[#3B82F6] text-white',
    },
    ACTIVE: {
        label: 'Actif',
        icon: 'lucide:check-circle',
        classes: 'bg-[#22C55E] text-white',
    },
    EXPIRED: {
        label: 'Expiré',
        icon: 'lucide:alert-circle',
        classes: 'bg-[#F59E0B] text-white',
    },
    BLOCKED: {
        label: 'Bloqué',
        icon: 'lucide:ban',
        classes: 'bg-[#EF4444] text-white',
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
