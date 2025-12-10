// Types pour le statut d'abonnement
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';

export interface Organization {
  id: string;
  name: string;
  email: string;
  emailOrganisation: string;
  logo: string | null;
  blocked: boolean;
  createdAt: string;
  employeeCount: number;
  // Champs d'abonnement
  trialEndsAt: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: string | null;
  monthlyPrice: number | null;
  daysRemaining: number | null;
}

export interface SubscriptionDetails {
  id: string;
  name: string;
  country: string;
  trialEndsAt: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: string | null;
  monthlyPrice: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  daysRemaining: number | null;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  durationDays: number;
  paymentDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  notes: string | null;
  createdAt: string;
}

export interface ActivateSubscriptionData {
  monthlyPrice: number;
  durationMonths: number;
  notes?: string;
}

export const useOrganizationApi = () => {
  const { get, patch, post } = useSecureApi();

  /**
   * Récupérer toutes les organisations (Super Admin uniquement)
   */
  const getAllOrganizations = async (): Promise<Organization[]> => {
    try {
      const response = await get<Organization[]>('/api/organizations');
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des organisations:', error);
      throw new Error(error.data?.message || 'Erreur lors de la récupération des organisations');
    }
  };

  /**
   * Basculer le statut de blocage d'une organisation (Super Admin uniquement)
   */
  const toggleBlockOrganization = async (id: string, blocked: boolean): Promise<void> => {
    try {
      await patch(`/api/organizations/${id}/block`, { blocked });
    } catch (error: any) {
      console.error('Erreur lors du changement de statut de l\'organisation:', error);
      throw new Error(error.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  /**
   * Récupérer les détails d'abonnement d'une organisation
   */
  const getSubscriptionDetails = async (companyId: string): Promise<SubscriptionDetails> => {
    try {
      const response = await get<SubscriptionDetails>(`/api/subscriptions/${companyId}`);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des détails d\'abonnement:', error);
      throw new Error(error.data?.message || 'Erreur lors de la récupération des détails d\'abonnement');
    }
  };

  /**
   * Activer un abonnement après négociation du prix
   */
  const activateSubscription = async (companyId: string, data: ActivateSubscriptionData): Promise<void> => {
    try {
      await post(`/api/subscriptions/${companyId}/activate`, data);
    } catch (error: any) {
      console.error('Erreur lors de l\'activation de l\'abonnement:', error);
      throw new Error(error.data?.message || 'Erreur lors de l\'activation de l\'abonnement');
    }
  };

  /**
   * Renouveler un abonnement existant
   */
  const renewSubscription = async (companyId: string, data: ActivateSubscriptionData): Promise<void> => {
    try {
      await post(`/api/subscriptions/${companyId}/renew`, data);
    } catch (error: any) {
      console.error('Erreur lors du renouvellement de l\'abonnement:', error);
      throw new Error(error.data?.message || 'Erreur lors du renouvellement de l\'abonnement');
    }
  };

  /**
   * Récupérer l'historique des paiements d'une organisation
   */
  const getPaymentHistory = async (companyId: string): Promise<PaymentHistoryItem[]> => {
    try {
      const response = await get<PaymentHistoryItem[]>(`/api/subscriptions/${companyId}/payments`);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
      throw new Error(error.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  };

  /**
   * Mettre à jour les notes d'un abonnement
   */
  const updateSubscriptionNotes = async (companyId: string, notes: string): Promise<void> => {
    try {
      await patch(`/api/subscriptions/${companyId}/notes`, { notes });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des notes:', error);
      throw new Error(error.data?.message || 'Erreur lors de la mise à jour des notes');
    }
  };

  return {
    getAllOrganizations,
    toggleBlockOrganization,
    getSubscriptionDetails,
    activateSubscription,
    renewSubscription,
    getPaymentHistory,
    updateSubscriptionNotes,
  };
};

