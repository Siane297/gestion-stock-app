<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

    <!-- Bénéfice (Marge) -->
    <CardStat 
      label="Bénéfice Net (Est.)"
      :value="formatPrice(stats?.beneficeTotal || 0)"
      icon="tabler:trending-up"
      variant="success"
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
