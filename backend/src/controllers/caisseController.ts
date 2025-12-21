import type { Request, Response } from 'express';
import { CaisseService } from '../services/caisseService.js';
import { logger } from '../config/logger.js';

// ============================================
// CRUD CAISSES
// ============================================

/**
 * Récupère toutes les caisses (optionnellement filtrées par magasin)
 */
export const getAllCaisses = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    let finalMagasinId = req.query.magasin_id as string | undefined;

    const caisseService = new CaisseService(req.tenantPrisma);

    // Restriction par rôle
    if (user?.role !== 'ADMIN') {
        // Récupérer l'utilisateur complet pour avoir son magasin assigné
        const tenantUser = await req.tenantPrisma.tenantUser.findUnique({
            where: { id: user?.userId },
            select: { magasin_id: true }
        });

        if (!tenantUser?.magasin_id) {
            // Si pas de magasin assigné, l'utilisateur ne voit aucune caisse
            return res.json({ success: true, data: [] });
        }
        finalMagasinId = tenantUser.magasin_id;
    }

    const caisses = finalMagasinId 
      ? await caisseService.getCaissesByMagasin(finalMagasinId)
      : await caisseService.getAllCaisses();

    res.json({ success: true, data: caisses });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des caisses:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des caisses',
    });
  }
};

/**
 * Récupère une caisse par ID
 */
export const getCaisseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const caisse = await caisseService.getCaisseById(id);

    res.json({ success: true, data: caisse });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de la caisse:', error);
    const status = error.message.includes('non trouvée') ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la caisse',
    });
  }
};

/**
 * Crée une nouvelle caisse
 */
export const createCaisse = async (req: Request, res: Response) => {
  try {
    const { code, nom, magasin_id, description } = req.body;

    if (!code || !nom || !magasin_id) {
      return res.status(400).json({
        success: false,
        message: 'Les champs code, nom et magasin_id sont requis',
      });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const caisse = await caisseService.createCaisse({ code, nom, magasin_id, description });

    res.status(201).json({
      success: true,
      message: 'Caisse créée avec succès',
      data: caisse,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création de la caisse:', error);
    const status = error.message.includes('existe déjà') ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la caisse',
    });
  }
};

/**
 * Met à jour une caisse
 */
export const updateCaisse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }

    const { code, nom, description, statut } = req.body;

    const caisseService = new CaisseService(req.tenantPrisma);
    const caisse = await caisseService.updateCaisse(id, { code, nom, description, statut });

    res.json({
      success: true,
      message: 'Caisse mise à jour avec succès',
      data: caisse,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour de la caisse:', error);
    const status = error.message.includes('non trouvée') ? 404 :
                   error.message.includes('existe déjà') ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de la caisse',
    });
  }
};

/**
 * Supprime une caisse
 */
export const deleteCaisse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    await caisseService.deleteCaisse(id);

    res.json({ success: true, message: 'Caisse supprimée avec succès' });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression de la caisse:', error);
    const status = error.message.includes('non trouvée') ? 404 :
                   error.message.includes('session ouverte') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de la caisse',
    });
  }
};

// ============================================
// SESSIONS DE CAISSE
// ============================================

/**
 * Ouvrir une session de caisse
 */
export const ouvrirSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID caisse requis' });
    }

    const utilisateurId = req.user?.userId;
    if (!utilisateurId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { fond_initial, notes } = req.body;

    if (fond_initial === undefined || fond_initial < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fond initial est requis et doit être >= 0',
      });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const session = await caisseService.ouvrirSession({
      caisse_id: id,
      utilisateur_id: utilisateurId,
      fond_initial,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Session ouverte avec succès',
      data: session,
    });
  } catch (error: any) {
    logger.error('Erreur lors de l\'ouverture de session:', error);
    const status = error.message.includes('non trouvée') ? 404 :
                   error.message.includes('déjà') ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ouverture de session',
    });
  }
};

/**
 * Ouvrir une session de caisse via PIN (authentification caissier)
 * Cette route ne nécessite pas d'authentification JWT classique
 */
export const ouvrirSessionParPin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID caisse requis' });
    }

    const { pin, fond_initial, notes } = req.body;

    logger.debug(`[SESSION-PIN] Tentative d'ouverture de session. PIN length: ${pin?.length}`);

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'Le PIN est requis',
      });
    }

    if (fond_initial === undefined || fond_initial < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fond initial est requis et doit être >= 0',
      });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const session = await caisseService.ouvrirSessionParPin({
      caisse_id: id,
      pin,
      fond_initial,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Session ouverte avec succès',
      data: session,
    });
  } catch (error: any) {
    logger.error('Erreur lors de l\'ouverture de session par PIN:', error);
    const status = error.message.includes('non trouvée') ? 404 :
                   error.message.includes('PIN') ? 401 :
                   error.message.includes('déjà') ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de l\'ouverture de session',
    });
  }
};

/**
 * Fermer (clôturer) la session active d'une caisse
 */
export const fermerSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID caisse requis' });
    }

    const { fond_final, notes } = req.body;

    if (fond_final === undefined || fond_final < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fond final (montant compté) est requis et doit être >= 0',
      });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    
    // Trouver la session active de cette caisse
    const sessionActive = await caisseService.getSessionActive(id);
    if (!sessionActive) {
      return res.status(404).json({
        success: false,
        message: 'Aucune session active sur cette caisse',
      });
    }

    const rapport = await caisseService.fermerSession(sessionActive.id, { fond_final, notes });

    res.json({
      success: true,
      message: 'Session clôturée avec succès',
      data: rapport,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la fermeture de session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la fermeture de session',
    });
  }
};

/**
 * Récupérer la session active d'une caisse
 */
export const getSessionActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID caisse requis' });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const session = await caisseService.getSessionActive(id);

    res.json({ success: true, data: session });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de la session active:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la session active',
    });
  }
};

/**
 * Historique des sessions d'une caisse
 */
export const getHistoriqueSessions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID caisse requis' });
    }

    const limit = parseInt(req.query.limit as string) || 30;

    const caisseService = new CaisseService(req.tenantPrisma);
    const sessions = await caisseService.getHistoriqueSessions(id, limit);

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'historique',
    });
  }
};

/**
 * Récupérer la session active de l'utilisateur connecté
 */
export const getMaSession = async (req: Request, res: Response) => {
  try {
    const utilisateurId = req.user?.userId;
    if (!utilisateurId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const session = await caisseService.getSessionActiveUtilisateur(utilisateurId);

    res.json({ success: true, data: session });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de ma session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de la session',
    });
  }
};

/**
 * Détail d'une session (rapport complet)
 */
export const getSessionDetail = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'ID session requis' });
    }

    const caisseService = new CaisseService(req.tenantPrisma);
    const rapport = await caisseService.getSessionDetail(sessionId);

    res.json({ success: true, data: rapport });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du détail de session:', error);
    const status = error.message.includes('non trouvée') ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du détail',
    });
  }
};
