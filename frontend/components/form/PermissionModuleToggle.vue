<template>
  <div class="border-2 rounded-xl overflow-hidden transition-all duration-300"
    :class="modelValue.active ? 'border-primary shadow-sm' : 'border-gris/30'">
    <!-- Header du Module -->
    <div class="p-4 flex items-center justify-between cursor-pointer select-none bg-white"
      @click="toggleExpand">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-gray-50 border border-gray-100 shadow-sm"
          :class="{ 'bg-primary/5 border-primary/20': modelValue.active }">
          <Icon :icon="module.icon" class="text-xl" :class="modelValue.active ? 'text-primary' : 'text-noir'" />
        </div>
        <div>
          <span class="font-bold text-noir block">{{ module.name }}</span>
          <span class="text-xs text-gray-500">{{ activePermissionsCount }} action(s) active(s)</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Toggle Principal -->
        <div class="flex items-center gap-2 pr-4 border-r border-gray-100" @click.stop>
          <span class="text-xs font-medium uppercase tracking-wider" 
            :class="modelValue.active ? 'text-primary' : 'text-gray-400'">
            {{ modelValue.active ? 'Activé' : 'Désactivé' }}
          </span>
          <ToggleSwitch 
            :modelValue="modelValue.active" 
            @update:modelValue="onToggleModule"
          />
        </div>
        
        <!-- Indicateur d'expansion -->
        <Icon 
          icon="tabler:chevron-down" 
          class="text-xl text-gray-400 transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <!-- Panel des Actions (Collapse) -->
    <Transition name="expand">
      <div v-if="isExpanded && modelValue.active" class="bg-gray-50/50 p-4 border-t-2 border-primary/10">
        <div class="flex justify-between items-center mb-4">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest">Actions disponibles</p>
          <div class="flex gap-4">
            <button type="button" @click="selectAll" class="text-xs text-primary hover:underline font-medium">
              Tout cocher
            </button>
            <button type="button" @click="deselectAll" class="text-xs text-gray-400 hover:underline font-medium">
              Décocher
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div v-for="action in module.actions" :key="action"
            class="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg cursor-pointer group hover:border-primary/30 transition-all"
            @click="toggleAction(action)">
            <div class="w-5 h-5 border-2 rounded flex items-center justify-center transition-colors"
              :class="isSelected(action) ? 'bg-primary border-primary' : 'border-gris/50 group-hover:border-primary'">
              <Icon v-if="isSelected(action)" icon="mdi:check" class="text-white text-xs" />
            </div>
            <span class="text-sm transition-colors"
              :class="isSelected(action) ? 'text-noir font-semibold' : 'text-gray-500 group-hover:text-primary'">
              {{ actionLabels[action] || action }}
            </span>
          </div>
        </div>
      </div>
      <div v-else-if="isExpanded && !modelValue.active" class="p-6 text-center bg-gray-50 border-t-2 border-gris/10">
        <Icon icon="tabler:lock" class="text-3xl text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-400">Activez ce module pour configurer ses permissions.</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import ToggleSwitch from 'primevue/toggleswitch';

interface PermissionModule {
  id: string;
  name: string;
  icon: string;
  actions: string[];
}

interface ModuleState {
  active: boolean;
  permissions: string[];
}

const props = defineProps<{
  module: PermissionModule;
  modelValue: ModuleState;
  actionLabels: Record<string, string>;
}>();

const emit = defineEmits(['update:modelValue']);

const isExpanded = ref(false);

const activePermissionsCount = computed(() => {
  if (props.modelValue.permissions.includes('*')) return props.module.actions.length;
  return props.modelValue.permissions.filter(p => p.startsWith(`${props.module.id}:`)).length;
});

const isSelected = (action: string) => {
  return props.modelValue.permissions.includes('*') || props.modelValue.permissions.includes(`${props.module.id}:${action}`);
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const onToggleModule = (val: boolean) => {
  const newState = { ...props.modelValue, active: val };
  
  // Ouvrir automatiquement si on active, fermer si on désactive
  isExpanded.value = val;
  
  emit('update:modelValue', newState);
};

const toggleAction = (action: string) => {
  const permString = `${props.module.id}:${action}`;
  let newPermissions = [...props.modelValue.permissions];
  
  if (newPermissions.includes(permString)) {
    newPermissions = newPermissions.filter(p => p !== permString);
  } else {
    newPermissions.push(permString);
  }
  
  emit('update:modelValue', { ...props.modelValue, permissions: newPermissions });
};

const selectAll = () => {
  let newPermissions = [...props.modelValue.permissions];
  props.module.actions.forEach(action => {
    const permString = `${props.module.id}:${action}`;
    if (!newPermissions.includes(permString)) {
      newPermissions.push(permString);
    }
  });
  emit('update:modelValue', { ...props.modelValue, permissions: newPermissions });
};

const deselectAll = () => {
  const newPermissions = props.modelValue.permissions.filter(p => !p.startsWith(`${props.module.id}:`));
  emit('update:modelValue', { ...props.modelValue, permissions: newPermissions });
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
