<template>
    <Dialog v-model:visible="isVisible" modal header="Clôture de Session" :style="{ width: '60rem' }"
        :breakpoints="{ '1199px': '85vw', '575px': '95vw' }" class="p-fluid" @hide="$emit('closed')">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <i class="pi pi-lock-open text-orange-600 text-xl"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-noir m-0">Clôture de Caisse</h3>
                    <p class="text-sm text-primary m-0">Session du {{ formatDate(sessionDetail?.date_ouverture) }}</p>
                </div>
            </div>
        </template>

        <div v-if="fetchingDetails" class="flex flex-col items-center justify-center py-12 gap-4">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            <p class="text-noir/60 animate-pulse">Calcul du résumé des ventes...</p>
        </div>

        <div v-else class="space-y-6 pt-4">
            <!-- Résumé des Ventes -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ventes Total</span>
                    <p class="text-2xl font-black text-side2 mt-1">{{ formatPrice(sessionDetail?.chiffre_affaires || 0) }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ sessionDetail?.nombre_ventes || 0 }} transactions</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Espèces Théorique</span>
                    <p class="text-2xl font-black text-noir mt-1">{{ formatPrice(theoreticalCash) }}</p>
                    <p class="text-xs text-gray-500 mt-1">Initial: {{ formatPrice(sessionDetail?.fond_initial || 0) }}</p>
                </div>
                <div :class="[
                    'p-4 rounded-xl border transition-all duration-300',
                    closureData.fond_final === null ? 'bg-gray-100 border-gray-200' : (discrepancy === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                ]">
                    <span class="text-xs font-bold uppercase tracking-wider" :class="closureData.fond_final === null ? 'text-gray-500' : (discrepancy === 0 ? 'text-green-600' : 'text-red-600')">
                        Écart de Caisse
                    </span>
                    <p class="text-2xl font-black mt-1" :class="closureData.fond_final === null ? 'text-gray-600' : (discrepancy === 0 ? 'text-green-700' : 'text-red-700')">
                        {{ formatPrice(discrepancy) }}
                    </p>
                    <p class="text-xs mt-1" :class="closureData.fond_final === null ? 'text-gray-500/70' : (discrepancy === 0 ? 'text-green-600/70' : 'text-red-600/70')">
                        {{ closureData.fond_final === null ? 'En attente de saisie...' : (discrepancy === 0 ? 'Caisse équilibrée' : (discrepancy > 0 ? 'Surplus détecté' : 'Manquant détecté')) }}
                    </p>
                </div>
            </div>

            <!-- Détails des Produits Vendus -->
            <div v-if="sessionDetail?.produits_vendus?.length" class="border border-gris rounded-xl overflow-hidden">
                <div class="bg-side2 p-3 border-b border-gris flex items-center justify-between">
                    <span class="text-sm font-bold text-white">Produits vendus</span>
                    <span class="text-xs bg-white px-2 py-1 rounded border text-gray-500">{{ sessionDetail.produits_vendus.length }} articles</span>
                </div>
                <div class="max-h-[200px] overflow-y-auto">
                    <table class="w-full  text-sm">
                        <thead class="bg-bleu sticky top-0 z-10">
                            <tr>
                                <th class="text-left p-3 text-noir font-medium">Produit</th>
                                <th class="text-center p-3 text-noir font-medium">Qté</th>
                                <th class="text-right p-3 text-noir font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="p in sessionDetail.produits_vendus" :key="p.produit_id" class="hover:bg-gray-50/50">
                                <td class="p-3 font-medium text-noir">{{ p.nom }}</td>
                                <td class="p-3 text-center text-gray-600">{{ p.quantite }}</td>
                                <td class="p-3 text-right font-bold text-noir">{{ formatPrice(p.prix_total) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Formulaire de Closure -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                    <label class="font-bold text-noir flex items-center gap-2">
                        <!-- <i class="pi pi-wallet text-primary"></i> -->
                        Montant physique compté <span class="text-red-500">*</span>
                    </label>
                    <InputGroup class="h-12 shadow-sm order-2 md:order-none">
                        <InputGroupAddon v-if="currentCurrency?.symbolPosition === 'before'" 
                            class="font-bold text-gray-600 bg-gray-50 border-r-0 px-4">
                            {{ currentCurrency?.symbol }}
                        </InputGroupAddon>
                        
                        <InputNumber v-model="closureData.fond_final"
                            :useGrouping="true" :maxFractionDigits="currentCurrency?.decimalPlaces || 0"
                            :minFractionDigits="0"
                            placeholder="Montant compté..." class="w-full text-lg" :min="0"
                            inputClass="h-12 px-4 text-noir" 
                            @input="(e) => closureData.fond_final = Number(e.value || 0)" />
                        
                        <InputGroupAddon v-if="currentCurrency?.symbolPosition !== 'before'" 
                            class="font-extrabold !text-gray-600 !bg-gray-200/50 !border-l-0 px-4 min-w-[70px] justify-center text-sm">
                            {{ currentCurrency?.symbol }}
                        </InputGroupAddon>
                    </InputGroup>
                    <small class="text-noir/50">Saisissez le montant total d'espèces présent en caisse.</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold text-noir flex items-center gap-2">
                        <!-- <i class="pi pi-pencil text-primary"></i> -->
                        Notes & Justifications <span v-if="discrepancy !== 0" class="text-red-500">*</span>
                    </label>
                    <Textarea v-model="closureData.notes" rows="3" 
                        :placeholder="discrepancy !== 0 ? 'L\'écart doit obligatoirement être justifié ici...' : 'Observations facultatives...'"
                        class="w-full" :class="{ 'border-red-300 bg-red-50/30': discrepancy !== 0 && !closureData.notes }" />
                    <small v-if="discrepancy !== 0" class="text-red-500 font-medium">
                        <i class="pi pi-exclamation-triangle mr-1"></i> Justifiez l'écart pour valider la clôture.
                    </small>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 pt-4">
                <AppButton label="Continuer la vente" variant="outline" icon="pi pi-times" 
                    :disabled="loading" @click="isVisible = false" />
                <AppButton label="Valider la clôture" variant="primary" icon="pi pi-check" 
                    :loading="loading" :disabled="isSubmitDisabled || fetchingDetails"
                    @click="openConfirmation" />
            </div>
        </template>
    </Dialog>

    <ConfirmationDialog
        v-model:visible="showConfirmation"
        header="Confirmer la clôture"
        message="Êtes-vous sûr de vouloir clôturer cette session ? Cette action est irréversible."
        acceptLabel="Oui, Clôturer"
        rejectLabel="Non, Annuler"
        acceptVariant="danger"
        @accept="executeClosure"
    />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Textarea from 'primevue/textarea';
import ProgressSpinner from 'primevue/progressspinner';
import AppButton from '~/components/button/AppButton.vue';
import ConfirmationDialog from '~/components/dialog/ConfirmationDialog.vue';
import { useCurrency } from '~/composables/useCurrency';
import { useCaisseApi } from '~/composables/api/useCaisseApi';
import type { RapportSession, SessionCaisse } from '~/composables/api/useCaisseApi';
import { useToast } from 'primevue/usetoast';

interface Props {
    visible: boolean;
    session: SessionCaisse | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:visible': [value: boolean];
    'closed': [];
    'success': [rapport: RapportSession];
}>();

const { formatPrice, currentCurrency } = useCurrency();
const { getSessionDetail, fermerSession } = useCaisseApi();
const toast = useToast();

const isVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});

const currencyCode = computed(() => currentCurrency.value?.code || 'KMF');
const loading = ref(false);
const fetchingDetails = ref(false);
const showConfirmation = ref(false);
const sessionDetail = ref<RapportSession | null>(null);

const closureData = ref<{
    fond_final: number | null;
    notes: string;
}>({
    fond_final: null,
    notes: ''
});

// Watch visible to load details
watch(() => props.visible, async (newVal) => {
    if (newVal && props.session?.id) {
        fetchDetails();
    }
});

const fetchDetails = async () => {
    if (!props.session?.id) return;
    
    fetchingDetails.value = true;
    try {
        const details = await getSessionDetail(props.session.id);
        sessionDetail.value = details;
        if (details) {
            closureData.value.notes = '';
        }
    } catch (err) {
        console.error('Erreur chargement détails:', err);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de calculer le résumé des ventes' });
    } finally {
        fetchingDetails.value = false;
    }
};

const theoreticalCash = computed(() => {
    if (!sessionDetail.value) return 0;
    return (sessionDetail.value.fond_initial || 0) + (sessionDetail.value.total_especes || 0);
});

const discrepancy = computed(() => {
    if (closureData.value.fond_final === null) return 0;
    return closureData.value.fond_final - theoreticalCash.value;
});

const isSubmitDisabled = computed(() => {
    if (closureData.value.fond_final === null) {
        return true;
    }
    if (discrepancy.value !== 0 && !closureData.value.notes?.trim()) {
        return true;
    }
    return false;
});

const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const openConfirmation = () => {
    if (isSubmitDisabled.value) return;
    showConfirmation.value = true;
};

const executeClosure = async () => {
    if (!props.session?.caisse_id) return;

    loading.value = true;
    try {
        const rapport = await fermerSession(props.session.caisse_id, {
            fond_final: closureData.value.fond_final || 0,
            notes: closureData.value.notes
        });
        
        if (rapport) {
            emit('success', rapport);
            isVisible.value = false;
        }
    } catch (err: any) {
        toast.add({
            severity: 'error',
            summary: 'Erreur clôture',
            detail: err.message || 'Impossible de fermer la session',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};
</script>
