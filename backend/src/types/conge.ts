export interface TypeConge {
  id: string;
  nom: string;
  description?: string;
  estPaye: boolean;
  necessiteDocument: boolean;
  couleur?: string;
  estActif: boolean;
}

export interface Conge {
  id: string;
  employeId: string;
  typeCongeId: string;
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  raison?: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE' | 'ANNULE';
  documentUrl?: string;
  employe?: any;
  typeConge?: TypeConge;
}

export interface CreerCongeDto {
  employeId: string;
  typeCongeId: string;
  dateDebut: string;
  dateFin: string;
  raison?: string;
  documentUrl?: string;
}
