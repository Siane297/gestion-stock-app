<template>
  <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <!-- Background decoration
    <div class="absolute top-0 right-0 w-24 h-24 bg-green-50 -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-110"></div> -->
    
    <div class="relative z-10 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <Icon icon="tabler:cash-register" class="text-xl" />
          </div>
          <div>
            <h3 class="font-bold text-gray-800">{{ session.caisse?.nom }}</h3>
            <p class="text-xs text-gray-500">{{ session.caisse?.magasin?.nom }}</p>
          </div>
        </div>
        <Badge value="Ouverte" severity="success" class="!rounded-lg" />
      </div>

      <div class="flex items-center gap-3 p-3 bg-bleu/40 rounded-2xl">
        <div class="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
          <Icon icon="tabler:user" class="text-gray-400" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-400">Responsable</span>
          <span class="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
            {{ session.utilisateur?.employee?.fullName || session.utilisateur?.email }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-2">
        <div class="flex flex-col">
          <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Depuis</span>
          <span class="text-sm font-medium text-gray-700">
            {{ formatTime(session.date_ouverture) }}
          </span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ventes</span>
          <span class="text-sm font-black text-primary">
            {{ session._count?.ventes || 0 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Badge from 'primevue/badge';
import type { SessionCaisse } from '~/composables/api/useCaisseApi';

defineProps<{
  session: SessionCaisse;
}>();

const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>
