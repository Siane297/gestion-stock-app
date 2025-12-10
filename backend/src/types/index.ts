import { Request } from 'express';

// Types pour l'authentification
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

// Types pour les employés
export interface CreateEmployeeDto {
  matricule: string;
  fullName: string;
  email?: string;
  position: string;
  department: string;
  phoneNumber?: string;
  address?: string;
  sexe?: 'MASCULIN' | 'FEMININ';
  dateNaissance?: string | Date;
}

export interface UpdateEmployeeDto {
  fullName?: string;
  email?: string;
  position?: string;
  department?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
  sexe?: 'MASCULIN' | 'FEMININ';
  dateNaissance?: string | Date;
}

// Types pour les présences
export interface CreateAttendanceDto {
  employeeId: string;
  type: 'ENTREE' | 'SORTIE';
  location?: string;
  notes?: string;
}

export interface AttendanceQueryDto {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'ENTREE' | 'SORTIE';
  page?: string;
  limit?: string;
}

// Types pour l'authentification
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';
}

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les erreurs
export interface AppError {
  message: string;
  statusCode: number;
  stack?: string;
}

// Types pour la validation
export interface ValidationError {
  field: string;
  message: string;
}

// Types pour les statistiques
export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  totalEntries: number;
  totalExits: number;
  averageWorkingHours: number;
}

export interface DailyAttendance {
  date: string;
  entries: number;
  exits: number;
  present: number;
}
