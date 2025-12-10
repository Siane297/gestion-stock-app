import type { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { calculerStatutEntree } from './horaireService.js';
import type { StatutPointage } from '@prisma/client';
import { DateHelpers } from '../utils/dateHelpers.js';

/**
 * Créer ou mettre à jour le bilan de présence d'un employé pour une date
 * @param tenantPrisma Connexion Prisma du tenant
 * @param employeeId ID de l'employé
 * @param date Date du bilan
 * @param country Pays de l'organisation (pour déterminer le timezone)
 */
export const creerOuMettreAJourBilan = async (
  tenantPrisma: PrismaClient,
  employeeId: string,
  date: Date,
  country: string = 'Kenya'
): Promise<void> => {
  try {
    logger.info(`🔧 Création/MAJ bilan pour employé ${employeeId} - Date: ${date.toISOString()}`);
    
    // Créer les dates de début et fin du jour (en UTC) selon le timezone de l'organisation
    const debutJour = DateHelpers.getStartOfDayInTimezone(date, country);
    const finJour = DateHelpers.getEndOfDayInTimezone(date, country);

    // Récupérer les pointages ENTREE et SORTIE du jour
    const [entree, sortie] = await Promise.all([
    tenantPrisma.attendance.findFirst({
      where: {
        employeeId,
        type: 'ENTREE',
        heurePointage: { gte: debutJour, lte: finJour },
      },
      orderBy: { heurePointage: 'asc' },
    }),
    tenantPrisma.attendance.findFirst({
      where: {
        employeeId,
        type: 'SORTIE',
        heurePointage: { gte: debutJour, lte: finJour },
      },
      orderBy: { heurePointage: 'desc' },
    }),
  ]);

    // Déterminer le statut
    let statut: StatutPointage;
    let heureEntree: Date | null = null;
    let heureSortie: Date | null = null;
    let dureeTravailMinutes = 0;
    let notes: string | null = null;

    if (!entree) {
      // Pas d'entrée = ABSENT
      statut = 'ABSENT' as StatutPointage;
      notes = 'Aucun pointage enregistré';
    } else if (!sortie) {
      // Entrée mais pas de sortie = INCOMPLET
      statut = 'INCOMPLET' as StatutPointage;
      heureEntree = entree.heurePointage;
      notes = 'Pointage de sortie manquant';
    } else {
      // Entrée et sortie = Calculer le statut, la durée et le retard
      heureEntree = entree.heurePointage;
      heureSortie = sortie.heurePointage;

      // Récupérer la configuration
      const config = await tenantPrisma.configurationHoraire.findFirst({
        where: { isActive: true },
      });

      // Extraire les heures d'entrée et sortie en minutes depuis minuit (timezone de l'org)
      const heureArriveeMin = DateHelpers.getMinutesSinceMidnight(entree.heurePointage, country);
      const heureSortieMin = DateHelpers.getMinutesSinceMidnight(sortie.heurePointage, country);

      logger.info(`🕒 Arrivée: ${Math.floor(heureArriveeMin / 60)}h${heureArriveeMin % 60}, Sortie: ${Math.floor(heureSortieMin / 60)}h${heureSortieMin % 60}`);

      if (config) {
        const heureDebutMin = DateHelpers.timeStringToMinutes(config.heureDebut);
        const heureFinMin = DateHelpers.timeStringToMinutes(config.heureFin);
        const toleranceMin = config.toleranceRetardMinutes ?? 0; // Si null, considérer 0 (aucune tolérance)
        
        // Détecter si l'horaire traverse minuit (ex: 22:56 → 04:53)
        const traverseMinuit = heureFinMin < heureDebutMin;
        
        // Ajuster les heures si elles traversent minuit
        let heureArriveeAjustee = heureArriveeMin;
        let heureSortieAjustee = heureSortieMin;
        
        if (traverseMinuit) {
          // Si l'arrivée est avant minuit (>= heureDebut), on la garde telle quelle
          // Si l'arrivée est après minuit (< heureDebut), on ajoute 24h
          if (heureArriveeMin < heureDebutMin) {
            heureArriveeAjustee = heureArriveeMin + 1440; // +24h
          }
          
          // Si la sortie est avant minuit (>= heureDebut), on la garde telle quelle
          // Si la sortie est après minuit (< heureDebut), on ajoute 24h
          if (heureSortieMin < heureDebutMin) {
            heureSortieAjustee = heureSortieMin + 1440; // +24h
          }
        }
        
        logger.info(`🕒 Horaire ${traverseMinuit ? 'de nuit' : 'normal'} - Arrivée ajustée: ${Math.floor(heureArriveeAjustee / 60)}h${heureArriveeAjustee % 60}, Sortie ajustée: ${Math.floor(heureSortieAjustee / 60)}h${heureSortieAjustee % 60}`);
        
        // Utiliser les valeurs ajustées pour les calculs
        const heureArriveeCalcul = heureArriveeAjustee;
        const heureSortieCalcul = heureSortieAjustee;
        
        // Calcul du retard effectif
        let retardMinutes = 0;
        const limiteTolerance = heureDebutMin + toleranceMin;
        
        if (heureArriveeCalcul > limiteTolerance) {
          retardMinutes = heureArriveeCalcul - limiteTolerance;
          statut = 'EN_RETARD' as StatutPointage;
          logger.info(`⏰ Retard effectif: ${retardMinutes} minutes`);
        } else if (heureArriveeCalcul > heureDebutMin) {
          statut = 'A_L_HEURE' as StatutPointage;
          logger.info(`✅ Dans la tolérance (retard de ${heureArriveeCalcul - heureDebutMin} min, tolérance: ${toleranceMin} min)`);
        } else {
          statut = 'A_L_HEURE' as StatutPointage;
          logger.info(`✅ À l'heure`);
        }

        // Calcul de la durée de travail
        let dureeTravailMatin = 0;
        let dureeTravailApresMidi = 0;

        if (config.heureDebutPause && config.heureFinPause) {
          let debutPauseMin = DateHelpers.timeStringToMinutes(config.heureDebutPause);
          let finPauseMin = DateHelpers.timeStringToMinutes(config.heureFinPause);
          
          // Ajuster les heures de pause si nécessaire
          if (traverseMinuit) {
            if (debutPauseMin < heureDebutMin) debutPauseMin += 1440;
            if (finPauseMin < heureDebutMin) finPauseMin += 1440;
          }

          // Période du matin : de l'arrivée (ou début officiel) jusqu'à la pause
          const debutTravailMatin = Math.max(heureArriveeCalcul, heureDebutMin);
          const finTravailMatin = Math.min(heureSortieCalcul, debutPauseMin);
          
          if (finTravailMatin > debutTravailMatin) {
            dureeTravailMatin = finTravailMatin - debutTravailMatin;
            logger.info(`🌅 Matin: ${dureeTravailMatin} min (${Math.floor(debutTravailMatin / 60)}h${debutTravailMatin % 60} → ${Math.floor(finTravailMatin / 60)}h${finTravailMatin % 60})`);
          }

          // Période de l'après-midi : de la fin de pause jusqu'à la sortie (ou fin officielle)
          const heureFinAjustee = traverseMinuit ? heureFinMin + 1440 : heureFinMin;
          if (heureSortieCalcul > finPauseMin) {
            const debutTravailApresMidi = Math.max(heureArriveeCalcul, finPauseMin);
            const finTravailApresMidi = Math.min(heureSortieCalcul, heureFinAjustee);
            
            if (finTravailApresMidi > debutTravailApresMidi) {
              dureeTravailApresMidi = finTravailApresMidi - debutTravailApresMidi;
              logger.info(`🌆 Après-midi: ${dureeTravailApresMidi} min (${Math.floor(debutTravailApresMidi / 60)}h${debutTravailApresMidi % 60} → ${Math.floor(finTravailApresMidi / 60)}h${finTravailApresMidi % 60})`);
            }
          }
        } else {
          // Pas de pause configurée : durée = sortie - arrivée
          const heureFinAjustee = traverseMinuit ? heureFinMin + 1440 : heureFinMin;
          const debutTravail = Math.max(heureArriveeCalcul, heureDebutMin);
          const finTravail = Math.min(heureSortieCalcul, heureFinAjustee);
          dureeTravailMatin = Math.max(0, finTravail - debutTravail);
          logger.info(`📊 Pas de pause - Durée totale: ${dureeTravailMatin} min`);
        }

        dureeTravailMinutes = dureeTravailMatin + dureeTravailApresMidi;
        
        const heures = Math.floor(dureeTravailMinutes / 60);
        const minutes = dureeTravailMinutes % 60;
        logger.info(`✅ Durée totale: ${heures}h${minutes.toString().padStart(2, '0')} (${dureeTravailMinutes} minutes)`);
        
        if (retardMinutes > 0) {
          const retardHeures = Math.floor(retardMinutes / 60);
          const retardMin = retardMinutes % 60;
          logger.info(`⏰ Retard: ${retardHeures > 0 ? retardHeures + 'h' : ''}${retardMin} min`);
        }
        
        // Stocker le retard dans notes si > 0
        if (retardMinutes > 0) {
          const retardHeures = Math.floor(retardMinutes / 60);
          const retardMin = retardMinutes % 60;
          notes = retardHeures > 0 
            ? `Retard: ${retardHeures}h${retardMin.toString().padStart(2, '0')}`
            : `Retard: ${retardMin} minutes`;
        }
      } else {
        // Pas de config : calcul simple
        const diffMinutes = heureSortieMin - heureArriveeMin;
        dureeTravailMinutes = Math.max(0, diffMinutes);
        statut = 'A_L_HEURE' as StatutPointage;
        logger.info(`⚠️ Pas de configuration - Durée brute: ${dureeTravailMinutes} min`);
      }
    }

    // Calculer le retard effectif si nécessaire
    let retardMinutes = 0;
    if (heureEntree && notes && notes.includes('Retard:')) {
      // Extraire le retard des notes
      const matchMinutes = notes.match(/(\d+)\s*minutes?/);
      const matchHeures = notes.match(/(\d+)h(\d+)/);
      
      if (matchHeures && matchHeures[1] && matchHeures[2]) {
        retardMinutes = parseInt(matchHeures[1]) * 60 + parseInt(matchHeures[2]);
      } else if (matchMinutes && matchMinutes[1]) {
        retardMinutes = parseInt(matchMinutes[1]);
      }
    }

    // Créer ou mettre à jour le bilan
    // Comme on a supprimé la contrainte d'unicité sur [employeeId, date],
    // on doit gérer manuellement l'upsert
    const bilanExistant = await tenantPrisma.bilanPresence.findFirst({
      where: {
        employeeId,
        createdAt: { gte: debutJour, lte: finJour },
      },
    });

    if (bilanExistant) {
      // Mettre à jour le bilan existant
      await tenantPrisma.bilanPresence.update({
        where: { id: bilanExistant.id },
        data: {
          statut,
          heureEntree,
          heureSortie,
          dureeTravailMinutes,
          retardMinutes,
          notes,
        },
      });
    } else {
      // Créer un nouveau bilan
      await tenantPrisma.bilanPresence.create({
        data: {
          employeeId,
          statut,
          heureEntree,
          heureSortie,
          dureeTravailMinutes,
          retardMinutes,
          notes,
        },
      });
    }

    logger.info(`Bilan mis à jour pour employé ${employeeId} - ${date.toISOString().split('T')[0]} - Statut: ${statut}`);
  } catch (error) {
    logger.error(`Erreur lors de la création/mise à jour du bilan pour employé ${employeeId}:`, error);
    throw error; // Propager l'erreur pour que le controller puisse la gérer
  }
};

/**
 * Marquer tous les employés sans pointage comme absents
 * SAUF ceux qui ont un congé approuvé
 * @param tenantPrisma Connexion Prisma du tenant
 * @param date Date pour marquer les absents (par défaut: aujourd'hui)
 * @param country Pays de l'organisation (pour déterminer le timezone)
 */
export const marquerAbsents = async (
  tenantPrisma: PrismaClient,
  date?: Date,
  country: string = 'Kenya'
): Promise<number> => {
  // Vérifier qu'une configuration horaire active existe
  const configActive = await tenantPrisma.configurationHoraire.findFirst({
    where: { isActive: true },
  });

  // Si aucune configuration active, ne pas marquer d'absents
  if (!configActive) {
    logger.info('Aucune configuration horaire active - marquage des absents annulé');
    return 0;
  }

  const dateRecherche = date || new Date();
  
  const debutJour = DateHelpers.getStartOfDayInTimezone(dateRecherche, country);
  const finJour = DateHelpers.getEndOfDayInTimezone(dateRecherche, country);

  // Récupérer tous les employés actifs
  const employesActifs = await tenantPrisma.employee.findMany({
    where: { isActive: true },
  });

  // Récupérer les employés qui ont déjà un bilan
  const bilansExistants = await tenantPrisma.bilanPresence.findMany({
    where: {
      createdAt: { gte: debutJour, lte: finJour },
    },
    select: { employeeId: true },
  });

  const employesAvecBilan = new Set(bilansExistants.map(b => b.employeeId));

  // NOUVEAU: Récupérer les congés approuvés pour cette date
  const congesApprouves = await tenantPrisma.conge.findMany({
    where: {
      statut: 'APPROUVE',
      dateDebut: { lte: finJour },
      dateFin: { gte: debutJour },
    },
    select: { 
      id: true,
      employeId: true, 
      typeConge: { 
        select: { 
          nom: true, 
          couleur: true 
        } 
      } 
    },
  });

  const employesEnConge = new Set(congesApprouves.map(c => c.employeId));
  
  logger.info(`📅 ${congesApprouves.length} employé(s) en congé approuvé pour le ${debutJour.toISOString().split('T')[0]}`);

  // Identifier les employés sans bilan ET sans congé
  const employesSansBilan = employesActifs.filter(
    emp => !employesAvecBilan.has(emp.id) && !employesEnConge.has(emp.id)
  );

  // Créer un bilan ABSENT pour chacun (SAUF ceux en congé)
  let compteur = 0;
  for (const employe of employesSansBilan) {
    await tenantPrisma.bilanPresence.create({
      data: {
        employeeId: employe.id,
        statut: 'ABSENT',
        heureEntree: null,
        heureSortie: null,
        dureeTravailMinutes: 0,
        retardMinutes: 0,
        notes: 'Absence automatiquement enregistrée',
      },
    });
    compteur++;
  }

  // NOUVEAU: Créer un bilan EN_CONGE pour les employés en congé sans bilan
  let compteurConges = 0;
  for (const conge of congesApprouves) {
    if (!employesAvecBilan.has(conge.employeId)) {
      await tenantPrisma.bilanPresence.create({
        data: {
          employeeId: conge.employeId,
          statut: 'EN_CONGE',
          congeId: conge.id,
          heureEntree: null,
          heureSortie: null,
          dureeTravailMinutes: 0,
          retardMinutes: 0,
          notes: `En congé: ${conge.typeConge.nom}`,
        },
      });
      compteurConges++;
    }
  }

  if (compteurConges > 0) {
    logger.info(`✅ ${compteurConges} bilan(s) EN_CONGE créé(s)`);
  }

  return compteur;
};

/**
 * Récupérer les bilans de présence avec filtres
 */
export const getBilansPresence = async (
  tenantPrisma: PrismaClient,
  filters: {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  statut?: string;
}) => {
  const { startDate, endDate, employeeId, statut } = filters;

  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (employeeId) where.employeeId = employeeId;
  if (statut) where.statut = statut;

  const bilans = await tenantPrisma.bilanPresence.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          matricule: true,
          fullName: true,
          department: {
            select: { name: true },
          },
          position: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return bilans.map(b => ({
    id: b.id,
    createdAt: b.createdAt,
    employe: {
      id: b.employee.id,
      matricule: b.employee.matricule,
      fullName: b.employee.fullName,
      department: b.employee.department?.name || 'N/A',
      position: b.employee.position?.name || 'N/A',
    },
    statut: b.statut,
    heureEntree: b.heureEntree,
    heureSortie: b.heureSortie,
    dureeTravailMinutes: b.dureeTravailMinutes,
    retardMinutes: b.retardMinutes,
    notes: b.notes,
  }));
};
