<template>
  <div class="bg-[#064654] rounded-xl p-8 md:py-5 md:px-10 relative overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/5">
    <!-- Éléments décoratifs Premium -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
    
    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
      <div class="space-y-4">
        <!-- Back button -->
        <div v-if="backUrl">
            <NuxtLink :to="backUrl" class="inline-flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 group">
                <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all border border-white/10">
                    <Icon icon="tabler:arrow-left" class="text-sm" />
                </div>
                <span class="text-xs font-bold uppercase tracking-widest">Retour</span>
            </NuxtLink>
        </div>

        <div class="space-y-2">
            <h1 class="text-2xl md:text-3xl font-black text-white tracking-wider leading-tight">
                {{ title }}
            </h1>
            <p v-if="description" class="text-white/80 text-xs md:text-sm max-w-2xl leading-relaxed">
                {{ description }}
            </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  title: string;
  description?: string;
  backUrl?: string;
}

defineProps<Props>();
</script>
