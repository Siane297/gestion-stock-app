import { BasePdfService, PdfGenerationOptions } from './BasePdfService.js';
import { formatDateWithTimezone } from '../../utils/dateUtils.js';
import path from 'path';

export interface CongeData {
  id: string;
  employe: {
    matricule: string;
    fullName: string;
  };
  typeConge: {
    nom: string;
    couleur?: string;
  };
  dateDebut: Date;
  dateFin: Date;
  nombreJours: number;
  statut: string;
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
 * Service de génération PDF pour les listes de congés
 * Utilise le format PAYSAGE pour accommoder toutes les colonnes
 */
export class CongePdfService extends BasePdfService {

  /**
   * Générer un PDF de la liste des congés
   */
  public static async generateCongeList(
    conges: CongeData[],
    company: CompanyData,
    options: PdfGenerationOptions = {}
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
      conges: conges.map(conge => ({
        matricule: conge.employe.matricule || 'N/A',
        employeeName: conge.employe.fullName || 'Inconnu',
        typeConge: conge.typeConge.nom || 'N/A',
        dateDebut: formatDateWithTimezone(conge.dateDebut, company.country),
        dateFin: formatDateWithTimezone(conge.dateFin, company.country),
        nombreJours: conge.nombreJours,
        statut: conge.statut
      })),
      generatedAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };

    // Générer le PDF avec la configuration "employees" (paysage)
    return await this.generatePdf(
      'conge-list', 
      templateData, 
      'employees',  // Configuration paysage
      options
    );
  }
}
