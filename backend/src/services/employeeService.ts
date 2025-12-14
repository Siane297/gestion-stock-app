import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { normalizeCalendarDate } from '../utils/dateUtils.js';
import { CloudinaryService } from '../services/CloudinaryService.js';
import path from 'path';
import fs from 'fs/promises';

export interface CreateEmployeeDto {
    matricule: string;
    fullName: string;
    email?: string;
    positionId?: string;
    phoneNumber?: string;
    address?: string;
    sexe?: 'MASCULIN' | 'FEMININ';
    dateNaissance?: string;
}

export interface UpdateEmployeeDto {
    fullName?: string;
    email?: string;
    positionId?: string;
    phoneNumber?: string;
    address?: string;
    sexe?: 'MASCULIN' | 'FEMININ';
    dateNaissance?: string;
    isActive?: boolean;
}

/**
 * Helper: Supprimer photo locale
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
                await fs.unlink(path.join(uploadsDir, file));
            }
        } catch (e) { } // Ignore if dir missing
    } catch (error) {
        console.log(`⚠️ [Local] Impossible de supprimer la photo locale:`, error);
    }
};

export class EmployeeService {
    private prisma: PrismaClient;
    private tenantSchema: string;

    constructor(prisma: PrismaClient, tenantSchema: string = 'public') {
        this.prisma = prisma;
        this.tenantSchema = tenantSchema;
    }

    /**
     * Obtenir tous les employés
     */
    async getAll(filters: { search?: string; isActive?: boolean }) {
        const where: any = {
            deletedAt: null,
            ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {})
        };

        if (filters.search) {
            where.OR = [
                { fullName: { contains: filters.search, mode: 'insensitive' } },
                { matricule: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.employee.findMany({
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

                createdAt: true,
                updatedAt: true,
                position: {
                    select: { id: true, name: true }
                },

            },
        });
    }

    /**
     * Obtenir un employé par ID
     */
    async getById(id: string) {
        return this.prisma.employee.findUnique({
            where: { id },
            include: {
                position: { select: { id: true, name: true } },

            },
        });
    }

    /**
     * Créer un employé
     */
    async create(data: CreateEmployeeDto) {
        // Validation unicité matricule
        const existingMatricule = await this.prisma.employee.findUnique({
             where: { matricule: data.matricule } 
        });
        if (existingMatricule) throw new Error('Un employé avec ce matricule existe déjà');

        // Validation unicité email
        if (data.email) {
            const existingEmail = await this.prisma.employee.findUnique({ where: { email: data.email } });
            if (existingEmail) throw new Error('Un employé avec cet email existe déjà');
        }

        const employee = await this.prisma.employee.create({
            data: {
                matricule: data.matricule,
                fullName: data.fullName,
                email: data.email,
                positionId: data.positionId,
                phoneNumber: data.phoneNumber,
                address: data.address,
                sexe: data.sexe,
                dateNaissance: data.dateNaissance ? normalizeCalendarDate(data.dateNaissance) : undefined,
                // departmentId supprimé
            }
        });

        logger.info(`Employé créé: ${employee.id} - ${employee.fullName}`);
        return employee;
    }

    /**
     * Mettre à jour un employé
     */
    async update(id: string, data: UpdateEmployeeDto) {
        const existing = await this.prisma.employee.findUnique({ where: { id } });
        if (!existing) throw new Error('Employé non trouvé');

        if (data.email && data.email !== existing.email) {
             const existingEmail = await this.prisma.employee.findUnique({ where: { email: data.email } });
             if (existingEmail) throw new Error('Un employé avec cet email existe déjà');
        }

        const employee = await this.prisma.employee.update({
            where: { id },
            data: {
                fullName: data.fullName,
                email: data.email,
                positionId: data.positionId,
                phoneNumber: data.phoneNumber,
                address: data.address,
                sexe: data.sexe,
                isActive: data.isActive,
                dateNaissance: data.dateNaissance ? normalizeCalendarDate(data.dateNaissance) : undefined,
            }
        });

        logger.info(`Employé mis à jour: ${employee.id} - ${employee.fullName}`);
        return employee;
    }

    /**
     * Soft delete
     */
    async delete(id: string) {
        const existing = await this.prisma.employee.findUnique({ where: { id } });
        if (!existing) throw new Error('Employé non trouvé');

        await this.prisma.employee.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() }
        });

        logger.info(`Employé supprimé (soft): ${id}`);
        return true;
    }



    /**
     * Upload Photo
     */
    async uploadPhoto(id: string, file: Express.Multer.File, companyName: string) {
        const existing = await this.prisma.employee.findUnique({ where: { id } });
        if (!existing) throw new Error('Employé non trouvé');

        // Supprimer ancienne photo
        if (existing.photo) {
            try {
                const publicId = CloudinaryService.extractPublicId(existing.photo);
                await CloudinaryService.deleteImage(publicId);
                await deleteLocalEmployeePhoto(publicId, companyName);
            } catch (e) {}
        }

        const publicId = `${companyName}-employee-${id}-${Date.now()}`;
        const result = await CloudinaryService.uploadImage(file.path, 'employees', publicId);

        const updated = await this.prisma.employee.update({
            where: { id },
            data: { photo: result.secure_url }
        });

        return {
            photo: result.secure_url,
            employee: updated
        };
    }

    /**
     * Delete Photo
     */
    async deletePhoto(id: string, companyName: string) {
        const existing = await this.prisma.employee.findUnique({ where: { id } });
        if (!existing) throw new Error('Employé non trouvé');
        if (!existing.photo) throw new Error('Aucune photo à supprimer');

        const publicId = CloudinaryService.extractPublicId(existing.photo);
        await CloudinaryService.deleteImage(publicId);
        await deleteLocalEmployeePhoto(publicId, companyName);

        const updated = await this.prisma.employee.update({
            where: { id },
            data: { photo: null }
        });

        return updated;
    }
}
