import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface TenantUser {
  id: string;
  employeeId: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER' | 'RH';
  isBlocked: boolean;
  isOwner?: boolean;
  permissions: string[];
  pin?: string;
  employee?: {
    id: string;
    matricule: string;
    fullName: string;
    email: string;
    department: { name: string };
    position: { name: string };
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateTenantUserDto {
  employeeId: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'USER' | 'RH';
  permissions: string[];
  pin?: string;
}

export interface UpdateTenantUserDto {
  role?: 'ADMIN' | 'MANAGER' | 'USER' | 'RH';
  permissions?: string[];
  password?: string;
  pin?: string;
}

export const useTenantUserApi = () => {
  const { get, post, put, patch, delete: del } = useSecureApi();

  /**
   * Récupérer tous les utilisateurs tenant
   */
  const getAllTenantUsers = async (): Promise<TenantUser[]> => {
    try {
      const response = await get<ApiResponse<TenantUser[]>>('/api/tenant-users');
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs tenant:', error);
      throw error;
    }
  };

  /**
   * Récupérer un utilisateur tenant par ID
   */
  const getTenantUserById = async (id: string): Promise<TenantUser | null> => {
    try {
      const response = await get<ApiResponse<TenantUser>>(`/api/tenant-users/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur tenant:', error);
      throw error;
    }
  };

  /**
   * Créer un utilisateur tenant
   */
  const createTenantUser = async (data: CreateTenantUserDto): Promise<TenantUser | null> => {
    try {
      const response = await post<ApiResponse<TenantUser>>('/api/tenant-users', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur tenant:', error);
      throw error;
    }
  };

  /**
   * Mettre à jour un utilisateur tenant
   */
  const updateTenantUser = async (id: string, data: UpdateTenantUserDto): Promise<TenantUser | null> => {
    try {
      const response = await put<ApiResponse<TenantUser>>(`/api/tenant-users/${id}`, data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur tenant:', error);
      throw error;
    }
  };

  /**
   * Bloquer/Débloquer un utilisateur
   */
  const toggleBlockTenantUser = async (id: string, isBlocked: boolean): Promise<TenantUser | null> => {
    try {
      const response = await patch<ApiResponse<TenantUser>>(`/api/tenant-users/${id}/toggle-block`, { isBlocked });
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage de l\'utilisateur tenant:', error);
      throw error;
    }
  };

  /**
   * Supprimer un utilisateur tenant
   */
  const deleteTenantUser = async (id: string): Promise<boolean> => {
    try {
      await del(`/api/tenant-users/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur tenant:', error);
      throw error;
    }
  };

  return {
    getAllTenantUsers,
    getTenantUserById,
    createTenantUser,
    updateTenantUser,
    toggleBlockTenantUser,
    deleteTenantUser,
  };
};
