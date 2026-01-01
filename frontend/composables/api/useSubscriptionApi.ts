import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface SubscriptionDetails {
  id: string;
  name: string;
  country: string;
  trialEndsAt: string | null;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED' | 'PROVISIONING' | 'FAILED';
  subscriptionEndsAt: string | null;
  monthlyPrice: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  daysRemaining: number | null;
  currency?: string | null;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  durationDays: number;
  paymentDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  notes: string | null;
  createdAt: string;
}

export interface ActivateSubscriptionDto {
  monthlyPrice: number;
  durationMonths: number;
  notes?: string;
}

export interface RenewSubscriptionDto {
  monthlyPrice: number;
  durationMonths: number;
  notes?: string;
}

export const useSubscriptionApi = () => {
  const { get, post, patch } = useSecureApi();

  // Obtenir les détails de l'abonnement
  const getSubscriptionDetails = async (companyId: string): Promise<SubscriptionDetails | null> => {
    try {
      const response = await get<ApiResponse<SubscriptionDetails>>(`/api/subscriptions/${companyId}`);
      return (response as any) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'abonnement:', error);
      throw error;
    }
  };

  // Activer un abonnement
  const activateSubscription = async (companyId: string, data: ActivateSubscriptionDto): Promise<{ message: string; company: any; payment: any }> => {
    try {
      const response = await post<ApiResponse<{ message: string; company: any; payment: any }>>(`/api/subscriptions/${companyId}/activate`, data);
      return (response as any);
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'abonnement:', error);
      throw error;
    }
  };

  // Renouveler un abonnement
  const renewSubscription = async (companyId: string, data: RenewSubscriptionDto): Promise<{ message: string; company: any; payment: any }> => {
    try {
      const response = await post<ApiResponse<{ message: string; company: any; payment: any }>>(`/api/subscriptions/${companyId}/renew`, data);
      return (response as any);
    } catch (error) {
      console.error('Erreur lors du renouvellement de l\'abonnement:', error);
      throw error;
    }
  };

  // Obtenir l'historique des paiements
  const getPaymentHistory = async (companyId: string): Promise<PaymentHistory[]> => {
    try {
      const response = await get<ApiResponse<PaymentHistory[]>>(`/api/subscriptions/${companyId}/payments`);
      return (response as any) || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
      throw error;
    }
  };

  // Mettre à jour les notes
  const updateNotes = async (companyId: string, notes: string): Promise<{ message: string; company: any }> => {
    try {
      const response = await patch<ApiResponse<{ message: string; company: any }>>(`/api/subscriptions/${companyId}/notes`, { notes });
      return (response as any);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error);
      throw error;
    }
  };

  return {
    getSubscriptionDetails,
    activateSubscription,
    renewSubscription,
    getPaymentHistory,
    updateNotes,
  };
};
