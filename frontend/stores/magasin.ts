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
  // et forcer le magasin assigné si l'utilisateur n'est pas ADMIN
  watch(() => user.value, (newUser) => {
    if (newUser && newUser.magasin_id) {
       // Si l'utilisateur n'est pas ADMIN, on force son magasin assigné
       if (newUser.role !== 'ADMIN') {
          if (currentMagasinId.value !== newUser.magasin_id) {
             currentMagasinId.value = newUser.magasin_id;
             localStorage.setItem('selected_magasin_id', newUser.magasin_id);
          }
       } else {
          // Pour un ADMIN, on ne force que si aucun magasin n'est sélectionné du tout
          if (currentMagasinId.value === null && !localStorage.getItem('selected_magasin_id')) {
             currentMagasinId.value = newUser.magasin_id;
             localStorage.setItem('selected_magasin_id', newUser.magasin_id);
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

      // 1. Priorité à l'assignation user pour les non-admins
      if (user.value?.role !== 'ADMIN' && user.value?.magasin_id) {
        targetId = user.value.magasin_id;
      } 

      // 'all' est représenté par null
      if (targetId === 'all') targetId = null;

      // Vérification que le targetId existe dans la liste chargée (si non null)
      if (targetId && magasins.value.some(m => m.id === targetId)) {
        currentMagasinId.value = targetId;
      } else if (targetId === null && user.value?.role === 'ADMIN') {
        currentMagasinId.value = null; // Autorisé pour Admin
      } else {
        // Fallback : Magasin de l'utilisateur ou Premier/Principal
        const fallbackId = user.value?.magasin_id || 
                          magasins.value.find(m => m.nom.toLowerCase().includes('principal'))?.id || 
                          magasins.value[0]?.id || null;
        currentMagasinId.value = fallbackId;
      }

      // Persistance du choix validé
      if (currentMagasinId.value) {
        localStorage.setItem('selected_magasin_id', currentMagasinId.value);
      } else if (currentMagasinId.value === null && user.value?.role === 'ADMIN') {
        localStorage.setItem('selected_magasin_id', 'all');
      }

    } catch (error) {
      console.error('Erreur chargement magasins:', error);
    } finally {
      loading.value = false;
    }
  };

  const setMagasin = (id: string | null) => {
    // Si ADMIN, on peut mettre à null ("Toutes les boutiques")
    if (id === null && user.value?.role === 'ADMIN') {
      currentMagasinId.value = null;
      localStorage.setItem('selected_magasin_id', 'all');
      return;
    }

    if (id && magasins.value.some(m => m.id === id)) {
      currentMagasinId.value = id;
      localStorage.setItem('selected_magasin_id', id);
    }
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
    initialize
  };
});
