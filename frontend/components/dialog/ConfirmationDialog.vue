<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="false"
    :draggable="false"
    :style="{ width: '450px' }"
    class="confirmation-dialog"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <Icon icon="lucide:message-square-warning" class="text-2xl text-orange-500" />
        <span class="font-semibold text-lg">{{ header }}</span>
      </div>
    </template>

    <div class="py-4">
      <p class="text-gray-700">{{ message }}</p>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
        <AppButton
          :label="rejectLabel"
          :variant="rejectVariant"
          size="sm"
          class="w-full sm:w-auto sm:px-6"
          icon-left="pi pi-times"
          @click="handleReject"
        />
        <AppButton
          :label="acceptLabel"
          :variant="acceptVariant"
          size="sm"
          class="w-full sm:w-auto sm:px-6"
          icon-left="pi pi-check"
          @click="handleAccept"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import Dialog from "primevue/dialog";
import AppButton from "~/components/button/AppButton.vue";

interface Props {
  visible: boolean;
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptVariant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  rejectVariant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
}

const props = withDefaults(defineProps<Props>(), {
  header: "Confirmation",
  icon: "pi pi-exclamation-triangle",
  acceptLabel: "Oui",
  rejectLabel: "Non",
  acceptVariant: "primary",
  rejectVariant: "outline",
});

const emit = defineEmits<{
  "update:visible": [value: boolean];
  accept: [];
  reject: [];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const handleAccept = () => {
  emit("accept");
  isVisible.value = false;
};

const handleReject = () => {
  emit("reject");
  isVisible.value = false;
};
</script>

<style scoped>
:deep(.p-dialog-header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-dialog-content) {
  padding: 0 1.5rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid #e5e7eb;
}
</style>
