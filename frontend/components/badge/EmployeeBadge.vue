<template>
  <div class="employee-badge relative overflow-hidden">

    <!-- Fond bleu -->
    <div class=" absolute inset-0 z-0" :style="{ backgroundColor: backgroundColor }"></div>

    <!-- Pattern abstrait avec logo ou nom de la compagnie -->
    <div class="absolute inset-0 z-[1] overflow-hidden opacity-5 flex items-center justify-center">
      <div class="watermark-pattern flex flex-wrap items-center justify-center gap-8 -rotate-12 scale-150">
        <template v-for="i in 35" :key="i">
          <img v-if="companyLogo" :src="companyLogo" :alt="companyName" class=" w-36 h-auto object-contain" />
          <span v-else class="text-[60px] font-bold uppercase whitespace-nowrap" :style="{ color: textColor }">
            {{ companyName || 'BADGE' }}
          </span>
        </template>
      </div>
    </div>

    <!-- Bordure rectangle en haut à droite -->
    <div class="glass-corner top-right" :style="{ borderColor: borderColor }"></div>

    <!-- Bordure rectangle en bas à gauche -->
    <div class="glass-corner bottom-left" :style="{ borderColor: borderColor }"></div>

    <!-- Contenu -->
    <div class="relative z-10 justify-center gap-8 h-full flex flex-col p-10">
      <!-- En-tête : Logo ou Nom de la compagnie -->
      <div class=" text-center mb-5">
        <!-- Version avec logo -->
        <div v-if="companyLogo" class="logo-section">
          <img :src="companyLogo" :alt="companyName || 'Logo entreprise'" class="company-logo" />
          <!-- Subtitle sous le logo si fourni -->
          <p v-if="companySubtitle" class="company-subtitle" :style="{ color: textColor }">
            {{ companySubtitle }}
          </p>
        </div>

        <!-- Version sans logo : seulement le nom -->
        <h1 v-else class="font-bold tracking-wide text-4xl uppercase" :style="{ color: textColor }">
          {{ companyName || 'BADGE EMPLOYE' }}
        </h1>
      </div>

      <!-- div info employ -->
      <div class="mb-4 px-5 py-7 border-t-2 border-b-2 border-dashed" :style="{ color: textColor, borderColor: textColor }">
        <!-- Section principale : Avatar + Informations -->
        <div class="flex items-center justify-between">
          <!-- Avatar à gauche : Photo ou icône par défaut -->
          <img v-if="employeePhoto" :src="employeePhoto" alt="Photo employé" class="w-[150px] h-auto object-cover rounded-lg" :style="{ borderColor: textColor }" />
          <div v-else class="w-[130px] h-auto border-2 rounded-lg flex items-center justify-center" :style="{ color: textColor, borderColor: textColor }">
            <Icon icon="lucide:circle-user-round" class="w-[130px] h-auto" :style="{ color: textColor }" />
          </div>
          <!-- Informations à droite -->
          <div class=" flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">EMPLOYÉ :</span>
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">{{ employeeName }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">POSTE :</span>
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">{{ employeePosition }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">DEPARTEMENT :</span>
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">{{ employeeDepartment }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">MATRICULE :</span>
              <span class="font-bold tracking-wide uppercase" :style="{ color: textColor }">{{ employeeMatricule }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- QR Code -->
      <div class="flex items-center justify-center">
        <div class=" bg-white border-2 border-dashed rounded-2xl inline-block p-5">
          <img :src="qrCodeUrl" alt="QR Code employé" class="qr-code" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
interface Props {
  employeeName: string;
  employeePosition: string;
  employeeMatricule: string;
  employeeDepartment: string;
  employeePhoto?: string;
  qrCodeUrl: string;
  companyName?: string;
  companyLogo?: string; // URL du logo de la compagnie
  companySubtitle?: string; // Subtitle affiché sous le logo (ex: Southern Investment Corporation (SIC))
  // Couleurs personnalisables
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: '#2B48D1',
  textColor: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.6)',
});
</script>

<style scoped>
.employee-badge {
  /* Dimensions fixes pour le téléchargement */
  width: 600px;
  max-width: 100%;
  height: 900px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}


/* Fond bleu */
.badge-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Bordures rectangulaires aux coins */
.glass-corner {
  position: absolute;
  background: transparent;
  border: 45px solid;
  z-index: 0;
  opacity: 0.5;
}

/* Bordure en haut à droite */
.glass-corner.top-right {
  top: 0;
  right: 0;
  width: 250px;
  height: 200px;
  border-bottom-left-radius: 90px;
  border-top: none;
  border-right: none;
}

/* Bordure en bas à gauche */
.glass-corner.bottom-left {
  bottom: 0;
  left: 0;
  width: 250px;
  height: 200px;
  border-top-right-radius: 90px;
  border-bottom: none;
  border-left: none;
}



/* En-tête (Logo ou Nom de compagnie) */
.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.company-logo {
  height: 150px;
  max-height: 150px;
  width: auto;
  object-fit: contain;
}

/* Photo de l'employé */
.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 130px;
  height: 130px;
  background: rgba(255, 255, 255, 0.1);
}

.employee-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.company-subtitle {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

.company-name {
  font-size: 42px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

/* Ligne de séparation pointillée */

/* Section principale (Avatar + Infos) */
.main-section {
  display: flex;
  gap: 25px;
  align-items: flex-start;
  margin: 20px 0;
}

/* Conteneur de l'avatar */
.avatar-container {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border: 3px solid;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.avatar-icon {
  width: 80px;
  height: 80px;
  stroke-width: 2;
}

/* Conteneur des informations */
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.95;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  margin-left: 0;
}

/* Section QR Code */
.qr-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.qr-container {
  background: white;
  padding: 16px;
  border-radius: 16px;
  display: inline-block;
}

.qr-code {
  width: 280px;
  height: 280px;
  display: block;
}

/* Style pour l'impression/téléchargement */
@media print {
  .employee-badge {
    border: 2px solid #e5e7eb;
  }
}
</style>
