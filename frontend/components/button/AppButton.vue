<template>
  <button
    :type="type"
    :disabled="disabled || loading || downloading"
    :class="buttonClasses"
    @click="handleClick"
    class="relative overflow-hidden"
  >
    <!-- Contenu normal ou En cours -->
    <div class="flex items-center justify-center gap-2 relative z-10">
      <!-- Icône de chargement (gauche) - seulement si loading standard -->
      <span v-if="loading">
        <i class="pi pi-spinner pi-spin" :class="iconSizeClass"></i>
      </span>

      <!-- Icône à gauche - affichée si pas loading, ou si downloading (l'icône reste) -->
      <i 
        v-else-if="leftIcon" 
        :class="[getIconClass(leftIcon), iconSizeClass]"
      ></i>

      <!-- Contenu du bouton (texte ou slot) -->
      <span v-if="downloading" :class="{ 'mx-2': iconLeft || icon || iconRight }">
        Veuillez patienter...
      </span>
      <span v-else-if="label" :class="{ 'mx-2': iconLeft || icon || iconRight || loading }">
        {{ label }}
      </span>
      <slot v-else :class="{ 'mx-2': iconLeft || icon || iconRight || loading }" />

      <!-- Icône à droite -->
      <i 
        v-if="iconRight && !loading" 
        :class="[getIconClass(iconRight), iconSizeClass]"
      ></i>
    </div>

    <!-- Barre de progression (en bas) -->
    <div v-if="downloading" class="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
      <ProgressBar 
        :value="progress" 
        :showValue="false" 
        class="h-1" 
        :pt="{ 
          root: { class: 'h-1 bg-transparent rounded-none' }, 
          value: { class: 'bg-primary transition-all duration-200 ease-in-out' } 
        }" 
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from 'primevue/progressbar';

interface Props {
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: string; // Alias pour iconLeft
  iconLeft?: string;
  iconRight?: string;
  loading?: boolean;
  downloading?: boolean;
  progress?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  tooltip?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'sm',
  loading: false,
  downloading: false,
  progress: 0,
  disabled: false,
  fullWidth: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled && !props.downloading) {
    emit('click', event);
  }
};

// Icône à gauche (priorité : iconLeft > icon)
const leftIcon = computed(() => props.iconLeft || props.icon);

// Classes pour le bouton
const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-semibold',
    props.rounded ? 'rounded-full' : 'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ];

  // Largeur
  if (props.fullWidth) {
    baseClasses.push('w-full');
  }

  // Taille
  const sizeClasses = {
    sm: 'px-3 py-3 tracking-wide text-sm',
    md: 'px-4 py-3 tracking-wide text-base',
    lg: 'px-6 py-4 tracking-wide text-lg',
  };
  baseClasses.push(sizeClasses[props.size]);

  // Variante - toujours appliquer les classes de couleur
  const variantClasses = {
    primary: [
      'bg-primary',
      'text-white',
      'border-2',
      'border-primary/20',
      'hover:bg-primary/90',
      'shadow-3d-primary',
      // 'focus:ring-primary',
    ],
    secondary: [
      'bg-white',
      'text-noir',
      'border-2',
      'border-gris/50',
      'hover:bg-gris/50',
      'focus:ring-gris',
      'shadow-3d-secondary',
    ],
    outline: [
      'bg-transparent',
      'text-noir',
      'border-2',
      'border-gris/50',
      'shadow-3d-outline',
      // 'hover:bg-primary',
      // 'hover:text-white',
      // 'focus:ring-primary',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'border-2',
      'border-red-700/20',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'shadow-3d-danger',
    ],
    success: [
      'bg-vert',
      'text-white',
      'border-2',
      'border-vert/20',
      'hover:bg-vert/90',
      'focus:ring-vert',
      'shadow-3d-success',
    ],
  };
  baseClasses.push(...variantClasses[props.variant]);

  // État disabled/loading/downloading - juste changer l'opacité et le curseur
  if (props.disabled || props.loading || props.downloading) {
    baseClasses.push('opacity-70', 'cursor-not-allowed', 'pointer-events-none');
  }

  return baseClasses.join(' ');
});

// Classes pour les icônes
const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };
  return sizes[props.size];
});

// Retourner l'icône PrimeVue telle quelle
const getIconClass = (iconName: string): string => {
  return iconName;
};
</script>

<style scoped>
/* Styles additionnels si nécessaire */
button {
  -webkit-tap-highlight-color: transparent;
}

/* Effet 3D pour les boutons primaires */
.shadow-3d-primary {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

.shadow-3d-primary:hover {
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.15),
    0 3px 5px -1px rgba(0, 0, 0, 0.08),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.shadow-3d-primary:active {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

/* Effet 3D pour les boutons secondary */
.shadow-3d-secondary {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.08),
    0 2px 4px -1px rgba(0, 0, 0, 0.04),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.shadow-3d-secondary:hover {
  box-shadow: 
    0 6px 8px -1px rgba(0, 0, 0, 0.12),
    0 3px 5px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.35);
}

.shadow-3d-secondary:active {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

/* Effet 3D pour les boutons danger */
.shadow-3d-danger {
  box-shadow: 
    0 4px 6px -1px rgba(220, 38, 38, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

.shadow-3d-danger:hover {
  box-shadow: 
    0 6px 8px -1px rgba(220, 38, 38, 0.3),
    0 3px 5px -1px rgba(0, 0, 0, 0.08),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.shadow-3d-danger:active {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

/* Effet 3D pour les boutons success */
.shadow-3d-success {
  box-shadow: 
    0 4px 6px -1px rgba(34, 197, 94, 0.2),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 4px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

.shadow-3d-success:hover {
  box-shadow: 
    0 6px 8px -1px rgba(34, 197, 94, 0.3),
    0 3px 5px -1px rgba(0, 0, 0, 0.08),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.shadow-3d-success:active {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

/* Effet 3D pour les boutons outline */
.shadow-3d-outline {
  box-shadow: 
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 1px 2px -1px rgba(0, 0, 0, 0.04),
    inset 0 -1px 2px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.shadow-3d-outline:hover {
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 -2px 3px rgba(0, 0, 0, 0.08),
    inset 0 2px 3px rgba(255, 255, 255, 0.6);
}

.shadow-3d-outline:active {
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -1px 2px rgba(255, 255, 255, 0.2);
}
</style>
