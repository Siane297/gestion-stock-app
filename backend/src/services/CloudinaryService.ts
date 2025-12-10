import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

/**
 * Service pour gérer les uploads d'images vers Cloudinary
 */
export class CloudinaryService {
  private static isConfigured = false;

  /**
   * Configurer Cloudinary avec les credentials
   */
  private static configure() {
    if (this.isConfigured) return;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.isConfigured = true;
    console.log('☁️ [Cloudinary] Configuré avec succès');
  }

  /**
   * Uploader une image vers Cloudinary
   * @param filePath - Chemin local du fichier ou buffer
   * @param folder - Dossier dans Cloudinary (ex: 'logos', 'pdf-headers')
   * @param publicId - ID public optionnel (nom du fichier dans Cloudinary)
   */
  static async uploadImage(
    filePath: string,
    folder: string,
    publicId?: string
  ): Promise<UploadApiResponse> {
    this.configure();

    try {
      console.log(`📤 [Cloudinary] Upload vers le dossier: ${folder}`);
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `pointage/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
      });

      console.log(`✅ [Cloudinary] Image uploadée: ${result.secure_url}`);
      return result;
    } catch (error) {
      console.error('❌ [Cloudinary] Erreur upload:', error);
      throw new Error('Erreur lors de l\'upload vers Cloudinary');
    }
  }

  /**
   * Supprimer une image de Cloudinary
   * @param publicId - ID public de l'image (ex: 'pointage/logos/company-123')
   */
  static async deleteImage(publicId: string): Promise<void> {
    this.configure();

    try {
      console.log(`🗑️ [Cloudinary] Suppression de: ${publicId}`);
      
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      console.log(`✅ [Cloudinary] Image supprimée`);
    } catch (error) {
      console.error('❌ [Cloudinary] Erreur suppression:', error);
      throw new Error('Erreur lors de la suppression sur Cloudinary');
    }
  }

  /**
   * Extraire le public_id d'une URL Cloudinary
   * @param url - URL Cloudinary complète
   * @returns Le public_id extrait
   */
  static extractPublicId(url: string): string {
    // Décoder l'URL pour gérer les caractères encodés (%20 → espace)
    const decodedUrl = decodeURIComponent(url);
    
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
    const match = decodedUrl.match(regex);
    return (match && match[1]) ? match[1] : decodedUrl;
  }

  /**
   * Obtenir l'URL d'une image Cloudinary
   * @param publicId - ID public de l'image
   * @returns URL complète de l'image
   */
  static getImageUrl(publicId?: string): string | undefined {
    if (!publicId) return undefined;
    this.configure();
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'image',
    });
  }
}
