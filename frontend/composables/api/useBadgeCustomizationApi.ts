import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

// Interface pour la personnalisation du badge
export interface BadgeCustomization {
  id: string;
  companyId: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface pour la création/mise à jour
export interface UpsertBadgeCustomizationDto {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  isActive?: boolean;
}

export const useBadgeCustomizationApi = () => {
  const { get, post, delete: del } = useSecureApi();

  // Récupérer la configuration de personnalisation
  const getBadgeCustomization = async (): Promise<BadgeCustomization | null> => {
    try {
      const response = await get<ApiResponse<BadgeCustomization>>('/api/badge-customization');
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la personnalisation:', error);
      return null;
    }
  };

  // Créer ou mettre à jour la personnalisation
  const upsertBadgeCustomization = async (data: UpsertBadgeCustomizationDto): Promise<BadgeCustomization | null> => {
    try {
      const response = await post<ApiResponse<BadgeCustomization>>('/api/badge-customization', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la personnalisation:', error);
      throw error;
    }
  };

  // Supprimer la personnalisation
  const deleteBadgeCustomization = async (): Promise<void> => {
    try {
      await del<ApiResponse<void>>('/api/badge-customization');
    } catch (error) {
      console.error('Erreur lors de la suppression de la personnalisation:', error);
      throw error;
    }
  };

  return {
    getBadgeCustomization,
    upsertBadgeCustomization,
    deleteBadgeCustomization,
  };
};
