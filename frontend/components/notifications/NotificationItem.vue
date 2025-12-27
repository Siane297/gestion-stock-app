<template>
  <div 
    class="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group"
    :class="[
      notification.est_lue ? 'bg-white' : 'bg-blue-50/50',
      'hover:bg-gray-50'
    ]"
    @click="$emit('click', notification)"
  >
    <!-- Icon Container -->
    <div 
      class="p-2 rounded-full flex-shrink-0"
      :class="getIconConfig(notification.type).bgClass"
    >
      <Icon 
        :icon="getIconConfig(notification.type).icon" 
        :class="getIconConfig(notification.type).iconClass"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-start mb-1">
        <h4 
          class="text-sm font-semibold truncate leading-tight pr-4"
          :class="notification.est_lue ? 'text-noir' : 'text-blue-900'"
        >
          {{ notification.titre }}
        </h4>
        <div v-if="!notification.est_lue" class="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
      </div>
      
      <p class="text-xs text-gray-600 line-clamp-2 leading-normal mb-2">
        {{ notification.message }}
      </p>
      
      <div class="flex items-center justify-between">
        <span class="text-[10px] text-primary font-medium">
          {{ formatDate(notification.date_creation) }}
        </span>
        <span 
          v-if="notification.emetteur" 
          class="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded italic"
        >
          Par {{ notification.emetteur.nom }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TypeNotification, type Notification } from '~/types/notification';

const props = defineProps<{
  notification: Notification;
}>();

defineEmits<{
  (e: 'click', notification: Notification): void;
}>();

const formatDate = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  } catch (e) {
    return date;
  }
};

const getIconConfig = (type: TypeNotification) => {
  switch (type) {
    case TypeNotification.VENTE_NOUVELLE:
      return { icon: 'lucide:shopping-cart', bgClass: 'bg-green-100', iconClass: 'text-green-600' };
    case TypeNotification.VENTE_IMPORTANTE:
      return { icon: 'lucide:trending-up', bgClass: 'bg-emerald-100', iconClass: 'text-emerald-700' };
    case TypeNotification.ACHAT_NOUVELLE_COMMANDE:
      return { icon: 'lucide:package', bgClass: 'bg-blue-100', iconClass: 'text-blue-600' };
    case TypeNotification.ACHAT_RECEPTION_PARTIELLE:
    case TypeNotification.ACHAT_RECEPTION_COMPLETE:
      return { icon: 'lucide:box', bgClass: 'bg-indigo-100', iconClass: 'text-indigo-600' };
    case TypeNotification.STOCK_FAIBLE:
      return { icon: 'lucide:alert-triangle', bgClass: 'bg-orange-100', iconClass: 'text-orange-600' };
    case TypeNotification.STOCK_RUPTURE:
      return { icon: 'lucide:octagon-alert', bgClass: 'bg-red-100', iconClass: 'text-red-600' };
    case TypeNotification.INVENTAIRE_NOUVEAU:
      return { icon: 'lucide:clipboard-list', bgClass: 'bg-purple-100', iconClass: 'text-purple-600' };
    case TypeNotification.INVENTAIRE_VALIDE:
      return { icon: 'lucide:check-circle', bgClass: 'bg-green-100', iconClass: 'text-green-600' };
    case TypeNotification.SYSTEME_ALERTE:
      return { icon: 'lucide:shield-alert', bgClass: 'bg-red-100', iconClass: 'text-red-600' };
    default:
      return { icon: 'lucide:bell', bgClass: 'bg-gray-100', iconClass: 'text-gray-600' };
  }
};
</script>
