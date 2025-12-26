/**
 * Composable pour la génération sécurisée de PDF
 * Compatible avec l'architecture multi-tenant et les tokens sécurisés
 */
import { useSecureApi } from './useSecureApi';
import { useToast } from 'primevue/usetoast';
import { PDF_TYPES, type PdfGenerationOptions } from '~/types/pdf';

export const useSecurePdf = () => {
  const { post, get } = useSecureApi();
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
        // exposeHeaders: ['Content-Disposition'] // N'est pas une option standard fetch/axios mais utile pour mémo
      });
      
      // La réponse interceptée par useCustomFetch/ofetch retourne directement le body (Blob)
      // Mais on n'a peut-être pas accès aux headers facilement ici si l'intercepteur nettoie tout
      // Si useSecureApi utilise $fetch, response est le body.
      // Il faudrait utiliser `onResponse` pour chopper les headers, ou fetch avec `raw: true` ?
      // Pour l'instant on garde la logique existante pour generatePdf.

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
      handlePdfError(error);
    }
  };

  const handlePdfError = (error: any) => {
      console.error('❌ [PDF] Erreur génération PDF:', error);
      let errorMessage = 'Erreur lors de la génération du PDF';
      
      if (error.message?.includes('timeout')) errorMessage = 'La génération du PDF a pris trop de temps. Veuillez réessayer.';
      else if (error.message?.includes('network')) errorMessage = 'Erreur de connexion.';
      else if (error.status === 401) errorMessage = 'Session expirée.';
      else if (error.status === 403) errorMessage = 'Accès refusé.';
      else if (error.status >= 500) errorMessage = 'Erreur serveur.';
      
      toast.add({ severity: 'error', summary: 'Erreur', detail: errorMessage, life: 8000 });
      throw new Error(errorMessage);
  }

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
   * Générer PDF de la liste des utilisateurs
   */
  const generateUsersPdf = async (filename?: string): Promise<void> => {
    await generatePdf({
      type: 'users',
      filename,
    });
  };

  /**
   * Générer un ticket de caisse via l'API dédiée
   * Utilise GET et récupère le nom du fichier depuis les headers
   */
  /**
   * Générer un ticket de caisse via l'API dédiée
   * Utilise fetch manuellement pour accéder aux headers (Content-Disposition)
   */
  /**
   * Générer un ticket de caisse via l'API dédiée
   * Options: 'download' (défaut), 'print' (ouvre dialog), 'blob' (retourne l'objet)
   */
  const generateReceiptPdf = async (venteId: string, action: 'download' | 'print' | 'blob' = 'download'): Promise<Blob | void> => {
      try {
          console.log(`🧾 [PDF] Demande ticket vente: ${venteId} [${action}]`);
          
          const { accessToken } = useSecureAuth();
          const config = useRuntimeConfig();
          const apiBase = config.public.apiBase || 'http://localhost:3001';
          
          const response = await fetch(`${apiBase}/api/pdf/receipt/${venteId}`, {
              method: 'GET',
              headers: { 
                  'Authorization': `Bearer ${accessToken.value}`,
                  'Content-Type': 'application/json'
              }
          });
          
           if (!response.ok) {
             throw new Error(`Erreur ${response.status}: ${response.statusText}`);
           }
           
           const blob = await response.blob();
           
           // Récupérer le nom du fichier du header
           let filename = `Ticket-${venteId.substring(0, 8)}.pdf`;
           const contentDisposition = response.headers.get('Content-Disposition');
           if (contentDisposition) {
               const match = contentDisposition.match(/filename="?([^"]+)"?/);
               if (match && match[1]) filename = match[1];
           }

           if (action === 'blob') {
               return blob;
           }
           
           if (action === 'download') {
               downloadBlob(blob, filename);
               toast.add({ severity: 'success', summary: 'Succès', detail: `Ticket ${filename} téléchargé`, life: 3000 });
               return;
           }

           if (action === 'print') {
               const blobUrl = URL.createObjectURL(blob);
               // Ouvrir dans un iframe invisible pour imprimer sans popup bloquant ou nouvel onglet si possible
               // Mais le plus fiable cross-browser est une nouvelle fenêtre
               const printWindow = window.open(blobUrl);
               if (printWindow) {
                   printWindow.onload = () => {
                       printWindow.print();
                       // Optionnel: fermer après impression ? Souvent bloqué par sécurité
                   };
               } else {
                   // Fallback si popup bloqué
                   toast.add({ severity: 'warn', summary: 'Impression', detail: 'Veuillez autoriser les popups pour imprimer', life: 5000 });
                   window.open(blobUrl, '_blank');
               }
               // Note: URL.revokeObjectURL devrait être appelé plus tard, mais difficile de savoir quand la fenêtre a fini de charger
               setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); 
               return;
           }

      } catch (err: any) {
          handlePdfError(err);
      }
  };

  /**
   * Générer une facture proforma PDF
   */
  const generateProformaPdf = async (venteId: string, action: 'download' | 'print' = 'download'): Promise<void> => {
      try {
          console.log(`📄 [PDF] Demande proforma vente: ${venteId} [${action}]`);
          
          const { accessToken } = useSecureAuth();
          const config = useRuntimeConfig();
          const apiBase = config.public.apiBase || 'http://localhost:3001';
          
          const response = await fetch(`${apiBase}/api/pdf/proforma/${venteId}`, {
              method: 'GET',
              headers: { 
                  'Authorization': `Bearer ${accessToken.value}`,
                  'Content-Type': 'application/json'
              }
          });
          
           if (!response.ok) {
             throw new Error(`Erreur ${response.status}: ${response.statusText}`);
           }
           
           const blob = await response.blob();
           let filename = `Proforma-${venteId.substring(0, 8)}.pdf`;
           
           const contentDisposition = response.headers.get('Content-Disposition');
           if (contentDisposition) {
               const match = contentDisposition.match(/filename="?([^"]+)"?/);
               if (match && match[1]) filename = match[1];
           }

           if (action === 'download') {
               downloadBlob(blob, filename);
               toast.add({ severity: 'success', summary: 'Succès', detail: `Proforma ${filename} téléchargée`, life: 3000 });
           } else {
               const blobUrl = URL.createObjectURL(blob);
               window.open(blobUrl, '_blank');
           }

      } catch (err: any) {
          handlePdfError(err);
      }
  };

  return {
    generatePdf,
    generateEmployeesPdf,
    generateUsersPdf,
    generateReceiptPdf,
    generateProformaPdf
  };
};
