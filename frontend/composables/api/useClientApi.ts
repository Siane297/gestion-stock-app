import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse } from './config';

export interface Client {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  solde_credit?: number;
  limite_credit?: number;
  est_actif: boolean;
  date_creation: string;
  ventes?: Array<{ id: string; montant_total: number; date_creation: string }>;
}

export interface CreateClientDto {
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  limite_credit?: number;
}

export interface UpdateClientDto {
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  limite_credit?: number;
  est_actif?: boolean;
}

export interface UpdateCreditDto {
  montant: number;
  operation: 'add' | 'subtract' | 'set';
}

export interface ClientQueryParams {
  est_actif?: boolean;
  search?: string;
}

export const useClientApi = () => {
  const { get, post, put, patch, delete: del } = useSecureApi();

  const getClients = async (params?: ClientQueryParams): Promise<Client[]> => {
    const response = await get<ApiResponse<Client[]>>('/api/clients', { params });
    return response.data || [];
  };

  const getClientById = async (id: string): Promise<Client | null> => {
    const response = await get<ApiResponse<Client>>(`/api/clients/${id}`);
    return response.data || null;
  };

  const createClient = async (data: CreateClientDto): Promise<Client | null> => {
    const response = await post<ApiResponse<Client>>('/api/clients', data);
    return response.data || null;
  };

  const updateClient = async (id: string, data: UpdateClientDto): Promise<Client | null> => {
    const response = await put<ApiResponse<Client>>(`/api/clients/${id}`, data);
    return response.data || null;
  };

  const updateClientCredit = async (id: string, data: UpdateCreditDto): Promise<Client | null> => {
    const response = await patch<ApiResponse<Client>>(`/api/clients/${id}/credit`, data);
    return response.data || null;
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    await del(`/api/clients/${id}`);
    return true;
  };

  return {
    getClients,
    getClientById,
    createClient,
    updateClient,
    updateClientCredit,
    deleteClient,
  };
};
