<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Chiffre d'Affaires -->
    <CardStat 
      label="Chiffre d'Affaires"
      :value="formatPrice(stats?.montantTotal || 0)"
      icon="tabler:currency-dollar"
      variant="primary"
      :loading="loading"
    />

    <!-- Nombre de Ventes -->
    <CardStat 
      label="Nombre de Ventes"
      :value="stats?.totalVentes || 0"
      icon="tabler:shopping-cart"
      variant="info"
      :loading="loading"
    />

    <!-- Panier Moyen -->
    <CardStat 
      label="Panier Moyen"
      :value="formatPrice(stats?.venteMoyenne || 0)"
      icon="tabler:chart-bar"
      variant="warning"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import CardStat from '~/components/card/CardStat.vue';
import type { VenteStats } from '~/composables/api/useVenteApi';
import { useCurrency } from '~/composables/useCurrency';

defineProps<{
  stats: VenteStats | null;
  loading?: boolean;
}>();

const { formatPrice } = useCurrency();
</script>
