<template>
  <div class="container p-6 space-y-8">
    <h1 class="text-3xl font-bold mb-6">Test des Skeletons</h1>
    
    <!-- Toggle Button -->
    <div class="mb-6">
      <AppButton 
        :label="isLoading ? 'Arrêter le Loading' : 'Démarrer le Loading'" 
        :variant="isLoading ? 'danger' : 'primary'"
        @click="toggleLoading" 
      />
    </div>

    <!-- Cards Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">Cards</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardStat 
          icon="lucide:users" 
          :value="42" 
          label="Total Employés" 
          variant="primary" 
          :loading="isLoading" 
        />
        <PointageCard 
          title="Entrée" 
          description="Scanner le QR code pour enregistrer une entrée" 
          icon="mdi:login"
          variant="success" 
          route="/pointage/entree"
          :loading="isLoading"
        />
      </div>
    </section>

    <!-- Charts Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">Charts</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedAreaChart :loading="isLoading" />
        <RadialChart :loading="isLoading" />
      </div>
      
      <div class="grid grid-cols-1 gap-6">
        <WeeklyAttendanceChart type="ENTREE" :loading="isLoading" />
      </div>
    </section>

    <!-- Tables Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">Tables</h2>
      <TableSkeleton :columns="6" :rows="8" />
    </section>

    <!-- Forms Test supprimé -->
    <!-- Skeleton des formulaires supprimé -->

    <!-- Headers Test -->
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold">Headers</h2>
      <HeaderSkeleton />
      <BannerSkeleton />
    </section>
  </div>
</template>

<script setup lang="ts">
import AppButton from "~/components/button/AppButton.vue";
import CardStat from "~/components/card/CardStat.vue";
import PointageCard from "~/components/card/PointageCard.vue";
import StackedAreaChart from "~/components/chart/StackedAreaChart.vue";
import RadialChart from "~/components/chart/RadialChart.vue";
import WeeklyAttendanceChart from "~/components/chart/WeeklyAttendanceChart.vue";
import TableSkeleton from "~/components/skeleton/TableSkeleton.vue";
import HeaderSkeleton from "~/components/skeleton/HeaderSkeleton.vue";
import BannerSkeleton from "~/components/skeleton/BannerSkeleton.vue";

const isLoading = ref(false);

const toggleLoading = () => {
  isLoading.value = !isLoading.value;
};
</script>
