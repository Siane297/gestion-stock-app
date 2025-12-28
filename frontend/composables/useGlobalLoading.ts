/**
 * Composable pour gérer l'état de chargement global de l'application
 * Permet de synchroniser le loader entre les transitions de pages et les chargements de données
 */
export const useGlobalLoading = () => {
    // État global du chargement (shared via useState)
    const isLoading = useState<boolean>('global_loading_state', () => false);

    const startLoading = () => {
        isLoading.value = true;
    };

    const stopLoading = () => {
        isLoading.value = false;
    };

    return {
        isLoading,
        startLoading,
        stopLoading
    };
};
