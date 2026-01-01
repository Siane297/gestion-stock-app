import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';

export interface Organization {
  id: string;
  name: string;
  email: string;
  emailOrganisation: string;
  telephoneOrganisation: string;
  logo: string | null;
  blocked: boolean;
  createdAt: string;
  employeeCount: number;
  storeCount: number;
  trialEndsAt: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: string | null;
  monthlyPrice: number | null;
  daysRemaining: number | null;
  currency?: string | null;
}

export const useOrganizationApi = () => {
  const { get, patch } = useSecureApi();

  // Récupérer toutes les organisations
  const getAllOrganizations = async (): Promise<Organization[]> => {
    try {
      const response = await get<ApiResponse<Organization[]>>('/api/organizations');
      // $fetch retourne directement le body déjà parsé
      // Notre backend retourne le tableau directement, pas encapsulé dans "data"
      return (response as any) || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des organisations:', error);
      throw error;
    }
  };

  // Basculer le statut de blocage d'une organisation
  const toggleBlockOrganization = async (id: string, blocked: boolean): Promise<{ organization: Organization; message: string }> => {
    try {
      const response = await patch<ApiResponse<{ organization: Organization; message: string }>>(`/api/organizations/${id}/block`, { blocked });
      if (!response.data) throw new Error('Réponse vide');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage de l\'organisation:', error);
      throw error;
    }
  };

  return {
    getAllOrganizations,
    toggleBlockOrganization,
  };
};
