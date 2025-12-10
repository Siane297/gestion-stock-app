import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse, PaginatedResponse } from './config';

// Types pour les employés
export interface Employee {
  id: string;
  matricule: string;
  fullName: string;
  email?: string;
  photo?: string;
  positionId: string;
  departmentId: string;
  position?: { id: string; name: string };
  department?: { id: string; name: string } | string;
  phoneNumber?: string;
  address?: string;
  sexe?: 'MASCULIN' | 'FEMININ';
  dateNaissance?: string;
  qrCode?: string;
  isActive?: boolean;
  hireDate?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  matricule: string;
  fullName: string;
  email?: string;
  positionId: string;
  departmentId: string;
  phoneNumber?: string;
  address?: string;
  sexe?: 'MASCULIN' | 'FEMININ';
  dateNaissance?: string;
}

export interface UpdateEmployeeDto {
  fullName?: string;
  email?: string;
  positionId?: string;
  departmentId?: string;
  phoneNumber?: string;
  address?: string;
  sexe?: 'MASCULIN' | 'FEMININ';
  dateNaissance?: string;
  isActive?: boolean;
}

export interface EmployeeQueryParams {
  search?: string;
  department?: string;
  isActive?: boolean;
}

export const useEmployeeApi = () => {
  const { get, post, put, delete: del } = useSecureApi();

  // Obtenir tous les employés avec filtres
  const getEmployees = async (params?: EmployeeQueryParams): Promise<Employee[]> => {
    try {
      const response = await get<ApiResponse<Employee[]>>('/api/employees', { params });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  };

  // Obtenir un employé par ID
  const getEmployeeById = async (id: string): Promise<Employee | null> => {
    try {
      const response = await get<ApiResponse<Employee>>(`/api/employees/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  };

  // Rechercher un employé par QR code
  const getEmployeeByQrCode = async (qrCode: string): Promise<Employee | null> => {
    try {
      const response = await get<ApiResponse<Employee>>(`/api/employees/qr/${qrCode}`);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé par QR code:', error);
      throw error;
    }
  };

  // Créer un nouvel employé
  const createEmployee = async (data: CreateEmployeeDto): Promise<Employee | null> => {
    try {
      const response = await post<ApiResponse<Employee>>('/api/employees', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création de l\'employé:', error);
      throw error;
    }
  };

  // Mettre à jour un employé
  const updateEmployee = async (id: string, employeeData: UpdateEmployeeDto): Promise<Employee | null> => {
    try {
      const response = await put<ApiResponse<Employee>>(`/api/employees/${id}`, employeeData);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      throw error;
    }
  };

  // Supprimer un employé (soft delete)
  const deleteEmployee = async (id: string): Promise<boolean> => {
    try {
      await del(`/api/employees/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      throw error;
    }
  };

  return {
    getEmployees,
    getEmployeeById,
    getEmployeeByQrCode,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
