/**
 * Composable pour gérer les appels API liés à l'utilisateur
 */

import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface User {
  id: string;
  name?: string;  // Pour les Admin
  email: string;
  image?: string;
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'MANAGER' | 'RH';
  isActive?: boolean;
  createdAt: string;
  permissions?: string[];  // Pour les TenantUsers
  employee?: {  // Pour les TenantUsers
    id: string;
    matricule: string;
    fullName: string;
    department: string;
    position: string;
  };
  company?: {
    id: string;
    name: string;
    country?: string;
    schemaName?: string;
    email?: string;
    address?: string;
    logo?: string;
    subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
    daysRemaining?: number;
  };
}

export interface UserSession {
  user: User;
  session: {
    expiresAt: Date;
    createdAt: Date;
  };
}

/**
 * Hook pour récupérer les informations de l'utilisateur connecté
 */
export const useUserApi = () => {
  const { get, put } = useSecureApi();

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await get<ApiResponse<User>>('/api/users/me');
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour le profil utilisateur
   */
  const updateUserProfile = async (data: { 
    name?: string; 
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    pin?: string;
  }): Promise<User | null> => {
    try {
      const response = await put<ApiResponse<User>>('/api/users/profile', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  return {
    getCurrentUser,
    updateUserProfile,
  };
};

/**
 * Helper pour formater le rôle en français
 */
export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': 'Super Administrateur',
    'ADMIN': 'Administrateur',
    'MANAGER': 'Manager',
    'STORE_MANAGER': 'Gérant',
    'STOCK_MANAGER': 'Responsable Stock',
    'SELLER': 'Vendeur',
    'ACCOUNTANT': 'Comptable',
    'USER': 'Utilisateur',
    'RH': 'Ressources Humaines',
  };
  return roleMap[role] || role;
};

/**
 * Composable pour obtenir et gérer l'état utilisateur
 */
export const useCurrentUser = () => {
  const user = useState<User | null>('currentUser', () => null);
  const isLoading = useState<boolean>('userLoading', () => false);
  const { getCurrentUser } = useUserApi();

  /**
   * Charger les données utilisateur
   */
  const fetchUser = async () => {
    isLoading.value = true;
    try {
      const userData = await getCurrentUser();
      user.value = userData;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Réinitialiser l'état utilisateur
   */
  const clearUser = () => {
    user.value = null;
  };

  return {
    user,
    isLoading,
    fetchUser,
    clearUser,
  };
};
