import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prismaPublic, getTenantConnection } from '../services/tenantService.js';
import { logger } from '../config/logger.js';

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    let user;

    if (tenantId) {
      // Utilisateur Tenant (Employé)
      const tenantPrisma = getTenantConnection(tenantId);
      user = await tenantPrisma.tenantUser.findUnique({
        where: { id: userId },
        include: {
          employee: {
            select: {
              fullName: true,
              email: true,
              hireDate: true,
            },
          },
          magasin: { select: { nom: true } },
        },
      });
      
      if (user) {
        // Formatter pour la cohérence
        (user as any).name = (user as any).employee.fullName;
      }
    } else {
      // Utilisateur Public (Admin / Super Admin)
      user = await prismaPublic.user.findUnique({
        where: { id: userId },
        include: {
          company: true,
        },
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Retirer le mot de passe et le PIN de la réponse
    const { password, pin, ...safeUser } = user as any;

    // Calculer daysRemaining si company existe
    if (safeUser.company) {
      const now = new Date();
      let targetDate: Date | null = null;

      // Utiliser trialEndsAt pour TRIAL, subscriptionEndsAt pour ACTIVE
      if (safeUser.company.subscriptionStatus === 'TRIAL' && safeUser.company.trialEndsAt) {
        targetDate = new Date(safeUser.company.trialEndsAt);
      } else if (safeUser.company.subscriptionStatus === 'ACTIVE' && safeUser.company.subscriptionEndsAt) {
        targetDate = new Date(safeUser.company.subscriptionEndsAt);
      }

      if (targetDate) {
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        safeUser.company.daysRemaining = Math.max(0, diffDays); // Ne pas afficher de valeurs négatives
      } else {
        safeUser.company.daysRemaining = 0;
      }
    }

    return res.status(200).json({
      success: true,
      data: safeUser,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const { name, email, currentPassword, newPassword, pin } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    let user;
    let updateData: any = {};

    // 1. Gérer le changement de mot de passe si demandé
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'L\'ancien mot de passe est requis pour changer le mot de passe',
        });
      }

      // Récupérer l'utilisateur avec son mot de passe
      let dbUser;
      if (tenantId) {
        dbUser = await getTenantConnection(tenantId).tenantUser.findUnique({ where: { id: userId } });
      } else {
        dbUser = await prismaPublic.user.findUnique({ where: { id: userId } });
      }

      if (!dbUser || !dbUser.password) {
        return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'L\'ancien mot de passe est incorrect' });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // 2. Gérer le PIN (seulement pour les TenantUsers)
    if (pin !== undefined && tenantId) {
      updateData.pin = pin || null;
    }

    // 3. Mettre à jour les infos de base
    if (tenantId) {
      const tenantPrisma = getTenantConnection(tenantId);
      
      // Mise à jour de l'email si fourni
      if (email) updateData.email = email;

      const updatedTenantUser = await tenantPrisma.tenantUser.update({
        where: { id: userId },
        data: updateData,
      });

      // Mise à jour du nom dans la table Employee
      if (name) {
        await tenantPrisma.employee.update({
          where: { id: updatedTenantUser.employeeId },
          data: { fullName: name, email: email || undefined },
        });
      }

      user = await tenantPrisma.tenantUser.findUnique({
        where: { id: userId },
        include: { employee: true, magasin: true },
      });
    } else {
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      user = await prismaPublic.user.update({
        where: { id: userId },
        data: updateData,
        include: { company: true },
      });
    }

    const { password, pin: userPin, ...safeUser } = user as any;

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: safeUser,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.code === 'P2002') {
       const field = error.meta?.target?.[0] || 'champ';
       return res.status(400).json({
         success: false,
         message: field === 'pin' ? 'Ce code PIN est déjà utilisé' : `La valeur pour ${field} est déjà utilisée`,
       });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};
