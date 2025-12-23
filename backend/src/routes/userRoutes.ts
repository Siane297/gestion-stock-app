import express from 'express';
import { getCurrentUser, updateUserProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: express.Router = express.Router();

router.use(authenticate);

/**
 * @route GET /api/users/me
 * @desc Récupérer les informations de l'utilisateur connecté
 * @access Private
 */
router.get('/me', getCurrentUser);

/**
 * @route PUT /api/users/profile
 * @desc Mettre à jour le profil de l'utilisateur connecté
 * @access Private
 */
router.put('/profile', updateUserProfile);

export default router;
