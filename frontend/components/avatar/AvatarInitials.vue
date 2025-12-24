<template>
    <div class="flex items-center gap-3">
        <!-- Avatar avec photo ou initiales -->
        <div v-if="photo" class="avatar-photo" :class="photoSizeClasses">
            <img :src="photo" alt="Photo" :class="photoRoundingClasses" />
        </div>
        <div v-else :class="avatarClasses" :style="avatarStyle">
            {{ initials }}
        </div>

        <!-- Nom (optionnel) -->
        <div v-if="showName" class="flex flex-col items-start">
            <p :class="nameClasses">{{ name }}</p>
            <p v-if="subtitle" :class="subtitleClasses">{{ subtitle }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    name: string;
    subtitle?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showName?: boolean;
    variant?: 'circle' | 'square'; // circle = rounded-full, square = rounded-lg
    color?: string; // Couleur personnalisée (ex: '#3B82F6')
    textColor?: string; // Couleur du texte (ex: '#FFFFFF')
    shadow3d?: boolean; // Active l'effet 3D
    autoColor?: boolean; // Active la génération automatique de couleur basée sur le nom
    photo?: string; // URL de la photo de l'employé
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    showName: true,
    variant: 'circle',
    color: '', // Utilise la couleur primary par défaut si vide
    textColor: '#FFFFFF',
    shadow3d: false,
    autoColor: true, // Activé par défaut
});

// Classes de taille pour la photo
const photoSizeClasses = computed(() => {
    const sizeClasses = {
        xs: 'w-8 h-8',
        sm: 'w-9 h-9',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-14 h-14',
        '2xl': 'w-40 h-40',
    };
    return `${sizeClasses[props.size]} flex-shrink-0 overflow-hidden`;
});

// Classes d'arrondi pour la photo
const photoRoundingClasses = computed(() => {
    return `w-full h-full object-cover ${props.variant === 'square' ? 'rounded-lg' : 'rounded-full'}`;
});

// Palette de couleurs agréables (inspirée de Google)
const colorPalette = [
    { bg: '#1e88e5', text: '#ffffff' }, // Bleu
    { bg: '#43a047', text: '#ffffff' }, // Vert
    { bg: '#e53935', text: '#ffffff' }, // Rouge
    { bg: '#fb8c00', text: '#ffffff' }, // Orange
    { bg: '#8e24aa', text: '#ffffff' }, // Violet
    { bg: '#00acc1', text: '#ffffff' }, // Cyan
    { bg: '#3949ab', text: '#ffffff' }, // Indigo
    { bg: '#7cb342', text: '#ffffff' }, // Vert clair
    { bg: '#f4511e', text: '#ffffff' }, // Orange foncé
    { bg: '#6d4c41', text: '#ffffff' }, // Marron
    { bg: '#00897b', text: '#ffffff' }, // Teal
    
];

// Fonction pour générer un hash simple à partir d'une chaîne
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// Calculer la couleur automatique basée sur le nom
const getAutoColor = computed(() => {
    if (!props.autoColor || props.color) return null;

    const hash = hashString(props.name);
    const colorIndex = hash % colorPalette.length;
    return colorPalette[colorIndex];
});

// Calculer les initiales
const initials = computed(() => {
    if (!props.name) return 'U';

    const parts = props.name.split(' ').filter(p => p.length > 0);

    if (parts.length >= 2) {
        return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    }

    return (props.name[0] || 'U') + (props.name[1] || '');
});

// Classes de l'avatar selon la taille
const avatarClasses = computed(() => {
    const sizeClasses = {
        xs: 'w-8 h-8 text-xs',
        sm: 'w-9 h-9 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-14 h-14 text-xl',
        '2xl': 'w-40 h-40 text-4xl',
    };

    const roundingClass = props.variant === 'square' ? 'rounded-lg' : 'rounded-full';
    const baseClasses = `${roundingClass} flex items-center justify-center font-semibold flex-shrink-0`;

    // Ne pas ajouter bg-primary si on utilise une couleur personnalisée ou auto
    const colorClass = (props.color || getAutoColor.value) ? '' : 'bg-primary text-white';
    const shadow3dClass = props.shadow3d ? 'shadow-3d-avatar transition-all duration-200' : '';

    return `${baseClasses} ${sizeClasses[props.size]} ${colorClass} ${shadow3dClass}`;
});

// Style personnalisé pour les couleurs (manuel ou auto)
const avatarStyle = computed(() => {
    // Priorité à la couleur manuelle
    if (props.color) {
        return {
            backgroundColor: props.color,
            color: props.textColor,
        };
    }

    // Sinon, utiliser la couleur automatique si activée
    if (getAutoColor.value) {
        return {
            backgroundColor: getAutoColor.value.bg,
            color: getAutoColor.value.text,
        };
    }

    // Sinon, utiliser les classes CSS par défaut
    return {};
});

// Classes du nom
const nameClasses = computed(() => {
    const sizeClasses = {
        xs: 'tracking-wide text-xs',
        sm: 'tracking-wide text-sm',
        md: 'tracking-wide text-base',
        lg: 'tracking-wide md:text-[14px] text-[14px] lg:text-lg',
        xl: 'tracking-wide md:text-[14px] text-[14px] lg:text-xl',
        '2xl': 'tracking-wide md:text-[14px] text-[14px] lg:text-2xl',
    };

    return `font-medium text-noir ${sizeClasses[props.size]}`;
});

// Classes du sous-titre
const subtitleClasses = computed(() => {
    const sizeClasses = {
        xs: 'tracking-wide text-[10px] font-medium text-primary',
        sm: 'tracking-wide text-xs font-medium text-primary',
        md: 'tracking-wide text-xs font-medium text-primary',
        lg: 'tracking-wide text-sm font-medium text-primary',
        xl: 'tracking-wide text-base font-medium text-primary',
        '2xl': 'tracking-wide text-lg font-medium text-primary',
    };

    return `tracking-wide text-gray-500 ${sizeClasses[props.size]}`;
});
</script>

<style scoped>
/* Effet 3D pour l'avatar */
.shadow-3d-avatar {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        inset 0 -2px 4px rgba(0, 0, 0, 0.15),
        inset 0 2px 4px rgba(255, 255, 255, 0.25);
}

/* .shadow-3d-avatar:hover {
    box-shadow:
        0 6px 8px -1px rgba(0, 0, 0, 0.15),
        0 3px 5px -1px rgba(0, 0, 0, 0.08),
        inset 0 -2px 4px rgba(0, 0, 0, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
} */
</style>
