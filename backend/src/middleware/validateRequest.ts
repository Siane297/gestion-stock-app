import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '../config/logger.js';

/**
 * Middleware de validation des requêtes avec Joi
 * 
 * @param schema - Schéma Joi à utiliser pour la validation
 * @returns Middleware Express
 * 
 * @example
 * router.post('/register', validateRequest(registerSchema), async (req, res) => {
 *   // req.body est maintenant validé et sanitisé
 * });
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,     // Retourner toutes les erreurs, pas seulement la première
      stripUnknown: true,    // Retirer les champs non définis dans le schéma (protection injection)
      convert: true,         // Convertir les types automatiquement
    });
    
    if (error) {
      // Formater les erreurs de manière lisible
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      // Logger l'erreur de validation (sans données sensibles)
      logger.warn('Validation échouée:', {
        path: req.path,
        errors: errors.map(e => e.field),
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation échouée',
        errors,
      });
    }
    
    // Remplacer req.body par les valeurs validées et sanitisées
    req.body = value;
    next();
  };
};

/**
 * Middleware de validation pour les paramètres de requête (query params)
 */
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      logger.warn('Validation query échouée:', {
        path: req.path,
        errors: errors.map(e => e.field),
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation des paramètres échouée',
        errors,
      });
    }
    
    req.query = value;
    next();
  };
};

/**
 * Middleware de validation pour les paramètres d'URL (params)
 */
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      logger.warn('Validation params échouée:', {
        path: req.path,
        errors: errors.map(e => e.field),
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation des paramètres échouée',
        errors,
      });
    }
    
    req.params = value;
    next();
  };
};
