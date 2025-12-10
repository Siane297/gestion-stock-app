import type { Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { getTodayDateRange, getDateRangeForDate, formatDateFr } from '../utils/dateUtils.js';

// Obtenir les statistiques du dashboard
// Obtenir les statistiques du dashboard
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const tenantPrisma = req.tenantPrisma;
    const { date } = req.query;

    if (!tenantPrisma) {
      return res.status(400).json({
        success: false,
        message: 'Tenant non identifié',
      });
    }

    // Date du jour - Basé sur le fuseau horaire du pays de l'organisation
    const organizationCountry = req.companyCountry || 'Kenya'; // Fallback si pas de pays
    
    let start: Date;
    let end: Date;

    if (date) {
      // Si une date est fournie, utiliser cette date
      const dateObj = new Date(date as string);
      const range = getDateRangeForDate(dateObj, organizationCountry);
      start = range.start;
      end = range.end;
    } else {
      // Sinon utiliser aujourd'hui
      const range = getTodayDateRange(organizationCountry);
      start = range.start;
      end = range.end;
    }

    // 1. Total des employés actifs enregistrés à ou avant la date
    const totalEmployes = await tenantPrisma.employee.count({
      where: { 
        isActive: true,
        createdAt: {
          lte: end, // Employés créés avant ou à la date sélectionnée
        },
      },
    });

    // 2. Présences du jour (bilans avec statut A_L_HEURE ou EN_RETARD)
    const presencesDuJour = await tenantPrisma.bilanPresence.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        statut: {
          in: ['A_L_HEURE', 'EN_RETARD'],
        },
      },
    });

    // 3. Absences du jour (bilans avec statut ABSENT)
    const absencesDuJour = await tenantPrisma.bilanPresence.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        statut: 'ABSENT',
      },
    });

    // 4. Retards du jour (bilans avec statut EN_RETARD)
    const retardsDuJour = await tenantPrisma.bilanPresence.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        statut: 'EN_RETARD',
      },
    });

    // 5. Incomplets du jour (bilans avec statut INCOMPLET)
    const incompletsDuJour = await tenantPrisma.bilanPresence.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        statut: 'INCOMPLET',
      },
    });

    // 6. Congés du jour (bilans avec statut EN_CONGE)
    const congesDuJour = await tenantPrisma.bilanPresence.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        statut: 'EN_CONGE',
      },
    });

    // 7. Congés approuvés pour la date (statut APPROUVE dans la table Conge)
    const congesApprouvesDuJour = await tenantPrisma.conge.count({
      where: {
        statut: 'APPROUVE',
        // La date sélectionnée doit être comprise entre dateDebut et dateFin
        dateDebut: {
          lte: end,
        },
        dateFin: {
          gte: start,
        },
      },
    });


    res.status(200).json({
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: {
        totalEmployes,
        presencesDuJour,
        absencesDuJour,
        retardsDuJour,
        incompletsDuJour,
        congesDuJour,
        congesApprouvesDuJour,
      },
    });
  } catch (error: any) {
    logger.error('Erreur getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Obtenir le top 5 des employés les plus présents
export const getTopEmployees = async (req: Request, res: Response) => {
  try {
    const tenantPrisma = req.tenantPrisma;
    
    if (!tenantPrisma) {
      return res.status(400).json({
        success: false,
        message: 'Tenant non identifié',
      });
    }

    // Calculer sur le mois fourni ou le mois en cours
    const { month } = req.query;
    
    let startOfMonth: Date;
    let endOfMonth: Date;
    
    if (month) {
      const monthDate = new Date(month as string);
      startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    } else {
      const now = new Date();
      startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Récupérer tous les employés actifs
    const employees = await tenantPrisma.employee.findMany({
      where: { isActive: true },
      select: { 
        id: true, 
        fullName: true, 
        department: {
          select: { name: true }
        }, 
        position: {
          select: { name: true }
        } 
      },
    });

    // Pour chaque employé, calculer le taux de présence
    const employeeStats = await Promise.all(
      employees.map(async (employee: any) => {
        // Compter les jours de présence (A_L_HEURE ou EN_RETARD)
        const presenceCount = await tenantPrisma.bilanPresence.count({
          where: {
            employeeId: employee.id,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            statut: {
              in: ['A_L_HEURE', 'EN_RETARD'],
            },
          },
        });

        // Compter le nombre de jours ouvrés passés dans le mois (approximation simple pour l'instant)
        // Idéalement, il faudrait utiliser la configuration horaire et les jours fériés
        // Ici on prend le nombre de jours passés dans le mois hors week-end
        let workingDays = 0;
        const today = new Date();
        const loopEnd = today < endOfMonth ? today : endOfMonth;
        
        for (let d = new Date(startOfMonth); d <= loopEnd; d.setDate(d.getDate() + 1)) {
          const day = d.getDay();
          if (day !== 0 && day !== 6) workingDays++;
        }
        
        // Éviter la division par zéro
        workingDays = Math.max(workingDays, 1);
        
        const presenceRate = Math.min(Math.round((presenceCount / workingDays) * 100), 100);

        return {
          id: employee.id,
          fullName: employee.fullName,
          department: employee.department?.name || 'Non assigné',
          poste: employee.position?.name || 'Non assigné',
          presenceCount,
          presenceRate,
        };
      })
    );

    // Trier par taux de présence décroissant et prendre le top 5
    // Filtrer pour ne garder que ceux qui ont au moins 1% de présence
    const topEmployees = employeeStats
      .filter((emp: any) => emp.presenceRate > 0)
      .sort((a: any, b: any) => b.presenceRate - a.presenceRate)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      message: 'Top employés récupéré avec succès',
      data: topEmployees,
    });

  } catch (error: any) {
    logger.error('Erreur getTopEmployees:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du top employés',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
