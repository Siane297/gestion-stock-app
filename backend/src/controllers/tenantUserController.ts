import { Request, Response } from 'express';
import { getTenantConnection } from '../services/tenantService.js';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

/**
 * Récupérer tous les utilisateurs tenant
 */
export const getAllTenantUsers = async (req: Request, res: Response) => {
  try {
    console.log('[👥 TENANT-USERS] Récupération des utilisateurs tenant');
    console.log('[👥 TENANT-USERS] Tenant schema:', req.tenantSchema);
    console.log('[👥 TENANT-USERS] User role:', req.userRole);
    
    // Utiliser le tenantPrisma du middleware plutôt que x-tenant-id
    const tenantPrisma = req.tenantPrisma;

    if (!tenantPrisma) {
      console.log('[❌ TENANT-USERS] Tenant Prisma non disponible');
      return res.status(400).json({
        success: false,
        message: 'Configuration tenant non disponible',
      });
    }

    const users = await tenantPrisma.tenantUser.findMany({
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            fullName: true,
            email: true,
            // department: { select: { name: true } }, // Relation disabled in schema
            position: { select: { name: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des utilisateurs tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Récupérer un utilisateur tenant par ID
 */
export const getTenantUserById = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur manquant',
      });
    }

    const tenantPrisma = getTenantConnection(tenantId);

    const user = await tenantPrisma.tenantUser.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            fullName: true,
            email: true,
            // department: { select: { name: true } }, // Relation disabled in schema
            position: { select: { name: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'utilisateur tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Créer un nouvel utilisateur tenant
 */
export const createTenantUser = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { employeeId, password, role, permissions } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Employé et mot de passe requis',
      });
    }

    const tenantPrisma = getTenantConnection(tenantId);

    // Vérifier que l'employé existe et n'a pas déjà un compte
    const employee = await tenantPrisma.employee.findUnique({
      where: { id: employeeId },
      include: { tenantUser: true },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    if (employee.tenantUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet employé a déjà un compte utilisateur',
      });
    }

    if (!employee.email) {
      return res.status(400).json({
        success: false,
        message: 'L\'employé doit avoir un email pour créer un compte',
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await tenantPrisma.tenantUser.create({
      data: {
        employeeId,
        email: employee.email,
        password: hashedPassword,
        role: role || 'USER',
        permissions: permissions || [],
      },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            fullName: true,
            email: true,
            // department: { select: { name: true } }, // Relation disabled in schema
            position: { select: { name: true } },
          },
        },
      },
    });

    logger.info(`Utilisateur tenant créé: ${newUser.email}`);

    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de l\'utilisateur tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Mettre à jour un utilisateur tenant
 */
export const updateTenantUser = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { role, permissions, password } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur manquant',
      });
    }

    const tenantPrisma = getTenantConnection(tenantId);

    const updateData: any = {};

    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await tenantPrisma.tenantUser.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            fullName: true,
            email: true,
            // department: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
      },
    });

    logger.info(`Utilisateur tenant mis à jour: ${updatedUser.email}`);

    return res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour de l\'utilisateur tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Bloquer/Débloquer un utilisateur
 */
export const toggleBlockTenantUser = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur manquant',
      });
    }

    const tenantPrisma = getTenantConnection(tenantId);

    // Vérifier si c'est le propriétaire
    const user = await tenantPrisma.tenantUser.findUnique({
      where: { id },
      select: { isOwner: true, email: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Empêcher le blocage du propriétaire
    if (user.isOwner && isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Impossible de bloquer le compte propriétaire',
      });
    }

    const updatedUser = await tenantPrisma.tenantUser.update({
      where: { id },
      data: { isBlocked },
      include: {
        employee: {
          select: {
            id: true,
            matricule: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Utilisateur ${isBlocked ? 'bloqué' : 'débloqué'}: ${updatedUser.email}`);

    return res.status(200).json({
      success: true,
      message: `Utilisateur ${isBlocked ? 'bloqué' : 'débloqué'} avec succès`,
      data: updatedUser,
    });
  } catch (error: any) {
    logger.error('Erreur lors du blocage/déblocage de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Supprimer un utilisateur tenant
 */
export const deleteTenantUser = async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { id } = req.params;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur manquant',
      });
    }

    const tenantPrisma = getTenantConnection(tenantId);

    // Vérifier si c'est le propriétaire
    const user = await tenantPrisma.tenantUser.findUnique({
      where: { id },
      select: { isOwner: true, email: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Empêcher la suppression du propriétaire
    if (user.isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer le compte propriétaire',
      });
    }

    await tenantPrisma.tenantUser.delete({
      where: { id },
    });

    logger.info(`Utilisateur tenant supprimé: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de l\'utilisateur tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};
