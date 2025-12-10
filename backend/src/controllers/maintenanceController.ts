import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Recalculer les durées de travail pour tous les pointages existants
 * Utile pour corriger les données après des mises à jour du code
 */
export const recalculerDurees = async (req: Request, res: Response) => {
  try {
    // Récupérer toutes les entrées qui ont une sortie correspondante
    const entrees = await prisma.attendance.findMany({
      where: {
        type: 'ENTREE',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    let miseAJour = 0;

    for (const entree of entrees) {
      // Chercher la sortie correspondante (même jour, même employé)
      const debutJour = new Date(entree.createdAt);
      debutJour.setHours(0, 0, 0, 0);
      
      const finJour = new Date(entree.createdAt);
      finJour.setHours(23, 59, 59, 999);

      const sortie = await prisma.attendance.findFirst({
        where: {
          employeeId: entree.employeeId,
          type: 'SORTIE',
          createdAt: {
            gte: debutJour,
            lte: finJour,
            gt: entree.createdAt, // Sortie après l'entrée
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (sortie) {
        // Récupérer la configuration pour la pause
        const config = await prisma.configurationHoraire.findFirst({
          where: { isActive: true },
        });

        // Calculer la durée de pause si configurée
        let dureePause = 0;
        if (config?.heureDebutPause && config?.heureFinPause) {
          const debutParts = config.heureDebutPause.split(':').map(Number);
          const finParts = config.heureFinPause.split(':').map(Number);
          
          const debutH = debutParts[0] ?? 0;
          const debutM = debutParts[1] ?? 0;
          const finH = finParts[0] ?? 0;
          const finM = finParts[1] ?? 0;
          
          dureePause = (finH * 60 + finM) - (debutH * 60 + debutM);
        }

        // Calculer la durée
        const diffMs = sortie.createdAt.getTime() - entree.createdAt.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const dureeTravail = Math.max(0, diffMinutes - dureePause);

        // Note: dureeTravailMinutes n'existe pas dans le modèle Attendance
        // Cette information doit être stockée dans BilanPresence
        
        miseAJour++;
      }
    }

    res.json({
      success: true,
      message: `${miseAJour} durées recalculées avec succès`,
      data: {
        nombreMiseAJour: miseAJour,
      },
    });
  } catch (error) {
    logger.error('Erreur recalcul durées:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du recalcul des durées',
    });
  }
};

/**
 * Nettoyer les doublons d'absence
 * Garde seulement le plus récent pour chaque employé/date
 */
export const nettoyerDoublonsAbsence = async (req: Request, res: Response) => {
  try {
    // Récupérer tous les enregistrements ABSENCE
    const absences = await prisma.attendance.findMany({
      where: {
        type: 'ABSENCE',
      },
      orderBy: [
        { employeeId: 'asc' },
        { employeeId: 'asc' },
        { createdAt: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Grouper par employé + date
    const groupes = new Map<string, string[]>();
    
    for (const absence of absences) {
      const key = `${absence.employeeId}-${absence.createdAt.toISOString().split('T')[0]}`;
      if (!groupes.has(key)) {
        groupes.set(key, []);
      }
      groupes.get(key)!.push(absence.id);
    }

    // Supprimer les doublons (garder le premier de chaque groupe)
    let compteurSupprimes = 0;
    for (const [key, ids] of groupes) {
      if (ids.length > 1) {
        // Garder le premier (le plus récent), supprimer les autres
        const aSupprimer = ids.slice(1);
        await prisma.attendance.deleteMany({
          where: {
            id: { in: aSupprimer },
          },
        });
        compteurSupprimes += aSupprimer.length;
      }
    }

    logger.info(`${compteurSupprimes} doublons d'absence supprimés`);

    res.json({
      success: true,
      message: `${compteurSupprimes} doublons supprimés`,
      data: {
        nombreSupprimes: compteurSupprimes,
      },
    });
  } catch (error) {
    logger.error('Erreur nettoyage doublons:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage des doublons',
    });
  }
};
