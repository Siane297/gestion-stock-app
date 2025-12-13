import type { Request, Response } from 'express';
import { AuditService } from '../services/auditService.js';
import { logger } from '../config/logger.js';

/**
 * Récupère les logs d'audit
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const auditService = new AuditService(req.tenantPrisma);
    
    const logs = await auditService.getLogs({
      entity: req.query.entity as any,
      entity_id: req.query.entity_id as string,
      action: req.query.action as any,
      utilisateur_id: req.query.user_id as string,
      limit: req.query.limit ? parseInt(String(req.query.limit)) : 50
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des logs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des logs',
    });
  }
};

/**
 * Historique d'une entité spécifique
 */
export const getEntityHistory = async (req: Request, res: Response) => {
  try {
    const { entity, entity_id } = req.params;
    if (!entity || !entity_id) {
      return res.status(400).json({ success: false, message: 'Entity et entity_id requis' });
    }
    const auditService = new AuditService(req.tenantPrisma);
    
    const history = await auditService.getEntityHistory(entity as any, entity_id);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'historique',
    });
  }
};

/**
 * Actions d'un utilisateur
 */
export const getUserActions = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id requis' });
    }
    const auditService = new AuditService(req.tenantPrisma);
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 50;
    
    const actions = await auditService.getUserActions(user_id, limit);

    res.json({
      success: true,
      data: actions,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des actions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des actions',
    });
  }
};

/**
 * Résumé des activités récentes
 */
export const getActivitySummary = async (req: Request, res: Response) => {
  try {
    const auditService = new AuditService(req.tenantPrisma);
    const hours = req.query.hours ? parseInt(String(req.query.hours)) : 24;
    
    const summary = await auditService.getRecentActivitySummary(hours);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du résumé:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du résumé',
    });
  }
};
