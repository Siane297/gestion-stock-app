<template>
  <div class="badge-preview-container">
    <div class="transform scale-[0.35] origin-top">
      <EmployeeBadge
        :employee-name="employeeData.fullName"
        :employee-position="employeeData.position"
        :employee-matricule="employeeData.matricule"
        :employee-department="employeeData.department || 'Non spécifié'"
        :employee-photo="employeeData.photo"
        :qr-code-url="employeeData.qrCode"
        :company-name="companyName"
        :company-logo="companyLogo"
        :background-color="backgroundColor"
        :text-color="textColor"
        :border-color="borderColor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmployeeBadge from '~/components/badge/EmployeeBadge.vue';

interface EmployeeData {
  fullName: string;
  position: string;
  matricule: string;
  department?: string;
  photo?: string;
  qrCode: string;
}

interface Props {
  employeeData: EmployeeData;
  companyName?: string;
  companyLogo?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  companyName: 'Badge Employé',
  backgroundColor: '#2B48D1',
  textColor: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.6)',
});
</script>

<style scoped>
.badge-preview-container {
  width: 100%;
  height: 320px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style>
