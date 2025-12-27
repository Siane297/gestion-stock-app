export enum TypeNotification {
  VENTE_NOUVELLE = 'VENTE_NOUVELLE',
  VENTE_IMPORTANTE = 'VENTE_IMPORTANTE',
  ACHAT_NOUVELLE_COMMANDE = 'ACHAT_NOUVELLE_COMMANDE',
  ACHAT_RECEPTION_PARTIELLE = 'ACHAT_RECEPTION_PARTIELLE',
  ACHAT_RECEPTION_COMPLETE = 'ACHAT_RECEPTION_COMPLETE',
  STOCK_FAIBLE = 'STOCK_FAIBLE',
  STOCK_RUPTURE = 'STOCK_RUPTURE',
  INVENTAIRE_NOUVEAU = 'INVENTAIRE_NOUVEAU',
  INVENTAIRE_VALIDE = 'INVENTAIRE_VALIDE',
  SYSTEME_INFO = 'SYSTEME_INFO',
  SYSTEME_ALERTE = 'SYSTEME_ALERTE',
}

export interface CreateNotificationDto {
  type: TypeNotification;
  titre: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  destinataire_id?: string;
  emetteur_id?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  type: string;
  titre: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  est_lue: boolean;
  date_lecture?: string;
  date_creation: string;
  emetteur?: {
    id: string;
    nom: string;
    prenom: string;
  };
  metadata?: Record<string, any>;
}

export interface GetNotificationsQuery {
  limit?: number;
  offset?: number;
  est_lue?: boolean;
  type?: TypeNotification;
}
