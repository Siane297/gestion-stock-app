<template>
  <div 
    class="w-fit p-2 rounded-lg bg-primary border-2 border-primary/20" 
    :class="sizeClasses"
    style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -2px 4px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.2);"
  >
    <img 
      src="/assets/image/logo.png" 
      alt="Logo" 
      :class="imageClasses"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
});

// Classes pour le conteneur selon la taille
const sizeClasses = computed(() => {
  const classes = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-2.5',
    xl: 'p-5',
  };
  return classes[props.size];
});

// Classes pour l'image selon la taille
const imageClasses = computed(() => {
  const classes = {
    xs: 'h-4 w-auto',
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto',
  };
  return classes[props.size];
});
</script>
