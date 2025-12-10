import { useSecureApi } from '~/composables/useSecureApi';
import type { ApiResponse, PaginatedResponse } from './config';

// Types pour les pointages
export interface Attendance {
  id: string;
  employeeId: string;
  type: 'ENTREE' | 'SORTIE';
  location?: string;
  notes?: string;
  employee?: {
    id: string;
    fullName: string;
    matricule: string;
    department: string;
  };
  createdAt: string;
  heurePointage?: string;
  updatedAt: string;
}

export interface CreateAttendanceDto {
  employeeId: string;
  type: 'ENTREE' | 'SORTIE';
  location?: string;
  notes?: string;
}

export interface ScanAttendanceDto {
  qrCode: string;
  type: 'ENTREE' | 'SORTIE';
  location?: string;
  notes?: string;
}

export interface AttendanceQueryParams {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'ENTREE' | 'SORTIE';
  limit?: number;
}

export const useAttendanceApi = () => {
  const { get, post } = useSecureApi();

  // Obtenir les pointages avec filtres
  const getAttendances = async (params?: AttendanceQueryParams): Promise<Attendance[]> => {
    try {
      const response = await get<ApiResponse<Attendance[]>>('/api/attendance', { params });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pointages:', error);
      throw error;
    }
  };

  // Créer un pointage manuel
  const createAttendance = async (data: CreateAttendanceDto): Promise<Attendance | null> => {
    try {
      const response = await post<ApiResponse<Attendance>>('/api/attendance', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la création du pointage:', error);
      throw error;
    }
  };

  // Pointage via QR code (route publique)
  const scanAttendance = async (data: ScanAttendanceDto): Promise<Attendance | null> => {
    try {
      const response = await post<ApiResponse<Attendance>>('/api/attendance/scan', data);
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      throw error;
    }
  };

  // Obtenir les pointages d'un employé pour une date
  const getEmployeeAttendanceForDate = async (
    employeeId: string,
    date: string
  ): Promise<Attendance[]> => {
    try {
      const response = await get<ApiResponse<Attendance[]>>(`/api/attendance/employee/${employeeId}/date/${date}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pointages:', error);
      throw error;
    }
  };

  return {
    getAttendances,
    createAttendance,
    scanAttendance,
    getEmployeeAttendanceForDate,
  };
};
