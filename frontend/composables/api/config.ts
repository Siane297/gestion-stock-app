// Configuration de l'API
// Helper pour obtenir l'URL de base de l'API
export const useApiBaseURL = () => {
  const config = useRuntimeConfig();
  return config.public.apiBase || 'http://localhost:3001';
};

// Configuration statique (sans baseURL dynamique)
export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials, // Inclure les cookies dans toutes les requêtes
};

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  employees: T[]; // Le backend retourne 'employees' et non 'data'
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Gestion des erreurs API
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper pour gérer les erreurs
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  // $fetch de Nuxt met les données dans error.data directement
  if (error.data?.message) {
    return error.data.message;
  }
  
  // Axios met les données dans error.response.data
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Message d'erreur générique
  if (error.message) {
    return error.message;
  }
  
  return 'Une erreur est survenue';
};

// Helper pour obtenir le token (localStorage ou cookie)
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Helper pour définir les headers d'authentification
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
