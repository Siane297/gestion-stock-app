<template>
  <div class="bg-side2 text-white p-4 rounded-xl mb-4 flex items-center justify-between shadow-lg">
    <div class="flex items-center gap-4">
      <div
        class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold border-2 border-white/30">
        {{ userInitial }}
      </div>
      <div>
        <h2 class="font-bold text-lg">{{ userName }}</h2>
        <div class="flex items-center gap-2 text-white/70 text-sm">
          <i class="pi pi-id-card"></i>
          <span>{{ userRole }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <button v-if="!isAdmin" @click="$emit('lock')"
        class="p-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2 border border-white/10"
        title="Verrouiller">
        <i class="pi pi-lock"></i>
        <span class="hidden md:inline">Verrouiller</span>
      </button>
      <button @click="$emit('logout')"
        class="p-2 px-4 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-all flex items-center gap-2 border border-red-400/30"
        title="Fermer la session">
        <i class="pi pi-power-off"></i>
        <span class="hidden md:inline">Clôturer</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSecureAuth } from '~/composables/useSecureAuth';
import { formatRole } from '~/composables/api/useUserApi'; // Import partagé

const { user } = useSecureAuth();

defineEmits<{
  (e: 'lock'): void;
  (e: 'logout'): void;
}>();

// Vérifier si l'utilisateur est Admin
const isAdmin = computed(() => {
  const role = user.value?.role;
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
});

// Infos utilisateur
const userName = computed(() => {
  if (user.value?.employee?.fullName) return user.value.employee.fullName;
  return user.value?.email?.split('@')[0] || 'Utilisateur';
});

// roleLabels supprimé, utilisation de formatRole
// const roleLabels = ...

const userRole = computed(() => {
  const role = user.value?.role;
  // Si un poste est défini sur l'employé, on l'utilise, sinon on traduit le rôle technique
  return user.value?.employee?.position?.name || (role ? formatRole(role) : 'Vendeur') || role;
});

const userInitial = computed(() => {
  const name = userName.value;
  return name ? name.charAt(0).toUpperCase() : 'U';
});
</script>
