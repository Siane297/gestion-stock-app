/**
 * Types et constantes pour la génération de PDF
 * Fichier centralisé pour une meilleure maintenabilité
 */

/**
 * Types de PDF disponibles avec leurs noms d'affichage correspondants
 */
export const PDF_TYPES = {
  users: 'Liste-des-Utilisateurs',
  employees: 'Liste-des-Employes',
  attendances: 'Rapport-Pointage',
  bilans: 'Bilan-Presence',
  conges: 'Liste-des-Conges',
  receipt: 'Ticket-de-Caisse'
} as const;

/**
 * Type dérivé des clés de PDF_TYPES pour une validation stricte
 */
export type PdfType = keyof typeof PDF_TYPES;

/**
 * Options pour la génération de PDF
 */
export interface PdfGenerationOptions {
  /**
   * Type de PDF à générer
   */
  type: PdfType;
  
  /**
   * Paramètres supplémentaires pour le PDF
   */
  params?: Record<string, any>;
  
  /**
   * Nom du fichier (optionnel)
   */
  filename?: string;
}

/**
 * Types de configuration PDF côté backend
 */
export type PdfConfigType = 'employees' | 'attendance' | 'bilan' | 'users';

/**
 * Utilitaire pour obtenir le nom d'affichage d'un type PDF
 */
export const getPdfDisplayName = (type: PdfType): string => {
  return PDF_TYPES[type];
};

/**
 * Utilitaire pour valider si un type PDF est valide
 */
export const isValidPdfType = (type: string): type is PdfType => {
  return type in PDF_TYPES;
};
