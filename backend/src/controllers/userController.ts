import { Request, Response } from 'express';
import { prisma } from '../config/database.js';

/**
 * Récupérer les informations de l'utilisateur connecté
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // L'ID utilisateur est fourni par le middleware Better Auth
    const userId = req.body?.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            schemaName: true,
            email: true,
            country: true,
            address: true,
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
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.body?.session?.user?.id;
    const { name, image } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        image: image || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        company: {
          select: {
            id: true,
            name: true,
            schemaName: true,
            email: true,
            country: true,
            address: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};
