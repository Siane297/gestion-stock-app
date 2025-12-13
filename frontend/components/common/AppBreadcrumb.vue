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
        if (part) { // Validate part is not empty
             currentPath += `/${part}`;
             
             // Simple capitalization for label
             // You might want a better mapping logic for complex route names
             const label = part.charAt(0).toUpperCase() + part.slice(1);

             // Don't make the last item clickable if you prefer, or do.
             // Here we make all clickable. 
             // Logic: If it's the last item, maybe no route? 
             // Usually breadcrumbs link to parent levels. The current page is just label.
             
             const isLast = i === parts.length - 1;
             
             breadcrumbs.push({
                 label: label,
                 route: isLast ? null : currentPath // Last item usually not a link or links to self (which is fine)
             });
        }
    }
    
    items.value = breadcrumbs;
};

// Update breadcrumbs on route change
watch(() => route.path, () => {
    generateBreadcrumbs();
}, { immediate: true });

onMounted(() => {
    generateBreadcrumbs();
});

</script>
