import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscriptionService.js';
import { SubscriptionReceiptPdfService } from '../services/pdf/SubscriptionReceiptPdfService.js';

const subscriptionService = new SubscriptionService();

/**
 * Récupérer les détails d'abonnement d'une organisation
 * Accessible uniquement par SUPER_ADMIN
 */
export const getSubscriptionDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
       res.status(400).json({ message: 'ID de l\'organisation requis' });
       return;
    }

    const details = await subscriptionService.getDetails(companyId);

    res.json(details);
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des détails d\'abonnement:', error);
    const status = error.message === 'Organisation non trouvée' ? 404 : 500;
    res.status(status).json({ message: error.message || 'Erreur lors de la récupération des détails d\'abonnement' });
  }
};

/**
 * Activer un abonnement après négociation du prix
 * Cette fonction est appelée quand le Super Admin débloque une organisation expirée
 * Elle crée un enregistrement dans l'historique des paiements et active l'abonnement
 */
export const activateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { monthlyPrice, durationMonths, notes } = req.body;

    // Validation companyId
    if (!companyId) {
      res.status(400).json({ message: 'ID de l\'organisation requis' });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Validation
    if (typeof monthlyPrice !== 'number' || monthlyPrice <= 0) {
      res.status(400).json({ message: 'Le prix mensuel doit être un nombre positif' });
      return;
    }

    if (!durationMonths || typeof durationMonths !== 'number' || durationMonths <= 0) {
      res.status(400).json({ message: 'La durée en mois doit être un nombre positif' });
      return;
    }

    const result = await subscriptionService.activate({
      companyId,
      adminUserId: req.user.userId,
      monthlyPrice,
      durationMonths,
      notes,
    });

    res.json(result);
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'activation de l\'abonnement:', error);
    const status = error.message === 'Organisation non trouvée' ? 404 : 500;
    res.status(status).json({ message: error.message || 'Erreur lors de l\'activation de l\'abonnement' });
  }
};

/**
 * Renouveler un abonnement existant
 * Ajoute la durée à la date de fin actuelle
 */
export const renewSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { monthlyPrice, durationMonths, notes } = req.body;

    // Validation companyId
    if (!companyId) {
      res.status(400).json({ message: 'ID de l\'organisation requis' });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Validation
    if (typeof monthlyPrice !== 'number' || monthlyPrice <= 0) {
      res.status(400).json({ message: 'Le prix mensuel doit être un nombre positif' });
      return;
    }

    if (!durationMonths || typeof durationMonths !== 'number' || durationMonths <= 0) {
      res.status(400).json({ message: 'La durée en mois doit être un nombre positif' });
      return;
    }

    const result = await subscriptionService.renew({
      companyId,
      adminUserId: req.user.userId,
      monthlyPrice,
      durationMonths,
      notes,
    });

    res.json(result);
  } catch (error: any) {
    console.error('❌ Erreur lors du renouvellement de l\'abonnement:', error);
    const status = error.message === 'Organisation non trouvée' ? 404 : 500;
    res.status(status).json({ message: error.message || 'Erreur lors du renouvellement de l\'abonnement' });
  }
};

/**
 * Récupérer l'historique des paiements d'une organisation
 */
export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
       res.status(400).json({ message: 'ID de l\'organisation requis' });
       return;
    }

    const payments = await subscriptionService.getHistory(companyId);

    res.json(payments);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique des paiements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des paiements' });
  }
};

/**
 * Mettre à jour les notes d'un abonnement
 */
export const updateSubscriptionNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { notes } = req.body;

    if (!companyId) {
       res.status(400).json({ message: 'ID de l\'organisation requis' });
       return;
    }

    const result = await subscriptionService.updateNotes(companyId, notes);

    res.json(result);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des notes:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notes' });
  }
};

/**
 * Télécharger le reçu d'un paiement d'abonnement
 */
export const downloadReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      res.status(400).json({ message: 'ID du paiement requis' });
      return;
    }

    const details = await subscriptionService.getPaymentWithDetails(paymentId);

    const pdfBuffer = await SubscriptionReceiptPdfService.generateReceipt(
      details.payment,
      details.organization,
      details.company,
      {
        userId: req.user?.userId
      }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="recu-abonnement-${details.payment.numero}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('❌ Erreur lors du téléchargement du reçu:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la génération du reçu' });
  }
};
