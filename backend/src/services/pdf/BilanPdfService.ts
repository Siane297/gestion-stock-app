import { BasePdfService, PdfGenerationOptions } from './BasePdfService.js';
import { formatTimeWithTimezone, formatDateWithTimezone } from '../../utils/dateUtils.js';
import path from 'path';

export interface BilanData {
  id: string;
  date: Date | string;
  employe: {
    matricule: string;
    fullName: string;
    department: string;
    position: string;
  };
  statut: 'A_L_HEURE' | 'EN_RETARD' | 'ABSENT' | 'INCOMPLET'|'EN_CONGE';
  heureEntree: string | null;
  heureSortie: string | null;
  dureeTravailMinutes: number;
  retardMinutes: number;
  notes: string | null;
}

export interface CompanyData {
  name: string;
  country?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  pdfHeader?: string;
}

/**
 * Service de génération PDF pour les bilans de présence
 * Utilise le format PAYSAGE pour afficher toutes les colonnes
 */
export class BilanPdfService extends BasePdfService {

  /**
   * Générer un PDF de la liste des bilans de présence
   */
  public static async generateBilanList(
    bilans: BilanData[],
    company: CompanyData,
    context: { tenantId: string; userId: string }
  ): Promise<Buffer> {
    // Fonction helper pour convertir les images en base64 data URLs
    const convertToBase64 = async (relativePath?: string): Promise<string | undefined> => {
      if (!relativePath) return undefined;
      
      try {
        let imageBuffer: Buffer;
        
        // Vérifier si c'est une URL complète (Cloudinary)
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
          console.log(`🌐 [PDF] Téléchargement depuis Cloudinary: ${relativePath}`);
          const response = await fetch(relativePath);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          console.log(`✅ [PDF] Image téléchargée depuis Cloudinary (${imageBuffer.length} bytes)`);
        } else {
          // Chemin relatif - essayer de lire localement puis via API
          const fs = await import('fs/promises');
          let basePath = process.cwd();
          
          if (basePath.endsWith('/src') || basePath.endsWith('\\src')) {
            basePath = path.dirname(basePath);
          }
          
          const absolutePath = path.join(basePath, relativePath);
          
          console.log(`🖼️ [PDF] Tentative de lecture image: ${relativePath}`);
          
          try {
            imageBuffer = await fs.readFile(absolutePath);
            console.log(`✅ [PDF] Image lue depuis le système de fichiers local`);
          } catch (fsError) {
            // Si la lecture locale échoue (production), télécharger via HTTP
            console.log(`⚠️ [PDF] Fichier non trouvé localement, tentative de téléchargement HTTP`);
            
            const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
            const imageUrl = `${baseUrl}/${relativePath}`;
            
            console.log(`🌐 [PDF] Téléchargement depuis: ${imageUrl}`);
            
            const response = await fetch(imageUrl);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
            console.log(`✅ [PDF] Image téléchargée via HTTP (${imageBuffer.length} bytes)`);
          }
        }
        
        // Déterminer le type MIME basé sur l'extension
        const ext = path.extname(relativePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };
        const mimeType = mimeTypes[ext] || 'image/png';
        
        // Convertir en base64 et retourner data URL
        const base64 = imageBuffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;
        console.log(`✅ [PDF] Image convertie en base64 (${base64.length} caractères)`);
        return dataUrl;
      } catch (error) {
        console.error(`⚠️ [PDF] Erreur conversion image en base64 (${relativePath}):`, error);
        return undefined;
      }
    };
    
    
    // Convertir le logo par défaut en base64 si nécessaire
    let defaultLogo: string | undefined;
    if (!company.logo) {
      defaultLogo = await convertToBase64('templates/logo/LOGO_P.png');
    }

    // Préparer les données pour le template
    const templateData = {
      company: {
        name: company.name || 'Entreprise',
        country: company.country,
        email: company.email,
        phone: company.phone,
        address: company.address,
        logo: await convertToBase64(company.logo) || defaultLogo,
        pdfHeader: await convertToBase64(company.pdfHeader)
      },
      bilans: bilans.map(bilan => ({
        matricule: bilan.employe.matricule || 'N/A',
        employe: bilan.employe.fullName || 'Inconnu',
        date: formatDateWithTimezone(bilan.date, company.country),
        statut: bilan.statut,
        heureEntree: bilan.heureEntree ? 
          formatTimeWithTimezone(bilan.heureEntree, company.country) : 
          null,
        heureSortie: bilan.heureSortie ? 
          formatTimeWithTimezone(bilan.heureSortie, company.country) : 
          null,
        duree: this.formatDuration(bilan.dureeTravailMinutes)
      })),
      metadata: {
        generatedAt: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        generatedBy: context.userId,
        tenantId: context.tenantId,
        totalBilans: bilans.length
      },
      // Date de génération à la racine pour le template
      generatedAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    };

    // Générer le PDF avec template bilan-list.html (format paysage)
    return await this.generatePdf('bilan-list', templateData, 'employees');
  }

  /**
   * Formater une durée en minutes vers format hh:mm
   */
  private static formatDuration(minutes: number): string {
    if (!minutes || minutes === 0) return '0h00';
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${hours}h${mins.toString().padStart(2, '0')}`;
  }
}
