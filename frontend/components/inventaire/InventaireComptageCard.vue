<template>
  <div 
    class="bg-white border-2 rounded-xl p-4 transition-all duration-200"
    :class="detail.est_compte ? 'border-green-300 bg-green-50/30' : 'border-gris/40'"
  >
    <div class="flex flex-col gap-3">
      <!-- Info produit + Théorique -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Image produit -->
          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              v-if="detail.produit?.image_url" 
              :src="detail.produit.image_url" 
              :alt="detail.produit?.nom"
              class="w-full h-full object-cover"
            />
            <i v-else class="pi pi-box text-gray-400 text-lg"></i>
          </div>
          
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-800 text-sm truncate leading-tight">{{ detail.produit?.nom }}</h3>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span v-if="detail.produit?.code_barre" class="truncate font-mono">{{ detail.produit.code_barre }}</span>
              <span v-if="detail.lot" class="truncate text-[10px] px-1 py-0.5 bg-gray-100 rounded">L: {{ detail.lot.numero_lot }}</span>
            </div>
          </div>
        </div>

        <!-- Quantité théorique -->
        <div class="flex flex-col flex-shrink-0">
          <span class="text-[10px] uppercase tracking-wider font-bold text-primary">Théorique</span>
          <div class="flex items-baseline gap-1">
            <span class="text-base font-bold text-gray-700 leading-none">{{ detail.quantite_theorique }}</span>
            <span class="text-[10px] text-gray-400 truncate">{{ detail.produit?.unite?.nom || 'u.' }}</span>
          </div>
        </div>
      </div>

      <!-- Ligne quantités et actions -->
      <div class="flex items-end justify-between gap-3 pt-3 border-t border-gray-100">
        <!-- Section Saisie (Compté) -->
        <div class="flex-1 min-w-[120px]">
          <div class="flex flex-col">
            <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Compté</span>
            <div class="flex items-center gap-1.5">
              <InputNumber
                v-model="modelValue"
                :min="0"
                :useGrouping="false"
                class="comptage-input flex-1"
                :input-class="['w-full text-center font-bold text-sm h-9', detail.est_compte ? 'text-green-700 bg-green-50 border-green-200' : '']"
                fluid
                @update:model-value="$emit('change', detail)"
              />
              <AppButton
                icon="pi pi-check"
                :variant="detail.est_compte ? 'success' : 'primary'"
                class="save-btn"
                @click="$emit('save', detail)"
                :loading="loading"
              />
            </div>
          </div>
        </div>

        <!-- Écart (si compté) -->
        <div v-if="detail.est_compte" class="flex flex-col items-end min-w-[50px]">
          <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400">Écart</span>
          <span 
            class="text-base font-black"
            :class="{
              'text-green-600': (detail.ecart || 0) > 0,
              'text-red-600': (detail.ecart || 0) < 0,
              'text-gray-500': detail.ecart === 0
            }"
          >
            {{ detail.ecart !== null && detail.ecart !== undefined ? (detail.ecart > 0 ? '+' : '') + detail.ecart : '-' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InputNumber from 'primevue/inputnumber';
import AppButton from '~/components/button/AppButton.vue';
import type { InventaireDetail } from '~/composables/api/useInventaireApi';

interface Props {
  detail: InventaireDetail;
  modelValue: number | null | undefined;
  loading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'save', 'change']);

const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.comptage-input :deep(.p-inputnumber-input) {
  @apply rounded-lg border-2 border-gris/40 focus:border-primary transition-colors p-1;
}

/* .save-btn {
  @apply w-9 h-9 p-0 flex items-center justify-center rounded-lg shadow-sm flex-shrink-0;
} */

.save-btn :deep(.p-button-icon) {
  @apply text-sm;
}

/* Éviter le débordement sur mobile */
@media (max-width: 640px) {
  .comptage-input {
    @apply w-16;
  }
}
</style>
