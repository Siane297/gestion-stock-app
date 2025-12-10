import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

/**
 * Middleware de débogage pour la production Render
 */
export const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log uniquement en production pour déboguer les problèmes Render
  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_REQUESTS === 'true') {
    console.log(`[🔍 DEBUG] ${req.method} ${req.path}`);
    console.log(`[🔍 DEBUG] Headers:`, {
      origin: req.get('origin'),
      'user-agent': req.get('user-agent')?.substring(0, 50) + '...',
      authorization: req.get('authorization') ? 'Bearer ***' : 'absent',
      'content-type': req.get('content-type'),
      'x-forwarded-for': req.get('x-forwarded-for'),
      'x-forwarded-proto': req.get('x-forwarded-proto'),
    });
    console.log(`[🔍 DEBUG] Cookies:`, Object.keys(req.cookies || {}));
    
    if (req.body && Object.keys(req.body).length > 0) {
      const { password, ...safeBody } = req.body;
      console.log(`[🔍 DEBUG] Body:`, JSON.stringify(safeBody, null, 2));
    }
  }
  
  next();
};

/**
 * Middleware de gestion d'erreurs pour les cookies
 */
export const cookieErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  const originalCookie = res.cookie.bind(res);
  
  res.cookie = function(name: string, value: any, options?: any) {
    try {
      // Log seulement si DEBUG_REQUESTS est activé
      if (process.env.DEBUG_REQUESTS === 'true') {
        console.log(`[🍪 COOKIE] Définition de ${name}:`, {
          secure: options?.secure,
          sameSite: options?.sameSite,
          httpOnly: options?.httpOnly,
          domain: options?.domain,
          path: options?.path,
          host: req.get('host'),
          proto: req.get('x-forwarded-proto') || req.protocol,
        });
      }
      
      return originalCookie(name, value, options);
    } catch (error) {
      console.error(`[❌ COOKIE] Erreur lors de la définition de ${name}:`, error);
      return res;
    }
  };
  
  next();
};
