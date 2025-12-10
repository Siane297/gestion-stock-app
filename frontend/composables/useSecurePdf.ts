/**
 * Composable pour la génération sécurisée de PDF
 * Compatible avec l'architecture multi-tenant et les tokens sécurisés
 */
import { useSecureApi } from './useSecureApi';
import { useToast } from 'primevue/usetoast';
import { PDF_TYPES, type PdfGenerationOptions } from '~/types/pdf';

export const useSecurePdf = () => {
  const { post } = useSecureApi();
  const toast = useToast();
  
  /**
   * Télécharger un blob en tant que fichier
   */
  const downloadBlob = (blob: Blob, filename: string): void => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [PDF] Téléchargement initié:', filename);
    } catch (error) {
      console.error('❌ [PDF] Erreur lors du téléchargement:', error);
      throw new Error('Impossible de télécharger le fichier PDF');
    }
  };

  /**
   * Générer et télécharger un PDF de manière sécurisée
   */
  const generatePdf = async (options: PdfGenerationOptions): Promise<void> => {
    try {
      console.log('📄 [PDF] Début génération PDF:', options.type);
      
      // Construire l'endpoint selon le type
      const endpoint = `/api/pdf/${options.type}`;
      
      // Appeler l'API avec gestion automatique des tokens sécurisés
      const response = await post(endpoint, options.params || {}, {
        responseType: 'blob', // Important : réponse en format blob
      });
      
      // Vérifier que la réponse est bien un blob PDF
      if (!(response instanceof Blob)) {
        throw new Error('Réponse invalide: PDF attendu');
      }
      
      if (response.type !== 'application/pdf') {
        throw new Error(`Format de fichier invalide: ${response.type}`);
      }
      
      // Utiliser un nom de fichier descriptif selon le type de PDF
      let filename = options.filename;
      if (!filename) {
        const timestamp = new Date().toISOString().split('T')[0];
        const typeName = PDF_TYPES[options.type];
        filename = `${typeName}-${timestamp}.pdf`;
      }
      
      // Télécharger le fichier
      downloadBlob(response, filename);
      
      // Notification de succès
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: `PDF "${filename}" téléchargé avec succès`,
        life: 5000,
      });
      
      console.log('✅ [PDF] PDF généré avec succès:', filename);
      
    } catch (error: any) {
      console.error('❌ [PDF] Erreur génération PDF:', error);
      
      // Messages d'erreur personnalisés selon le contexte
      let errorMessage = 'Erreur lors de la génération du PDF';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'La génération du PDF a pris trop de temps. Veuillez réessayer.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else if (error.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      } else if (error.status === 429) {
        errorMessage = 'Trop de demandes. Veuillez patienter avant de réessayer.';
      } else if (error.status >= 500) {
        errorMessage = 'Erreur serveur. Veuillez contacter le support technique.';
      }
      
      // Notification d'erreur
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: errorMessage,
        life: 8000,
      });
      
      // Re-lancer l'erreur pour permettre la gestion au niveau composant
      throw new Error(errorMessage);
    }
  };

  /**
   * Générer PDF de la liste des employés
   */
  const generateEmployeesPdf = async (filename?: string): Promise<void> => {
    await generatePdf({
      type: 'employees',
      filename,
    });
  };

  /**
   * Générer PDF de l'historique des pointages
   */
  const generateAttendancesPdf = async (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }, filename?: string): Promise<void> => {
    await generatePdf({
      type: 'attendances',
      params,
      filename,
    });
  };

  /**
   * Générer PDF de la liste des utilisateurs
   */
  const generateUsersPdf = async (filename?: string): Promise<void> => {
    await generatePdf({
      type: 'users',
      filename,
    });
  };

  /**
   * Générer PDF des bilans de présence
   */
  const generateBilansPdf = async (filename?: string): Promise<void> => {
    await generatePdf({
      type: 'bilans',
      filename,
    });
  };

  /**
   * Générer PDF de la liste des congés
   */
  const generateCongesPdf = async (filename?: string): Promise<void> => {
    await generatePdf({
      type: 'conges',
      filename,
    });
  };

  return {
    // Fonction générique
    generatePdf,
    
    // Fonctions spécialisées
    generateEmployeesPdf,
    generateAttendancesPdf,
    generateUsersPdf,
    generateBilansPdf,
    generateCongesPdf,
  };
};
