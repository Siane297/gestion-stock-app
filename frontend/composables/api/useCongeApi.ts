import { useSecureApi } from '~/composables/useSecureApi'
import type { ApiResponse } from './config'

export interface TypeConge {
  id: string
  nom: string
  description?: string
  estPaye: boolean
  necessiteDocument: boolean
  couleur?: string
  estActif: boolean
}

export interface Conge {
  id: string
  employeId: string
  typeCongeId: string
  dateDebut: string
  dateFin: string
  nombreJours: number
  raison?: string
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE' | 'ANNULE'
  documentUrl?: string
  employe?: any
  typeConge?: TypeConge
}

export interface CreateCongeDto {
  employeId: string
  typeCongeId: string
  dateDebut: string
  dateFin: string
  raison?: string
  documentUrl?: string
}

export interface CongeQueryParams {
  statut?: string
  dateDebut?: string
  dateFin?: string
  employeId?: string
}

export const useCongeApi = () => {
  const { get, post, patch, delete: del } = useSecureApi()

  /**
   * Obtenir tous les types de congés
   */
  const getTypesConges = async (): Promise<TypeConge[]> => {
    try {
      const response = await get<ApiResponse<TypeConge[]>>('/api/conges/types')
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des types de congés:', error)
      throw error
    }
  }

  /**
   * Créer une demande de congé
   */
  const creerConge = async (data: CreateCongeDto): Promise<Conge | null> => {
    try {
      const response = await post<ApiResponse<Conge>>('/api/conges', data)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la création de la demande de congé:', error)
      throw error
    }
  }

  /**
   * Obtenir les congés d'un employé
   */
  const getCongesEmploye = async (
    employeId: string,
    params?: Omit<CongeQueryParams, 'employeId'>
  ): Promise<Conge[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.statut) queryParams.append('statut', params.statut)
      if (params?.dateDebut) queryParams.append('dateDebut', params.dateDebut)
      if (params?.dateFin) queryParams.append('dateFin', params.dateFin)

      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await get<ApiResponse<Conge[]>>(`/api/conges/employe/${employeId}${query}`)
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des congés:', error)
      throw error
    }
  }

  /**
   * Obtenir tous les congés dans une période
   */
  const getCongesParPeriode = async (params: {
    dateDebut: string
    dateFin: string
    statut?: string
    employeId?: string
  }): Promise<Conge[]> => {
    try {
      const queryParams = new URLSearchParams({
        dateDebut: params.dateDebut,
        dateFin: params.dateFin,
      })
      if (params.statut) queryParams.append('statut', params.statut)
      if (params.employeId) queryParams.append('employeId', params.employeId)

      const response = await get<ApiResponse<Conge[]>>(`/api/conges/periode?${queryParams.toString()}`)
      return response.data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des congés:', error)
      throw error
    }
  }

  /**
   * Modifier le statut d'un congé
   */
  const modifierStatutConge = async (
    id: string,
    statut: 'APPROUVE' | 'REFUSE' | 'ANNULE'
  ): Promise<Conge | null> => {
    try {
      const response = await patch<ApiResponse<Conge>>(`/api/conges/${id}/statut`, { statut })
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error)
      throw error
    }
  }

  /**
   * Annuler un congé
   */
  const annulerConge = async (id: string): Promise<Conge | null> => {
    try {
      const response = await del<ApiResponse<Conge>>(`/api/conges/${id}`)
      return response.data || null
    } catch (error) {
      console.error('Erreur lors de l\'annulation du congé:', error)
      throw error
    }
  }

  return {
    getTypesConges,
    creerConge,
    getCongesEmploye,
    getCongesParPeriode,
    modifierStatutConge,
    annulerConge,
  }
}

