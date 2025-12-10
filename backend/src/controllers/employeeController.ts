import type { Request, Response } from 'express';
import type { CreateEmployeeDto, UpdateEmployeeDto, ApiResponse } from '../types/index.js';
import { logger } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { normalizeCalendarDate } from '../utils/dateUtils.js';
import { CloudinaryService } from '../services/CloudinaryService.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Helper pour supprimer un fichier local basé sur le publicId Cloudinary
 */
const deleteLocalEmployeePhoto = async (publicId: string, companyName: string) => {
  try {
    const parts = publicId.split('/');
    const filePattern = parts[parts.length - 1];
    
    if (!filePattern) return;
    
    const uploadsDir = path.join(process.cwd(), 'uploads', 'images', companyName, 'employees');
    
    try {
      const files = await fs.readdir(uploadsDir);
      const matchingFiles = files.filter(file => file.includes(filePattern));
      
      for (const file of matchingFiles) {
        const filePath = path.join(uploadsDir, file);
        await fs.unlink(filePath);
        console.log(`🗑️ [Local] Photo employé supprimée: ${filePath}`);
      }
    } catch (error) {
      // Dossier n'existe pas, c'est OK
    }
  } catch (error) {
    console.log(`⚠️ [Local] Impossible de supprimer la photo locale:`, error);
  }
};

// Obtenir tous les employés
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { search = '', department = '', isActive = 'true' } = req.query;

    const where = {
      isActive: isActive === 'true',
      deletedAt: null, // Exclure les employés supprimés (Soft Delete)
      ...(search && {
        OR: [
          { fullName: { contains: search as string, mode: 'insensitive' } },
          { matricule: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
      ...(department && { department: department as string }),
    };

    const employees = await req.tenantPrisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        matricule: true,
        fullName: true,
        email: true,
        photo: true,
        phoneNumber: true,
        address: true,
        sexe: true,
        dateNaissance: true,
        hireDate: true,
        isActive: true,
        qrCode: true,
        createdAt: true,
        updatedAt: true,
        position: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        attendances: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Employés récupérés avec succès',
      data: employees,
    };

    res.json(response);
  } catch (error) {
    logger.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des employés',
    });
  }
};

// Obtenir un employé par ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await req.tenantPrisma.employee.findUnique({
      where: { id },
      include: {
        position: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        attendances: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    res.json({
      success: true,
      message: 'Employé récupéré avec succès',
      data: employee,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'employé',
    });
  }
};

// Créer un nouvel employé
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employeeData: CreateEmployeeDto = req.body;

    // Vérifier si le matricule existe déjà
    const existingEmployee = await req.tenantPrisma.employee.findUnique({
      where: { matricule: employeeData.matricule },
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Un employé avec ce matricule existe déjà',
      });
    }

    // Vérifier si l'email existe déjà (si fourni)
    if (employeeData.email) {
      const existingEmail = await req.tenantPrisma.employee.findUnique({
        where: { email: employeeData.email },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Un employé avec cet email existe déjà',
        });
      }
    }

    // Générer un code QR unique pour l'employé avec le schéma tenant
    // Format: schemaName:uuid (pour identifier le tenant lors du scan)
    const employeeUuid = uuidv4();
    const qrCode = `${req.tenantSchema}:${employeeUuid}`;

    const employee = await req.tenantPrisma.employee.create({
      data: {
        ...employeeData,
        dateNaissance: employeeData.dateNaissance
          ? normalizeCalendarDate(employeeData.dateNaissance)
          : undefined,
        qrCode,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Employé créé avec succès',
      data: employee,
    });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'employé',
    });
  }
};

// Mettre à jour un employé
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateEmployeeDto = req.body;

    // Vérifier si l'employé existe
    const existingEmployee = await req.tenantPrisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    // Vérifier l'email s'il est modifié
    if (updateData.email && updateData.email !== existingEmployee.email) {
      const existingEmail = await req.tenantPrisma.employee.findUnique({
        where: { email: updateData.email },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Un employé avec cet email existe déjà',
        });
      }
    }

    const employee = await req.tenantPrisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        dateNaissance: updateData.dateNaissance
          ? normalizeCalendarDate(updateData.dateNaissance)
          : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Employé mis à jour avec succès',
      data: employee,
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'employé',
    });
  }
};

// Supprimer un employé (soft delete)
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await req.tenantPrisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    // Soft delete : marquer comme supprimé et inactif
    await req.tenantPrisma.employee.update({
      where: { id },
      data: { 
        isActive: false,
        deletedAt: new Date()
      },
    });

    res.json({
      success: true,
      message: 'Employé supprimé avec succès',
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'employé',
    });
  }
};

// Obtenir un employé par QR code
export const getEmployeeByQrCode = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;

    const employee = await req.tenantPrisma.employee.findUnique({
      where: { qrCode },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé pour ce QR code',
      });
    }

    if (!employee.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Employé inactif',
      });
    }

    res.json({
      success: true,
      message: 'Employé trouvé',
      data: employee,
    });
  } catch (error) {
    logger.error('Erreur lors de la recherche par QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche par QR code',
    });
  }
};

// Upload de la photo d'un employé (Cloudinary)
export const uploadEmployeePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyName = req.companyName || 'default';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      });
    }

    // Vérifier si l'employé existe
    const existingEmployee = await req.tenantPrisma.employee.findUnique({
      where: { id },
      select: { id: true, photo: true, fullName: true }
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    // Supprimer l'ancienne photo de Cloudinary si elle existe
    if (existingEmployee.photo) {
      try {
        const publicId = CloudinaryService.extractPublicId(existingEmployee.photo);
        await CloudinaryService.deleteImage(publicId);
        await deleteLocalEmployeePhoto(publicId, companyName);
      } catch (error) {
        logger.warn('Impossible de supprimer l\'ancienne photo:', error);
      }
    }

    // Upload vers Cloudinary
    const publicId = `${companyName}-employee-${id}-${Date.now()}`;
    
    const result = await CloudinaryService.uploadImage(
      req.file.path,
      'employees',
      publicId
    );

    // Mettre à jour la base de données avec l'URL Cloudinary
    const updatedEmployee = await req.tenantPrisma.employee.update({
      where: { id },
      data: { photo: result.secure_url },
    });

    console.log(`✅ [Photo] Photo employé uploadée: ${result.secure_url}`);

    res.json({
      success: true,
      message: 'Photo uploadée avec succès',
      data: {
        photo: result.secure_url,
        employee: updatedEmployee,
      },
    });
  } catch (error) {
    logger.error('Erreur lors de l\'upload de la photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'upload de la photo',
    });
  }
};

// Supprimer la photo d'un employé (Cloudinary)
export const deleteEmployeePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyName = req.companyName || 'default';

    // Vérifier si l'employé existe et a une photo
    const employee = await req.tenantPrisma.employee.findUnique({
      where: { id },
      select: { id: true, photo: true }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    if (!employee.photo) {
      return res.status(404).json({
        success: false,
        message: 'Aucune photo à supprimer',
      });
    }

    // Supprimer de Cloudinary
    const publicId = CloudinaryService.extractPublicId(employee.photo);
    await CloudinaryService.deleteImage(publicId);
    await deleteLocalEmployeePhoto(publicId, companyName);

    // Mettre à jour la base de données
    const updatedEmployee = await req.tenantPrisma.employee.update({
      where: { id },
      data: { photo: null },
    });

    console.log(`✅ [Photo] Photo employé supprimée pour: ${id}`);

    res.json({
      success: true,
      message: 'Photo supprimée avec succès',
      data: updatedEmployee,
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la photo',
    });
  }
};
