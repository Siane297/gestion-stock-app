<template>
  <div class="mb-4">
    <Breadcrumb :home="home" :model="items" class="!bg-white !rounded-lg !border-2 !border-gris/40 !px-4 !py-3 !text-sm ">
        <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href="href" v-bind="props.action" @click="navigate" class="flex items-center">
                    <span :class="[item.icon, 'text-color']" />
                    <span class="text-primary font-semibold text-sm">{{ item.label }}</span>
                </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action" class="flex items-center">
                <span class="text-surface-500 dark:text-surface-400 text-sm">{{ item.label }}</span>
            </a>
        </template>
    </Breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// Global state for page title override (can be set by pages)
const pageTitleOverride = useState<string | null>('pageTitleOverride', () => null);

const home = ref({
    icon: 'pi pi-home',
    route: '/accueil'
});

const items = ref<any[]>([]);

const generateBreadcrumbs = () => {
    const path = route.path;
    if (path === '/' || path === '/accueil') {
        items.value = [];
        return;
    }

    const simplePath = path.substring(1); // Remove leading slash
    const parts = simplePath.split('/');
    
    let currentPath = '';
    const breadcrumbs = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part) { 
             currentPath += `/${part}`;
             
             const isLast = i === parts.length - 1;
             
             let label = part.charAt(0).toUpperCase() + part.slice(1);
             
             // If it's the last item and we have an override, use it!
             if (isLast && pageTitleOverride.value) {
                 label = pageTitleOverride.value;
             } else if (part.length > 20) {
                 // Simple heuristic: if it looks like a UUID/long ID, shorten it or show generic
                 // But since we can't guess the name easily without context, we rely on override.
                 // Fallback if no override but looks like ID:
                 label = 'Détails'; 
             }

             breadcrumbs.push({
                 label: label,
                 route: isLast ? null : currentPath 
             });
        }
    }
    
    items.value = breadcrumbs;
};

// Update breadcrumbs on route or override change
watch([() => route.path, pageTitleOverride], () => {
    generateBreadcrumbs();
}, { immediate: true });

onMounted(() => {
    generateBreadcrumbs();
});

</script>
