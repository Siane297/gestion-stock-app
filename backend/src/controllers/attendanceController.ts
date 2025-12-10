import type { Request, Response } from 'express';
import type { CreateAttendanceDto, AttendanceQueryDto, ApiResponse } from '../types/index.js';
import { logger } from '../config/logger.js';
import { creerOuMettreAJourBilan } from '../services/bilanPresenceService.js';
import { getTenantConnection, prismaPublic } from '../services/tenantService.js';
import { DateHelpers } from '../utils/dateHelpers.js';
import jwt from 'jsonwebtoken';

// Créer un pointage
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const attendanceData: CreateAttendanceDto = req.body;

    // Convertir le type en majuscules
    attendanceData.type = attendanceData.type?.toUpperCase() as 'ENTREE' | 'SORTIE';

    // Valider le type
    if (attendanceData.type !== 'ENTREE' && attendanceData.type !== 'SORTIE') {
      return res.status(400).json({
        success: false,
        message: 'Type de pointage invalide. Utilisez ENTREE ou SORTIE',
      });
    }

    // Vérifier si l'employé existe
    const employee = await req.tenantPrisma.employee.findUnique({
      where: { id: attendanceData.employeeId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé',
      });
    }

    if (!employee.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Employé inactif',
      });
    }

    // Vérifier si un pointage du même type existe déjà aujourd'hui
    const { start: aujourdhui, end: finJour } = DateHelpers.getTodayInTimezone(req.companyCountry || 'Kenya');
    
    const pointageExistant = await req.tenantPrisma.attendance.findFirst({
      where: {
        employeeId: attendanceData.employeeId,
        type: attendanceData.type,
        heurePointage: { gte: aujourdhui, lte: finJour },
      },
    });
    const pointageDejaExistant = !!pointageExistant;

    if (pointageDejaExistant) {
      return res.status(400).json({
        success: false,
        message: `Un pointage de type ${attendanceData.type} a déjà été enregistré aujourd'hui pour cet employé`,
      });
    }

    // NOUVEAU: Vérifier si une entrée existe avant de permettre une sortie
    if (attendanceData.type === 'SORTIE') {
      const entreeExiste = await req.tenantPrisma.attendance.findFirst({
        where: {
          employeeId: attendanceData.employeeId,
          type: 'ENTREE',
          heurePointage: { gte: aujourdhui, lte: finJour },
        },
      });

      if (!entreeExiste) {
        return res.status(400).json({
          success: false,
          message: 'Impossible d\'enregistrer une sortie sans entrée préalable aujourd\'hui',
        });
      }
    }

    // Créer le pointage (createdAt sera automatiquement défini par Prisma, heurePointage aussi par défaut)
    // On ajoute explicitement heurePointage pour être sûr (même si @default(now()) le gère)
    // Mais ici on laisse le défaut car on ne l'a pas dans attendanceData
    const attendance = await req.tenantPrisma.attendance.create({
      data: {
        ...attendanceData,
        heurePointage: new Date(),
      },
      include: {
        employee: true,
      },
    });

    // Créer ou mettre à jour le bilan de présence
    logger.info(`📦 Pointage créé - Appel de creerOuMettreAJourBilan pour employé ${attendanceData.employeeId}`);
    try {
      await creerOuMettreAJourBilan(req.tenantPrisma, attendanceData.employeeId, attendance.heurePointage, req.companyCountry || 'Kenya');
      logger.info(`✅ Bilan créé/mis à jour avec succès`);
    } catch (bilanError) {
      logger.error('Erreur lors de la création du bilan (pointage créé quand même):', bilanError);
    }

    res.status(201).json({
      success: true,
      message: 'Pointage enregistré avec succès',
      data: attendance,
    });
  } catch (error) {
    logger.error('Erreur lors de la création du pointage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du pointage',
    });
  }
};

// Créer un pointage via QR code
export const createAttendanceByQrCode = async (req: Request, res: Response) => {
  try {
    logger.info('🔍 [SCAN] Début du traitement du scan QR');
    logger.info('🔍 [SCAN] Body reçu:', JSON.stringify(req.body));
    
    const { qrCode } = req.body;
    let { type, location, notes } = req.body;

    // Convertir le type en majuscules (ENTREE ou SORTIE)
    type = type?.toUpperCase();
    logger.info(`🔍 [SCAN] Type: ${type}`);

    // Valider le type
    if (type !== 'ENTREE' && type !== 'SORTIE') {
      logger.warn(`❌ [SCAN] Type invalide: ${type}`);
      return res.status(400).json({
        success: false,
        message: 'Type invalide. Doit être ENTREE ou SORTIE',
      });
    }

    if (!qrCode) {
      logger.warn('❌ [SCAN] QR code manquant');
      return res.status(400).json({
        success: false,
        message: 'QR code requis',
      });
    }

    logger.info(`🔍 [SCAN] QR code reçu: ${qrCode}`);

    // Extraire le schéma tenant du QR code
    // Supporte 2 formats:
    // 1. Nouveau: "schemaName:uuid" (ex: littel_group:abc-123)
    // 2. Ancien: "uuid" seul (ex: abc-123) - utilise le schema de l'user connecté
    const qrParts = qrCode.split(':');
    logger.info(`🔍 [SCAN] QR parts (length=${qrParts.length}):`, qrParts);
    
    let tenantSchema: string;
    let employeeQrCode: string;

    if (qrParts.length === 2) {
      // Format: schema:uuid
      [tenantSchema, employeeQrCode] = qrParts;
      logger.info(`🔍 [SCAN] Format avec schéma - Tenant: ${tenantSchema}, QR: ${employeeQrCode}`);
    } else if (qrParts.length === 1) {
      // Format: uuid seul - déduit le schéma depuis l'user authentifié
      employeeQrCode = qrCode;
      
      // Récupérer le schema depuis le token JWT
      const authHeader = req.headers.authorization;
      const token = req.cookies?.auth_token || (authHeader && authHeader.split(' ')[1]);
      
      if (!token) {
        logger.warn('❌ [SCAN] QR sans schéma et pas de token d\'authentification');
        return res.status(401).json({
          success: false,
          message: 'Authentification requise pour ce format de QR code',
        });
      }

      // Décoder le token pour obtenir l'user et son organization
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await prismaPublic.user.findUnique({
          where: { id: decoded.userId },
          include: { company: true },
        });

        if (!user || !user.company) {
          logger.warn('❌ [SCAN] Utilisateur ou organisation introuvable');
          return res.status(404).json({
            success: false,
            message: 'Utilisateur non trouvé',
          });
        }

        tenantSchema = user.company.schemaName;
        req.companyCountry = user.company.country;
        logger.info(`🔍 [SCAN] Format sans schéma - Schéma déduit: ${tenantSchema}, Pays: ${req.companyCountry}, QR: ${employeeQrCode}`);
      } catch (error) {
        logger.error('❌ [SCAN] Erreur lors du décodage du token:', error);
        return res.status(401).json({
          success: false,
          message: 'Token invalide',
        });
      }
    } else {
      logger.warn(`❌ [SCAN] Format QR invalide - reçu: ${qrCode}`);
      return res.status(400).json({
        success: false,
        message: 'Format de QR code invalide',
      });
    }

    logger.info(`🔍 [SCAN] Tenant schema: ${tenantSchema}`);
    logger.info(`🔍 [SCAN] Employee QR code: ${employeeQrCode}`);
    
    // Se connecter au tenant
    logger.info('🔍 [SCAN] Connexion au tenant...');
    const tenantPrisma = getTenantConnection(tenantSchema);
    logger.info('✅ [SCAN] Connexion tenant établie');
    
    // Stocker dans req pour utilisation dans le reste du code
    req.tenantPrisma = tenantPrisma;
    req.tenantSchema = tenantSchema;

    // Vérifier qu'une configuration horaire active existe
    logger.info('🔍 [SCAN] Vérification configuration horaire...');
    const configActive = await req.tenantPrisma.configurationHoraire.findFirst({
      where: { isActive: true },
    });

    if (!configActive) {
      logger.warn('❌ [SCAN] Aucune configuration horaire active');
      return res.status(400).json({
        success: false,
        message: 'Aucune configuration horaire active. Veuillez enregistrer la configuration horaire avant de pouvoir scanner les QR codes.',
      });
    }
    logger.info('✅ [SCAN] Configuration horaire trouvée');

    // Trouver l'employé par QR code
    // On reconstruit le format complet schema:uuid pour la recherche
    const fullQrCode = `${tenantSchema}:${employeeQrCode}`;
    logger.info(`🔍 [SCAN] Recherche employé avec QR: ${fullQrCode}`);
    const employee = await req.tenantPrisma.employee.findUnique({
      where: { qrCode: fullQrCode },
    });

    if (!employee) {
      logger.warn(`❌ [SCAN] Employé non trouvé pour QR: ${fullQrCode}`);
      return res.status(404).json({
        success: false,
        message: 'QR code invalide',
      });
    }
    logger.info(`✅ [SCAN] Employé trouvé: ${employee.fullName} (${employee.matricule})`);

    if (!employee.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Employé inactif',
      });
    }

    // Vérifier si un pointage du même type existe déjà aujourd'hui
    const { start: aujourdhui, end: finJour } = DateHelpers.getTodayInTimezone(req.companyCountry || 'Kenya');
    
    const pointageExistant = await req.tenantPrisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        type: type,
        heurePointage: { gte: aujourdhui, lte: finJour },
      },
    });
    const pointageDejaExistant = !!pointageExistant;

    if (pointageDejaExistant) {
      return res.status(400).json({
        success: false,
        message: `Un pointage de type ${type} a déjà été enregistré aujourd'hui`,
      });
    }

    // NOUVEAU: Vérifier si une entrée existe avant de permettre une sortie
    if (type === 'SORTIE') {
      const entreeExiste = await req.tenantPrisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          type: 'ENTREE',
          heurePointage: { gte: aujourdhui, lte: finJour },
        },
      });

      if (!entreeExiste) {
        return res.status(400).json({
          success: false,
          message: 'Impossible d\'enregistrer une sortie sans entrée préalable aujourd\'hui',
        });
      }
    }

    // Vérification : ne pas permettre de pointer avant l'heure de début (seulement pour ENTREE)
    // if (type === 'ENTREE') {
    //   const config = await req.tenantPrisma.configurationHoraire.findFirst({
    //     where: { isActive: true },
    //   });
      
    //   if (config) {
    //     const maintenant = new Date();
    //     const heureActuelle = `${maintenant.getHours().toString().padStart(2, '0')}:${maintenant.getMinutes().toString().padStart(2, '0')}`;
        
    //     // Convertir en minutes pour comparaison
    //     const convertirEnMinutes = (heure: string): number => {
    //       const [h = 0, m = 0] = heure.split(':').map(Number);
    //       return h * 60 + m;
    //     };
        
    //     const heureActuelleMinutes = convertirEnMinutes(heureActuelle);
    //     const heureDebutMinutes = convertirEnMinutes(config.heureDebut);
        
    //     if (heureActuelleMinutes < heureDebutMinutes) {
    //       return res.status(400).json({
    //         success: false,
    //         message: `Vous ne pouvez pas pointer avant l'heure de début (${config.heureDebut}). Veuillez attendre.`,
    //       });
    //     }
    //   }
    // }

    // Créer le pointage (createdAt sera automatiquement défini par Prisma)
    const attendance = await req.tenantPrisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        location,
        notes,
        heurePointage: new Date(),
      },
      include: {
        employee: true,
      },
    });

    // Créer ou mettre à jour le bilan de présence
    logger.info(`📦 Pointage QR créé - Appel de creerOuMettreAJourBilan pour employé ${employee.id}`);
    try {
      await creerOuMettreAJourBilan(req.tenantPrisma, employee.id, attendance.heurePointage, req.companyCountry || 'Kenya');
      logger.info(`✅ Bilan créé/mis à jour avec succès`);
    } catch (bilanError) {
      logger.error('Erreur lors de la création du bilan (pointage créé quand même):', bilanError);
    }

    res.status(201).json({
      success: true,
      message: 'Pointage enregistré avec succès',
      data: attendance,
    });
  } catch (error: any) {
    logger.error('❌ [SCAN] Erreur lors du pointage par QR code:', error);
    logger.error('❌ [SCAN] Stack trace:', error.stack);
    logger.error('❌ [SCAN] Message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du pointage par QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Obtenir les pointages avec filtres
export const getAttendances = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      type,
    }: AttendanceQueryDto = req.query;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (type) {
      where.type = type;
    }

    const attendances = await req.tenantPrisma.attendance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      include: {
        employee: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Pointages récupérés avec succès',
      data: attendances,
    };

    res.json(response);
  } catch (error) {
    logger.error('Erreur lors de la récupération des pointages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pointages',
    });
  }
};

// Obtenir les pointages d'un employé pour une date
export const getEmployeeAttendanceForDate = async (req: Request, res: Response) => {
  try {
    const { employeeId, date } = req.params;

    // Créer les dates de début et fin de journée (timezone aware)
    const dateRef = new Date(date as string);
    const startOfDay = DateHelpers.getStartOfDayInTimezone(dateRef, req.companyCountry || 'Kenya');
    const endOfDay = DateHelpers.getEndOfDayInTimezone(dateRef, req.companyCountry || 'Kenya');

    const attendances = await req.tenantPrisma.attendance.findMany({
      where: {
        employeeId,
        heurePointage: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { heurePointage: 'asc' },
      include: {
        employee: true,
      },
    });

    res.json({
      success: true,
      message: 'Pointages de la journée récupérés',
      data: attendances,
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des pointages du jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pointages du jour',
    });
  }
};
