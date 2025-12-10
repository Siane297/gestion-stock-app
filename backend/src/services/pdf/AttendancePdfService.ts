import { BasePdfService, PdfGenerationOptions } from './BasePdfService.js';
import { formatTimeWithTimezone, formatDateWithTimezone } from '../../utils/dateUtils.js';
import path from 'path';

export interface AttendanceData {
  id: string;
  employee: {
    fullName: string;
    phoneNumber?: string;
    matricule?: string;
  };
  type: 'ENTREE' | 'SORTIE';
  heurePointage: Date;
  location?: string;
  notes?: string;
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
 * Service de génération PDF pour les pointages/attendances
 * Utilise le format PORTRAIT pour les rapports de pointages
 */
export class AttendancePdfService extends BasePdfService {

  /**
   * Générer un PDF de la liste des pointages
   */
  public static async generateAttendanceList(
    attendances: AttendanceData[],
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
    
    // Grouper les attendances par employé et date
    interface GroupedAttendance {
      fullName: string;
      matricule: string;
      date: string;
      heureEntree?: string;
      heureSortie?: string;
      statut: 'EN_COURS' | 'TERMINE';
    }

    const groupsMap = new Map<string, GroupedAttendance>();

    // Trier par date croissante pour traiter dans l'ordre
    const sortedAttendances = [...attendances].sort((a, b) => 
      new Date(a.heurePointage).getTime() - new Date(b.heurePointage).getTime()
    );

    sortedAttendances.forEach(att => {
      const dateStr = formatDateWithTimezone(att.heurePointage, company.country);
      const timeStr = formatTimeWithTimezone(att.heurePointage, company.country);
      const key = `${att.employee.matricule || att.employee.fullName}-${dateStr}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          fullName: att.employee.fullName || 'Inconnu',
          matricule: att.employee.matricule || 'N/A',
          date: dateStr,
          statut: 'EN_COURS'
        });
      }

      const group = groupsMap.get(key)!;

      if (att.type === 'ENTREE') {
        if (!group.heureEntree) {
          group.heureEntree = timeStr;
        }
      } else if (att.type === 'SORTIE') {
        group.heureSortie = timeStr;
        group.statut = 'TERMINE';
      }
    });

    // Convertir en tableau et trier par date décroissante
    const groupedAttendances = Array.from(groupsMap.values()).sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });

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
      attendances: groupedAttendances,
      metadata: {
        generatedAt: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        generatedBy: context.userId,
        tenantId: context.tenantId,
        totalAttendances: groupedAttendances.length
      },
      // Date de génération à la racine pour le template
      generatedAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    };

    // Générer le PDF avec template attendance-list.html (format landscape)
    return await this.generatePdf('attendance-list', templateData, 'attendance');
  }
}
