import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import type { AppError } from '../types/index.js';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Erreur interne du serveur';

  // Erreur personnalisée
  if ('statusCode' in error) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Erreur Prisma
  else if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Erreur de base de données';
  }
  // Erreur de validation Joi
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  }
  // Erreur JWT
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré';
  }
  // Autres erreurs
  else {
    message = error.message || 'Erreur interne du serveur';
  }

  // Log de l'erreur
  logger.error(`${statusCode} - ${message} - ${req.method} ${req.url} - ${req.ip}`, {
    error: error.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Réponse d'erreur
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
