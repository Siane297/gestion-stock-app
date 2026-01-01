import { PrismaClient } from '@prisma/client';
import { prismaPublic } from './tenantService.js';
import { logger } from '../config/logger.js';
import { CloudinaryService } from './CloudinaryService.js';
import fs from 'fs/promises';
import path from 'path';

export class CompanyService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaPublic;
  }

  /**
   * Helper pour supprimer un fichier local basé sur le publicId Cloudinary
   */
  private async deleteLocalFile(publicId: string) {
    try {
      const parts = publicId.split('/');
      const filePattern = parts[parts.length - 1];
      
      if (!filePattern) return;
      
      const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
      
      // Vérifier si le dossier existe avant de le lire
      try {
        await fs.access(uploadsDir);
      } catch {
        return; // Le dossier n'existe pas, rien à faire
      }

      const companyFolders = await fs.readdir(uploadsDir);
      
      for (const folder of companyFolders) {
        const folderPath = path.join(uploadsDir, folder);
        const stats = await fs.stat(folderPath);
        
        if (stats.isDirectory()) {
          const files = await fs.readdir(folderPath);
          const matchingFiles = files.filter(file => file.includes(filePattern));
          
          for (const file of matchingFiles) {
            const filePath = path.join(folderPath, file);
            await fs.unlink(filePath);
            console.log(`🗑️ [Local] Fichier supprimé: ${filePath}`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ [Local] Impossible de supprimer le fichier local:`, error);
    }
  }

  async getById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        emailOrganisation: true,
        schemaName: true,
        address: true,
        country: true,
        telephoneOrganisation: true,
        logo: true,
        pdfHeader: true,
        currency: true,
      }
    });

    if (!company) {
      throw new Error('Organisation non trouvée');
    }

    return company;
  }

  async update(id: string, data: any) {
    const { name, emailOrganisation, address, country, telephoneOrganisation } = data;

    return await this.prisma.company.update({
      where: { id },
      data: {
        name,
        emailOrganisation,
        address,
        country,
        telephoneOrganisation,
      },
    });
  }

  async uploadLogo(id: string, file: Express.Multer.File) {
    const oldCompany = await this.prisma.company.findUnique({
      where: { id },
      select: { logo: true, name: true }
    });

    if (oldCompany?.logo) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldCompany.logo);
        await CloudinaryService.deleteImage(publicId);
        await this.deleteLocalFile(publicId);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancien logo:', error);
      }
    }

    const companyName = oldCompany?.name || 'default';
    const publicId = `${companyName}-logo-${Date.now()}`;
    
    const result = await CloudinaryService.uploadImage(
      file.path,
      'logos',
      publicId
    );

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: { logo: result.secure_url },
    });

    console.log(`✅ [Local] Fichier conservé en local: ${file.path}`);

    return {
      logo: result.secure_url,
      company: updatedCompany,
    };
  }

  async deleteLogo(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { logo: true }
    });

    if (!company?.logo) {
      throw new Error('Aucun logo à supprimer');
    }

    const publicId = CloudinaryService.extractPublicId(company.logo);
    await CloudinaryService.deleteImage(publicId);
    await this.deleteLocalFile(publicId);

    return await this.prisma.company.update({
      where: { id },
      data: { logo: null },
    });
  }

  async uploadPdfHeader(id: string, file: Express.Multer.File) {
    const oldCompany = await this.prisma.company.findUnique({
      where: { id },
      select: { pdfHeader: true, name: true }
    });

    if (oldCompany?.pdfHeader) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldCompany.pdfHeader);
        await CloudinaryService.deleteImage(publicId);
        await this.deleteLocalFile(publicId);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancien en-tête:', error);
      }
    }

    const companyName = oldCompany?.name || 'default';
    const publicId = `${companyName}-header-${Date.now()}`;
    
    const result = await CloudinaryService.uploadImage(
      file.path,
      'pdf-headers',
      publicId
    );

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: { pdfHeader: result.secure_url },
    });

    console.log(`✅ [Local] Fichier conservé en local: ${file.path}`);

    return {
      pdfHeader: result.secure_url,
      company: updatedCompany,
    };
  }

  async deletePdfHeader(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { pdfHeader: true }
    });

    if (!company?.pdfHeader) {
      throw new Error('Aucun en-tête PDF à supprimer');
    }

    const publicId = CloudinaryService.extractPublicId(company.pdfHeader);
    await CloudinaryService.deleteImage(publicId);
    await this.deleteLocalFile(publicId);

    return await this.prisma.company.update({
      where: { id },
      data: { pdfHeader: null },
    });
  }
}
