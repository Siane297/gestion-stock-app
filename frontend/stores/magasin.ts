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

  // Actions
  const fetchMagasins = async () => {
    loading.value = true;
    try {
      magasins.value = await getMagasins({ est_actif: true });
      
      // Si aucun magasin n'est sélectionné OU si le magasin sélectionné n'existe plus dans la liste
      const isCurrentValid = currentMagasinId.value && magasins.value.some(m => m.id === currentMagasinId.value);
      
      if (!isCurrentValid && magasins.value.length > 0) {
        // Tenter de récupérer du localStorage (déjà fait dans initialize, mais au cas où)
        const storedId = localStorage.getItem('selected_magasin_id');
        if (storedId && magasins.value.some(m => m.id === storedId)) {
          currentMagasinId.value = storedId;
        } else {
          // Par défaut : le premier ou celui marqué "principal"
          const principal = magasins.value.find(m => m.nom.toLowerCase().includes('principal'));
          currentMagasinId.value = principal ? principal.id : magasins.value[0]?.id || null;
          
          // Sauvegarder le nouveau choix par défaut
          if (currentMagasinId.value) {
            localStorage.setItem('selected_magasin_id', currentMagasinId.value);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement magasins:', error);
    } finally {
      loading.value = false;
    }
  };

  const setMagasin = (id: string) => {
    if (magasins.value.some(m => m.id === id)) {
      currentMagasinId.value = id;
      localStorage.setItem('selected_magasin_id', id);
    }
  };

  const initialize = async () => {
    const storedId = localStorage.getItem('selected_magasin_id');
    if (storedId) {
        currentMagasinId.value = storedId;
    }
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
