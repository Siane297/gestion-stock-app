import { BasePdfService } from './BasePdfService.js';
import path from 'path';

/**
 * Service spécialisé pour la génération de PDF des utilisateurs
 * Hérite de BasePdfService pour la gestion Puppeteer et configuration
 */
export class UserPdfService extends BasePdfService {
  
  /**
   * Générer le PDF de la liste des utilisateurs (format portrait)
   * @param users - Liste des utilisateurs avec leurs informations
   * @param company - Informations de l'entreprise
   * @param context - Contexte tenant et utilisateur
   * @returns Buffer du PDF généré
   */
  public static async generateUsersList(
    users: any[],
    company: any,
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
    
    
    console.log('📄 [UserPdfService] Génération PDF liste utilisateurs');
    
    // Convertir le logo par défaut en base64 si nécessaire
    let defaultLogo: string | undefined;
    if (!company.logo) {
      defaultLogo = await convertToBase64('templates/logo/LOGO_P.png');
    }

    // Préparation des données pour le template
    const templateData = {
      company: {
        name: company.name,
        country: company.country,
        email: company.email,
        phone: company.phone,
        address: company.address,
        logo: await convertToBase64(company.logo) || defaultLogo,
        pdfHeader: await convertToBase64(company.pdfHeader)
      },
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        employeeName: user.employee?.fullName || 'N/A',
        employeeMatricule: user.employee?.matricule || 'N/A',
        role: this.formatRole(user.role),
        isOwner: user.isOwner,
        isBlocked: user.isBlocked,
        status: user.isBlocked ? 'Bloqué' : 'Actif',
        statusColor: user.isBlocked ? 'red' : 'green',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || null,
      })),
      // Date de génération pour affichage dans le template
      generatedAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: context.userId,
        tenantId: context.tenantId,
        totalUsers: users.length,
        activeUsers: users.filter(u => !u.isBlocked).length,
        blockedUsers: users.filter(u => u.isBlocked).length,
        ownerUsers: users.filter(u => u.isOwner).length,
      },
      
    };

    console.log(`📊 [UserPdfService] ${users.length} utilisateurs à traiter`);
    
    // Génération du PDF avec le template users-list.html (configuration users = portrait)
    return await this.generatePdf('users-list', templateData, 'users');
  }


  /**
   * Formater le rôle utilisateur pour l'affichage
   * @param role - Rôle brut de la base de données
   * @returns Rôle formaté pour l'affichage
   */
  private static formatRole(role?: string): string {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'MANAGER': 'Manager',
      'EMPLOYEE': 'Employé',
      'OWNER': 'Propriétaire',
    };
    
    return roleMap[role || 'EMPLOYEE'] || 'Employé';
  }

}
