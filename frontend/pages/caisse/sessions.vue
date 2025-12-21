<template>
    <div class="space-y-8">
        <SimplePageHeader title="Supervision des Sessions"
            description="Suivez l'activité de vos caisses en temps réel et consultez l'historique des clôtures." />
        <!-- Sessions Actives (Cartes) -->
        <div v-if="activeSessions.length > 0 && selectedStatut !== 'FERMEE'" class="space-y-4">
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Sessions en cours
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SessionActiveCard v-for="session in activeSessions" :key="session.id" :session="session" />
            </div>
        </div>
        <!-- Filtres rapides -->
        <SessionFilters v-model:magasinId="selectedMagasinId" v-model:statut="selectedStatut" :magasins="magasins"
            :loading="loading" @refresh="loadData" />

        <!-- Historique des Sessions (Table) -->
        <div class="space-y-4">
            <TableGeneric :columns="columns" :data="displaySessions" :loading="loading" :show-edit="false"
                :show-delete="false" search-placeholder="Rechercher une session (caissier, caisse...)" :search-fields="[
                    'utilisateur.employee.fullName',
                    'caisse.nom',
                    'caisse.code',
                ]" @action:view="viewSessionDetail">
                <!-- Colonne Caisse -->
                <template #column-caisse="{ data }">
                    <div class="flex flex-col">
                        <span class="font-bold text-gray-800">{{
                            (data as any).caisse?.nom
                            }}</span>
                        <span class="text-xs text-gray-500">{{
                            (data as any).caisse?.magasin?.nom
                            }}</span>
                    </div>
                </template>

                <!-- Colonne Responsable -->
                <template #column-responsable="{ data }">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-7 h-7 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs">
                            {{ getInitiales((data as any).utilisateur) }}
                        </div>
                        <span class="text-sm font-medium text-gray-700">
                            {{
                                (data as any).utilisateur?.employee?.fullName ||
                                (data as any).utilisateur?.email
                            }}
                        </span>
                    </div>
                </template>

                <!-- Dates -->
                <template #column-date_ouverture="{ data }">
                    <div class="flex flex-col text-xs">
                        <span class="font-medium text-gray-700">{{
                            formatDate((data as any).date_ouverture)
                            }}</span>
                        <span class="text-gray-400">{{
                            formatTime((data as any).date_ouverture)
                            }}</span>
                    </div>
                </template>

                <template #column-date_fermeture="{ data }">
                    <div v-if="(data as any).date_fermeture" class="flex flex-col text-xs">
                        <span class="font-medium text-gray-700">{{
                            formatDate((data as any).date_fermeture)
                            }}</span>
                        <span class="text-gray-400">{{
                            formatTime((data as any).date_fermeture)
                            }}</span>
                    </div>
                    <span v-else class="text-gray-300">-</span>
                </template>

                <!-- Montants -->
                <template #column-fond_initial="{ data }">
                    <span class="font-medium text-gray-700">{{
                        formatPrice((data as any).fond_initial)
                        }}</span>
                </template>

                <template #column-fond_final="{ data }">
                    <span class="font-bold text-gray-800">{{
                        formatPrice((data as any).fond_final || 0)
                        }}</span>
                </template>

                <!-- Écart -->
                <template #column-ecart="{ data }">
                    <div v-if="(data as any).statut === 'FERMEE'" class="flex items-center gap-1">
                        <span
                            :class="(data as any).ecart > 0 ? 'text-green-600' : ((data as any).ecart < 0 ? 'text-red-600' : 'text-gray-400')"
                            class="font-bold">
                            {{ (data as any).ecart > 0 ? "+" : ""
                            }}{{ formatPrice((data as any).ecart) }}
                        </span>
                        <Icon v-if="(data as any).ecart !== 0"
                            :icon="(data as any).ecart > 0 ? 'tabler:trending-up' : 'tabler:trending-down'"
                            :class="(data as any).ecart > 0 ? 'text-green-500' : 'text-red-500'" />
                    </div>
                    <span v-else class="text-gray-300">-</span>
                </template>

                <!-- Statut -->
                <template #column-statut="{ data }">
                    <Badge :value="(data as any).statut === 'OUVERTE' ? 'En cours' : 'Clôturée'"
                        :severity="(data as any).statut === 'OUVERTE' ? 'success' : 'secondary'" />
                </template>
            </TableGeneric>
        </div>

        <!-- Modal Détail Session -->
        <SessionDetailModal v-model:visible="showDetailModal" :rapport="currentRapport" :loading="detailLoading" />

        <Toast />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import SimplePageHeader from "~/components/banner/SimplePageHeader.vue";
import TableGeneric, {
    type TableColumn,
} from "~/components/table/TableGeneric.vue";
import SessionFilters from "~/components/caisse/SessionFilters.vue";
import SessionActiveCard from "~/components/caisse/SessionActiveCard.vue";
import SessionDetailModal from "~/components/caisse/SessionDetailModal.vue";
import {
    useCaisseApi,
    type SessionCaisse,
    type RapportSession,
} from "~/composables/api/useCaisseApi";
import { useMagasinApi } from "~/composables/api/useMagasinApi";
import { useCurrency } from "~/composables/useCurrency";
import Badge from "primevue/badge";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

const { getSessionsGlobal, getSessionDetail } = useCaisseApi();
const { getMagasins } = useMagasinApi();
const { formatPrice } = useCurrency();
const toast = useToast();

// État
const sessions = ref<SessionCaisse[]>([]);
const magasins = ref<any[]>([]);
const selectedMagasinId = ref<string | null>(null);
const selectedStatut = ref<string | null>(null);
const loading = ref(false);

// Computed
const activeSessions = computed(() =>
    sessions.value.filter((s) => s.statut === "OUVERTE")
);
const displaySessions = computed(() => sessions.value);

const columns = [
    {
        field: "caisse",
        header: "Caisse / Boutique",
        sortable: true,
        customRender: true,
    },
    {
        field: "responsable",
        header: "Responsable",
        sortable: true,
        customRender: true,
    },
    {
        field: "date_ouverture",
        header: "Ouverture",
        sortable: true,
        customRender: true,
    },
    {
        field: "date_fermeture",
        header: "Fermeture",
        sortable: true,
        customRender: true,
    },
    {
        field: "fond_initial",
        header: "Initial",
        sortable: true,
        customRender: true,
    },
    {
        field: "fond_final",
        header: "Final (Compté)",
        sortable: true,
        customRender: true,
    },
    { field: "ecart", header: "Écart", sortable: true, customRender: true },
    { field: "statut", header: "Statut", customRender: true },
];

// Détails modal
const showDetailModal = ref(false);
const detailLoading = ref(false);
const currentRapport = ref<RapportSession | null>(null);

// Méthodes
const loadData = async () => {
    loading.value = true;
    try {
        const [sessionsData, magasinsData] = await Promise.all([
            getSessionsGlobal({
                magasinId: selectedMagasinId.value || undefined,
                statut: selectedStatut.value || undefined,
            }),
            getMagasins(),
        ]);
        sessions.value = sessionsData;
        magasins.value = magasinsData;
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de charger les sessions",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

const viewSessionDetail = async (session: SessionCaisse) => {
    showDetailModal.value = true;
    detailLoading.value = true;
    try {
        currentRapport.value = await getSessionDetail(session.id);
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Erreur",
            detail: "Impossible de charger les détails",
            life: 3000,
        });
        showDetailModal.value = false;
    } finally {
        detailLoading.value = false;
    }
};

// Utils (gardés pour TableGeneric s'ils sont nécessaires au rendu des colonnes personnalisées)
const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getInitiales = (user: any) => {
    const name = user?.employee?.fullName || user?.email || "??";
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
/* Page-specific styles if any */
</style>
