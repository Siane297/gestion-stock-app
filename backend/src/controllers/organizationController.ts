import { Request, Response } from 'express';
import { OrganizationService } from '../services/organizationService.js';

const organizationService = new OrganizationService();

/**
 * Récupérer toutes les organisations (companies) avec les informations essentielles
 * Accessible uniquement par SUPER_ADMIN
 */
export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizations = await organizationService.getAll();
    res.json(organizations);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des organisations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des organisations' });
  }
};

/**
 * Basculer le statut de blocage d'une organisation
 * Accessible uniquement par SUPER_ADMIN
 */
export const toggleBlockOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
       res.status(400).json({ message: 'ID requis' });
       return;
    }
    const { blocked } = req.body;

    if (typeof blocked !== 'boolean') {
      res.status(400).json({ message: 'Le paramètre "blocked" doit être un booléen' });
      return;
    }

    const result = await organizationService.toggleBlock(id, blocked);

    res.json(result);
  } catch (error) {
    console.error('❌ Erreur lors du changement de statut de l\'organisation:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de l\'organisation' });
  }
};
