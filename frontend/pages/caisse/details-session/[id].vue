<template>
    <div class="space-y-8">
        <PageHeaderActions title="Détail de la session"
            description="Consultez les informations détaillées de la session de caisse, les totaux financiers et les encaissements."
            :back-url="'/caisse/sessions'">
            <template #actions>
                <AppButton 
                    variant="primary" 
                    icon="pi pi-file-pdf" 
                    label="Exporter PDF" 
                    :loading="isExportingPdf"
                    @click="handlePdfExport"
                />
            </template>
        </PageHeaderActions>

        <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4 min-h-[400px]">
            <Icon icon="tabler:loader-2" class="text-4xl text-primary animate-spin" />
            <p class="text-gray-500 font-medium">Récupération du rapport complet...</p>
        </div>

        <div v-else-if="rapport" class="space-y-6  mx-auto">
            <!-- Header rapport -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border-2 border-gris/40  relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-32 h-32 bg-bleu/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                
                <div class="space-y-4 relative z-10">
                    <div class="flex items-center gap-2 text-primary">
                        <Icon icon="tabler:cash-register" class="text-xl" />
                        <span class="font-bold uppercase tracking-widest text-xs">Informations Terminal</span>
                    </div>
                    <div>
                        <h3 class="text-2xl font-black text-gray-800">{{ rapport.caisse.nom }}</h3>
                        <p class="text-sm text-gray-500 font-mono mt-1">Code: {{ rapport.caisse.code }}</p>
                    </div>
                    <div class="pt-4 border-t border-dashed border-gray-200">
                        <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">Responsable de session</p>
                        <div class="flex items-center gap-3">
                             <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                {{ getInitiales(rapport.utilisateur) }}
                             </div>
                             <div class="flex flex-col">
                                <span class="font-bold text-gray-700">{{ rapport.utilisateur.fullName || rapport.utilisateur.email }}</span>
                                <span class="text-xs text-gray-400">{{ rapport.utilisateur.email }}</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-4 relative z-10">
                    <div class="flex items-center gap-2 text-primary">
                        <Icon icon="tabler:clock" class="text-xl" />
                        <span class="font-bold uppercase tracking-widest text-xs">Chronologie</span>
                    </div>
                    
                    <div class="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-500">Ouverture</span>
                            <div class="flex flex-col items-end">
                                <span class="font-bold text-gray-700">{{ formatDate(rapport.date_ouverture) }}</span>
                                <span class="text-xs text-gray-400">{{ formatTime(rapport.date_ouverture) }}</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
                            <span class="text-gray-500">Fermeture</span>
                            <div v-if="rapport.date_fermeture" class="flex flex-col items-end">
                                <span class="font-bold text-gray-700">{{ formatDate(rapport.date_fermeture) }}</span>
                                <span class="text-xs text-gray-400">{{ formatTime(rapport.date_fermeture) }}</span>
                            </div>
                            <span v-else class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold text-center">
                                En cours
                            </span>
                        </div>
                    </div>
                    
                     <div class="flex justify-between items-center text-sm px-1">
                        <span class="text-gray-500 font-medium">Statut</span>
                         <Badge :value="rapport.statut === 'OUVERTE' ? 'En cours' : 'Clôturée'" 
                               :severity="rapport.statut === 'OUVERTE' ? 'success' : 'secondary'"
                               size="large" />
                     </div>
                </div>
            </div>

            <!-- Totaux Financiers -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardStat 
                    icon="tabler:wallet" 
                    :value="formatPrice(rapport.fond_initial)" 
                    label="Fond Initial" 
                    variant="info" 
                />
                <CardStat 
                    icon="tabler:chart-bar" 
                    :value="formatPrice(rapport.chiffre_affaires)" 
                    label="Ventes (CA)" 
                    variant="success" 
                />
                <CardStat 
                    icon="tabler:cash" 
                    :value="formatPrice(rapport.fond_final || 0)" 
                    label="Fond Final" 
                    variant="primary" 
                />
                <CardStat 
                    :icon="(rapport.ecart || 0) >= 0 ? 'tabler:trending-up' : 'tabler:trending-down'" 
                    :value="formatPrice(rapport.ecart || 0)" 
                    label="Écart" 
                    :variant="(rapport.ecart || 0) === 0 ? 'info' : ((rapport.ecart || 0) > 0 ? 'success' : 'danger')" 
                />
            </div>

            <!-- Détail par paiement -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Modes de paiement -->
                <div class="lg:col-span-1 bg-white rounded-xl border-2 border-gris/40 p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-gris/40">
                        <div class="w-10 h-10 rounded-full bg-bleu/10 text-primary flex items-center justify-center">
                            <Icon icon="tabler:wallet" class="text-xl" />
                        </div>
                        <div class="flex flex-col">
                            <h4 class="font-bold text-gray-800 text-lg">Paiements</h4>
                            <p class="text-xs text-gray-500">Par mode de règlement</p>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div v-for="(val, key) in paiementDetails" :key="key"
                            class="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:border-bleu/30 hover:shadow-sm transition-all duration-300">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" :class="getPaiementColorClasses(key as string).bg">
                                    <Icon :icon="getPaiementIcon(key as string)" class="text-lg" />
                                </div>
                                <span class="text-sm text-gray-600 font-medium">{{ getPaiementLabel(key as string) }}</span>
                            </div>
                            <span class="font-bold text-gray-800 text-sm">{{ formatPrice(val) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Produits vendus -->
                <div class="lg:col-span-2 bg-white rounded-xl border-2 border-gris/40 p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-gris/40">
                        <div class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                             <Icon icon="tabler:package" class="text-xl" />
                        </div>
                        <div class="flex flex-col">
                            <h4 class="font-bold text-gray-800 text-lg">Produits vendus</h4>
                            <p class="text-xs text-gray-500">Liste des articles écoulés durant cette session</p>
                        </div>
                    </div>

                    <TableSimple 
                        :columns="produitColumns" 
                        :data="rapport.produits_vendus || []" 
                        :rows-per-page="5"
                        :show-actions="false"
                    />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import PageHeaderActions from "~/components/banner/PageHeaderActions.vue";
import AppButton from '~/components/button/AppButton.vue';
import CardStat from '~/components/card/CardStat.vue';
import TableSimple, { type TableColumn } from '~/components/table/TableSimple.vue';
import { useCaisseApi, type RapportSession } from '~/composables/api/useCaisseApi';
import { useCurrency } from '~/composables/useCurrency';
import Badge from "primevue/badge";
import { useToast } from "primevue/usetoast";
import { useSecurePdf } from '~/composables/useSecurePdf';

definePageMeta({
    middleware: ['auth', 'permissions'],
    permission: 'caisses:voir'
});

const route = useRoute();
const { formatPrice } = useCurrency();
const { generateSessionPdf } = useSecurePdf();

const produitColumns: TableColumn[] = [
    { field: 'nom', header: 'Produit', sortable: true },
    { field: 'code_barre', header: 'Code Barre', sortable: true },
    { field: 'quantite', header: 'Qté', sortable: true },
    { field: 'prix_total', header: 'Total', sortable: true, type: 'price' }
];
const toast = useToast();
const { getSessionDetail } = useCaisseApi();

const loading = ref(false);
const isExportingPdf = ref(false);
const rapport = ref<RapportSession | null>(null);

const sessionId = computed(() => route.params.id as string);

const paiementDetails = computed(() => {
    if (!rapport.value) return {};
    const details = {
        ESPECES: rapport.value.total_especes,
        CARTE: rapport.value.total_carte,
        MOBILE: rapport.value.total_mobile,
        CHEQUE: rapport.value.total_cheque,
        AUTRE: rapport.value.total_autre
    };
    // Ne garder que les modes de paiement avec un montant > 0
    return Object.fromEntries(
        Object.entries(details).filter(([_, val]) => val > 0)
    );
});

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getPaiementIcon = (key: string) => {
    const icons: any = {
        ESPECES: 'tabler:coin',
        CARTE: 'tabler:credit-card',
        MOBILE: 'tabler:device-mobile',
        CHEQUE: 'tabler:clipboard-check',
        AUTRE: 'tabler:dots'
    };
    return icons[key] || 'tabler:currency-dollar';
};

const getPaiementLabel = (key: string) => {
    const labels: any = {
        ESPECES: 'Espèces',
        CARTE: 'Carte Bancaire',
        MOBILE: 'Mobile Money',
        CHEQUE: 'Chèque',
        AUTRE: 'Autres / Virements'
    };
    return labels[key] || key;
};

const getPaiementColorClasses = (key: string) => {
    const classes: any = {
        ESPECES: { bg: 'bg-green-600 text-white' },
        CARTE: { bg: 'bg-blue-600 text-white' },
        MOBILE: { bg: 'bg-orange-600 text-white' },
        CHEQUE: { bg: 'bg-purple-600 text-white' },
        AUTRE: { bg: 'bg-gray-600 text-white' }
    };
    return classes[key] || { bg: 'bg-gray-100 text-gray-600' };
};

const getInitiales = (user: any) => {
    const name = user?.fullName || user?.email || "??";
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
};

const fetchSessionDetail = async () => {
    if (!sessionId.value) return;
    
    loading.value = true;
    try {
        rapport.value = await getSessionDetail(sessionId.value);
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de charger les détails de la session",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const handlePdfExport = async () => {
    if (!sessionId.value) return;
    
    isExportingPdf.value = true;
    try {
        await generateSessionPdf(sessionId.value);
    } finally {
        isExportingPdf.value = false;
    }
};

onMounted(() => {
    fetchSessionDetail();
});
</script>

<style scoped>
/* Scoped styles if needed */
</style>