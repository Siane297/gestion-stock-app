import type { Request, Response } from 'express';
import { ClientService } from '../services/clientService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère tous les clients
 */
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clientService = new ClientService(req.tenantPrisma);
    
    const clients = await clientService.getAll({
      est_actif: req.query.est_actif === 'false' ? false : undefined,
      search: req.query.search as string
    });

    res.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des clients',
    });
  }
};

/**
 * Récupère un client par ID
 */
export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const clientService = new ClientService(req.tenantPrisma);
    const client = await clientService.getById(id);

    res.json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du client:', error);
    const status = error.message === 'Client non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du client',
    });
  }
};

/**
 * Crée un nouveau client
 */
export const createClient = async (req: Request, res: Response) => {
  try {
    const clientService = new ClientService(req.tenantPrisma);
    const client = await clientService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: client,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création du client:', error);
    const status = error.message.includes('existe déjà') || 
                   error.message.includes('invalide') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création du client',
    });
  }
};

/**
 * Met à jour un client
 */
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const clientService = new ClientService(req.tenantPrisma);
    const client = await clientService.update(id, req.body);

    res.json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: client,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du client:', error);
    const status = error.message === 'Client non trouvé' ? 404 : 
                   error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du client',
    });
  }
};

/**
 * Supprime un client
 */
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const clientService = new ClientService(req.tenantPrisma);
    const result = await clientService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression du client:', error);
    const status = error.message === 'Client non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du client',
    });
  }
};

/**
 * Met à jour le crédit d'un client
 */
export const updateClientCredit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const clientService = new ClientService(req.tenantPrisma);
    const { montant, operation } = req.body;

    const client = await clientService.updateCredit(
      id, 
      parseFloat(montant), 
      operation
    );

    res.json({
      success: true,
      message: 'Crédit mis à jour avec succès',
      data: client,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du crédit:', error);
    const status = error.message === 'Client non trouvé' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du crédit',
    });
  }
};
