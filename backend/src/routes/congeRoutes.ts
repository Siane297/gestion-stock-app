import { Router } from 'express';
import {
  creerDemandeConge,
  modifierStatutConge,
  obtenirCongesEmployeController,
  obtenirCongesParPeriodeController,
  obtenirTypesCongesController,
  annulerCongeController,
} from '../controllers/congeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * @route GET /api/conges/types
 * @desc Obtenir tous les types de congés
 * @access Private
 */
router.get('/types', obtenirTypesCongesController);

/**
 * @route POST /api/conges
 * @desc Créer une nouvelle demande de congé
 * @access Private
 */
router.post('/', creerDemandeConge);

/**
 * @route GET /api/conges/periode
 * @desc Obtenir tous les congés dans une période
 * @access Private
 */
router.get('/periode', obtenirCongesParPeriodeController);

/**
 * @route GET /api/conges/employe/:employeId
 * @desc Obtenir les congés d'un employé spécifique
 * @access Private
 */
router.get('/employe/:employeId', obtenirCongesEmployeController);

/**
 * @route PATCH /api/conges/:id/statut
 * @desc Modifier le statut d'un congé (approuver/refuser)
 * @access Private
 */
router.patch('/:id/statut', modifierStatutConge);

/**
 * @route DELETE /api/conges/:id
 * @desc Annuler un congé
 * @access Private
 */
router.delete('/:id', annulerCongeController);

export default router;
