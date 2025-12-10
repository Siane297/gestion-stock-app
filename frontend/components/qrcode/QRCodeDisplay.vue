<template>
  <div class="space-y-6 ">
    <!-- Icône de succès -->
    <div class="flex justify-center">
      <div
        class="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center"
      >
        <Icon icon="lucide:badge-check" class="text-4xl text-emerald-600" />
      </div>
    </div>

    <!-- Titre -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-noir mb-2">Enregistrement réussi !</h2>
      <p class="text-gray-600">
        Le badge de l'employé a été généré avec succès
      </p>
    </div>

    <!-- Badge Employé -->
    <div class="flex justify-center">
      <div ref="badgeRef">
        <EmployeeBadge
          :employee-name="employeeName || 'Employé'"
          :employee-position="employeePosition || 'Employé'"
          :employee-matricule="employeeMatricule || 'N/A'"
          :employee-department="employeeDepartment || 'Non spécifié'"
          :employee-photo="employeePhoto"
          :qr-code-url="qrCode || ''"
          :company-name="displayCompanyName"
          :company-logo="displayCompanyLogo"
          :background-color="backgroundColor"
          :text-color="textColor"
          :border-color="borderColor"
        />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import EmployeeBadge from "~/components/badge/EmployeeBadge.vue";

interface Props {
  qrCode?: string;
  employeeName?: string;
  employeeMatricule?: string;
  employeePosition?: string;
  employeeDepartment?: string;
  employeePhoto?: string;
  companyName?: string;
  companyLogo?: string;
  // Couleurs personnalisables
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  employeePosition: 'Employé',
  employeeDepartment: 'Non spécifié'
});

const badgeRef = ref<HTMLElement | null>(null);

// Exposer la référence du badge pour le parent
defineExpose({
  badgeRef
});

// Utiliser les props ou des valeurs par défaut
const displayCompanyName = computed(() => props.companyName || '');
const displayCompanyLogo = computed(() => props.companyLogo || '');
</script>
