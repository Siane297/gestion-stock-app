import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export class GoogleDriveService {
  private static authClient: any = null;
  private static driveClient: any = null;

  private static async getDriveClient() {
    if (this.driveClient) return this.driveClient;

    try {
      const keyFilePath = path.join(process.cwd(), 'service-account.json');
      
      if (!fs.existsSync(keyFilePath)) {
        throw new Error('Le fichier service-account.json est manquant à la racine du backend');
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: SCOPES,
      });

      this.driveClient = google.drive({ version: 'v3', auth });
      return this.driveClient;
    } catch (error) {
      console.error('❌ [Google Drive] Erreur d\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Trouve ou crée un dossier dans Google Drive
   */
  private static async findOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
    const drive = await this.getDriveClient();
    
    let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }

    // Création du dossier
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return file.data.id!;
  }

  /**
   * Upload d'une image/fichier vers Google Drive
   * @param filePath Chemin local du fichier
   * @param folderPath Chemin "virtuel" (ex: "Produits/123") - sera converti en structure de dossiers
   * @returns L'ID du fichier et son lien webView
   */
  static async uploadFile(filePath: string, folderName: string, fileName?: string) {
    try {
      const drive = await this.getDriveClient();
      
      // 1. Gérer le dossier parent (racine ou spécifique)
      const rootFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
      if (!rootFolderId) {
        throw new Error('Configuration manquante: GOOGLE_DRIVE_PARENT_FOLDER_ID n\'est pas défini dans le .env');
      }
      
      console.log(`🔍 [Google Drive] Verification accès dossier racine: ${rootFolderId}`);
      try {
        await drive.files.get({ fileId: rootFolderId, supportsAllDrives: true });
      } catch (e) {
        throw new Error(`Le compte de service ne peut pas accéder au dossier ${rootFolderId}. Vérifiez que vous avez bien partagé ce dossier avec l'email du compte de service (client_email dans service-account.json) et qu'il a le rôle Éditeur.`);
      }

      // 2. Créer/Trouver le sous-dossier (ex: "Produits")
      const targetFolderId = await this.findOrCreateFolder(folderName, rootFolderId);

      const metadata = {
        name: fileName || path.basename(filePath),
        parents: [targetFolderId],
      };

      const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath),
      };

      console.log(`📤 [Google Drive] Upload vers le dossier: ${targetFolderId}`);

      const file = await drive.files.create({
        requestBody: metadata,
        media: media,
        fields: 'id, webContentLink, webViewLink',
        supportsAllDrives: true, 
      });

      // Rendre le fichier public (lecteur) pour affichage
      await drive.permissions.create({
        fileId: file.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log(`✅ [Google Drive] Fichier uploadé: ${file.data.id}`);
      return {
        id: file.data.id,
        url: file.data.webViewLink,    // Lien de prévisualisation
        downloadUrl: file.data.webContentLink // Lien de téléchargement direct
      };

    } catch (error) {
      console.error('❌ [Google Drive] Erreur upload:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier
   */
  static async deleteFile(fileId: string) {
    try {
      const drive = await this.getDriveClient();
      await drive.files.delete({
        fileId: fileId,
      });
      console.log(`✅ [Google Drive] Fichier supprimé: ${fileId}`);
    } catch (error) {
      console.error('❌ [Google Drive] Erreur suppression:', error);
      // Ne pas bloquer si déjà supprimé
    }
  }
}
