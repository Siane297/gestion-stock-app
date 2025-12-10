import { Router } from 'express';
import {
  getConfigurationActive,
  getAllConfigurations,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
} from '../controllers/configurationHoraireController.js';

const router = Router();

// Routes pour la gestion des configurations horaires
router.get('/active', getConfigurationActive);
router.get('/', getAllConfigurations);
router.post('/', createConfiguration);
router.put('/:id', updateConfiguration);
router.delete('/:id', deleteConfiguration);

export default router;
