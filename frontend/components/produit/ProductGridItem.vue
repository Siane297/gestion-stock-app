<template>
    <div
        class="bg-white rounded-2xl border-2 border-gris/40 p-4 hover:shadow-sm shadow-primary/20 transition-shadow relative group">
        <!-- Header: Image & Badges -->
        <div class="flex flex-col items-start gap-3 mb-3">
            <div
                class="w-full h-28 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="produit.image_url" :src="getFullImageUrl(produit.image_url)" :alt="produit.nom"
                    class="w-full h-full object-cover" />
                <i v-else class="pi pi-image text-3xl text-gray-400"></i>
            </div>
            <div class="flex-1 min-w-0 w-full text-left">
                <div class="flex items-start justify-between">
                    <h3 class="font-bold text-gray-800 text-sm leading-tight line-clamp-2 w-full" :title="produit.nom">
                        {{ produit.nom }}
                    </h3>

                </div>
                <p class="text-[11px] sm:text-xs text-primary font-medium mt-1 truncate"> <span class="font-bold text-noir">Catégorie : </span> {{ produit.categorie?.nom || 'Sans catégorie' }}</p>
            </div>
        </div>

        <!-- Details -->
        <div class="flex items-center justify-between pt-3 border-t border-gris/70 mt-1">
            <Badge :value="produit.unite?.nom || 'Unité'"  severity="info"
                class="!font-medium !bg-primary !text-[10px]" />
            <button @click="toggleMenu"
                class="p-1.5 hover:bg-bleu/60 text-gray-400 hover:text-gray-600 rounded-lg transition-colors flex-shrink-0">
                <i class="pi pi-ellipsis-v"></i>
            </button>
        </div>

        <!-- Action Menu (Overlay) -->
        <Menu ref="menu" :model="menuItems" :popup="true" class="!min-w-[140px]" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Tag from 'primevue/tag';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import type { Produit } from '~/composables/api/useProduitApi';

const props = defineProps<{
    produit: Produit;
    serverUrl?: string; // Optional if we want to pass it
    canEdit?: boolean;
    canDelete?: boolean;
}>();

const emit = defineEmits<{
    view: [produit: Produit];
    edit: [produit: Produit];
    delete: [produit: Produit];
}>();

const menu = ref();

const getFullImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const base = props.serverUrl || '';
    return `${base}${path}`;
};


const menuItems = computed(() => {
    const items: MenuItem[] = [
        {
            label: 'Détails',
            icon: 'pi pi-eye',
            command: () => emit('view', props.produit)
        }
    ];

    if (props.canEdit) {
        items.push({
            label: 'Modifier',
            icon: 'pi pi-pencil',
            command: () => emit('edit', props.produit)
        });
    }

    if (props.canDelete) {
        items.push({
            label: 'Supprimer',
            icon: 'pi pi-trash',
            styleClass: 'text-red-500',
            command: () => emit('delete', props.produit)
        });
    }

    return items;
});

const toggleMenu = (event: Event) => {
    menu.value.toggle(event);
};
</script>
