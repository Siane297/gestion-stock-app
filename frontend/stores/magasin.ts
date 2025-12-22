import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useMagasinApi, type Magasin } from '~/composables/api/useMagasinApi';

export const useMagasinStore = defineStore('magasin', () => {
  const magasins = ref<Magasin[]>([]);
  const currentMagasinId = ref<string | null>(null);
  const loading = ref(false);

  const { getMagasins } = useMagasinApi();

  const currentMagasin = computed(() => {
    return magasins.value.find(m => m.id === currentMagasinId.value) || null;
  });

  // Récupérer l'utilisateur pour l'affectation automatique
  const { user } = useSecureAuth();

  // Watch pour réagir aux changements de l'utilisateur (connexion/refresh)
  // et forcer le magasin assigné si nécessaire
  watch(() => user.value, (newUser) => {
    if (newUser) {
       // Déterminer si l'utilisateur a un accès global
       const hasGlobalAccess = newUser.globalScope || newUser.isOwner || ['ADMIN', 'SUPER_ADMIN'].includes(newUser.role);
       
       if (!hasGlobalAccess && newUser.magasin_id) {
          // Si pas d'accès global, on vérifie si le magasin actuel est autorisé
          const isManaged = newUser.managedStoreIds?.includes(currentMagasinId.value || '');
          if (currentMagasinId.value !== newUser.magasin_id && !isManaged) {
             currentMagasinId.value = newUser.magasin_id;
             localStorage.setItem('selected_magasin_id', newUser.magasin_id);
          }
       } else if (hasGlobalAccess) {
          // Pour un accès global, on ne force que si rien n'est sélectionné
          if (currentMagasinId.value === null && !localStorage.getItem('selected_magasin_id')) {
             if (newUser.magasin_id) {
                currentMagasinId.value = newUser.magasin_id;
                localStorage.setItem('selected_magasin_id', newUser.magasin_id);
             }
          }
       }
    }
  }, { immediate: true });

  // Actions
  const fetchMagasins = async () => {
    loading.value = true;
    try {
      magasins.value = await getMagasins({ est_actif: true });
      
      // Logique de sélection initiale
      let targetId = currentMagasinId.value || localStorage.getItem('selected_magasin_id');

      // Déterminer les droits de l'utilisateur
      const hasGlobalAccess = user.value?.globalScope || user.value?.isOwner || ['ADMIN', 'SUPER_ADMIN'].includes(user.value?.role || '');
      const managedStoreIds = user.value?.managedStoreIds || [];

      // 'all' est représenté par null
      if (targetId === 'all') targetId = null;

      // 1. Si targetId est null (Toutes les boutiques), vérifier si c'est autorisé
      if (targetId === null) {
        if (hasGlobalAccess) {
          currentMagasinId.value = null;
        } else {
          // Sinon fallback vers le magasin assigné
          currentMagasinId.value = user.value?.magasin_id || magasins.value[0]?.id || null;
        }
      } 
      // 2. Si targetId est spécifié, vérifier s'il est autorisé
      else {
        const isAuthorized = hasGlobalAccess || targetId === user.value?.magasin_id || managedStoreIds.includes(targetId);
        const exists = magasins.value.some(m => m.id === targetId);

        if (isAuthorized && exists) {
          currentMagasinId.value = targetId;
        } else {
          // Fallback
          currentMagasinId.value = user.value?.magasin_id || magasins.value[0]?.id || null;
        }
      }

      // Persistance du choix validé
      if (currentMagasinId.value) {
        localStorage.setItem('selected_magasin_id', currentMagasinId.value);
      } else if (currentMagasinId.value === null && hasGlobalAccess) {
        localStorage.setItem('selected_magasin_id', 'all');
      }

    } catch (error) {
      console.error('Erreur chargement magasins:', error);
    } finally {
      loading.value = false;
    }
  };

  const setMagasin = (id: string | null) => {
    const hasGlobalAccess = user.value?.globalScope || user.value?.isOwner || ['ADMIN', 'SUPER_ADMIN'].includes(user.value?.role || '');
    const managedStoreIds = user.value?.managedStoreIds || [];

    // Si on veut mettre à null ("Toutes les boutiques")
    if (id === null) {
      if (hasGlobalAccess) {
        currentMagasinId.value = null;
        localStorage.setItem('selected_magasin_id', 'all');
      }
      return;
    }

    // Si on veut une boutique spécifique
    const isAuthorized = hasGlobalAccess || id === user.value?.magasin_id || managedStoreIds.includes(id);
    if (isAuthorized && magasins.value.some(m => m.id === id)) {
      currentMagasinId.value = id;
      localStorage.setItem('selected_magasin_id', id);
    }
  };

  const reset = () => {
    magasins.value = [];
    currentMagasinId.value = null;
    localStorage.removeItem('selected_magasin_id');
  };

  const initialize = async () => {
    // On laisse fetchMagasins gérer la logique de priorité
    await fetchMagasins();
  };

  return {
    magasins,
    currentMagasinId,
    loading,
    currentMagasin,
    fetchMagasins,
    setMagasin,
    reset,
    initialize
  };
});
