<template>
  <div>
    <SimplePageHeader
      title="Nouvel Inventaire"
      description="Créez un inventaire physique pour vérifier vos stocks"
    />

    <div class="mt-6">
      <div class="bg-white border-2 border-gris/40 rounded-xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Sélection du magasin -->
          <div class="flex flex-col gap-2">
            <label for="magasin_id" class="font-semibold text-gray-700">
              Boutique <span class="text-red-500">*</span>
            </label>
            <Select
              id="magasin_id"
              v-model="formData.magasin_id"
              :options="magasins"
              optionLabel="nom"
              optionValue="id"
              placeholder="Sélectionnez une boutique"
              :invalid="submitted && !formData.magasin_id"
              filter
              class="w-full"
            />
            <small v-if="submitted && !formData.magasin_id" class="text-red-500">
              La boutique est requise
            </small>
          </div>

          <!-- Commentaire -->
          <div class="flex flex-col gap-2">
            <label for="commentaire" class="font-semibold text-gray-700">
              Commentaire (optionnel)
            </label>
            <Textarea
              id="commentaire"
              v-model="formData.commentaire"
              placeholder="Notes ou raison de l'inventaire..."
              rows="3"
              class="w-full"
            />
          </div>

          <!-- Info sur les produits inclus -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 text-blue-700">
              <i class="pi pi-info-circle"></i>
              <span class="font-medium">Information</span>
            </div>
            <p class="text-blue-600 text-sm mt-2">
              Tous les produits ayant du stock dans la boutique sélectionnée seront inclus dans l'inventaire.
              Les quantités théoriques seront automatiquement figées au moment du démarrage.
            </p>
          </div>

          <!-- Boutons -->
          <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
            <AppButton
              type="button"
              label="Annuler"
              icon="pi pi-times"
              variant="outline"
              @click="handleCancel"
            />
            <AppButton
              type="button"
              label="Créer en Brouillon"
              icon="pi pi-save"
              variant="secondary"
              :loading="loadingBrouillon"
              @click="handleCreateBrouillon"
            />
            <AppButton
              type="submit"
              label="Créer et Démarrer"
              icon="pi pi-play"
              variant="primary"
              :loading="loadingStart"
            />
          </div>
        </form>
      </div>
    </div>

    <Toast />
    
    <!-- Dialog de confirmation annulation -->
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      message="Voulez-vous vraiment annuler ? Les données saisies seront perdues."
      header="Confirmation"
      accept-label="Oui, annuler"
      reject-label="Non, continuer"
      @accept="router.push('/inventaire')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import SimplePageHeader from '~/components/banner/SimplePageHeader.vue';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import { useInventaireApi } from '~/composables/api/useInventaireApi';
import { useMagasinApi, type Magasin } from '~/composables/api/useMagasinApi';
import { usePermissions } from '~/composables/usePermissions';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';

const { createInventaire, startInventaire } = useInventaireApi();
const { getMagasins } = useMagasinApi();
const { hasPermission } = usePermissions();
const toast = useToast();
const router = useRouter();

// Vérification des permissions
if (!hasPermission('inventaire', 'creer')) {
  router.push('/inventaire');
}

const magasins = ref<Magasin[]>([]);
const formData = ref({
  magasin_id: '',
  commentaire: ''
});
const submitted = ref(false);
const loadingBrouillon = ref(false);
const loadingStart = ref(false);
const showConfirmDialog = ref(false);

const loadMagasins = async () => {
  try {
    magasins.value = await getMagasins({ est_actif: true });
  } catch (e: any) {
    console.error('Erreur chargement magasins', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les boutiques', life: 3000 });
  }
};

const handleSubmit = async () => {
  submitted.value = true;
  if (!formData.value.magasin_id) return;

  loadingStart.value = true;
  try {
    // 1. Créer l'inventaire
    const inventaire = await createInventaire({
      magasin_id: formData.value.magasin_id,
      commentaire: formData.value.commentaire || undefined
    });

    if (!inventaire) throw new Error('Erreur lors de la création');

    // 2. Démarrer l'inventaire
    const started = await startInventaire(inventaire.id);
    
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Inventaire créé et démarré', life: 3000 });
    
    // 3. Rediriger vers l'exécution
    router.push(`/inventaire/execution/${inventaire.id}`);
  } catch (e: any) {
    console.error('Erreur création inventaire', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de créer l\'inventaire', life: 3000 });
  } finally {
    loadingStart.value = false;
  }
};

const handleCreateBrouillon = async () => {
  submitted.value = true;
  if (!formData.value.magasin_id) return;

  loadingBrouillon.value = true;
  try {
    const inventaire = await createInventaire({
      magasin_id: formData.value.magasin_id,
      commentaire: formData.value.commentaire || undefined
    });

    if (!inventaire) throw new Error('Erreur lors de la création');

    toast.add({ severity: 'success', summary: 'Succès', detail: 'Inventaire créé en brouillon', life: 3000 });
    router.push('/inventaire');
  } catch (e: any) {
    console.error('Erreur création inventaire', e);
    toast.add({ severity: 'error', summary: 'Erreur', detail: e.message || 'Impossible de créer l\'inventaire', life: 3000 });
  } finally {
    loadingBrouillon.value = false;
  }
};

const handleCancel = () => {
  showConfirmDialog.value = true;
};

onMounted(() => {
  loadMagasins();
});
</script>