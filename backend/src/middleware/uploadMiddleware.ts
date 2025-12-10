import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour attacher le nom de la compagnie à la requête
 * Utilisé pour les uploads de fichiers
 */
export const attachCompanyName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.companyId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID manquant',
      });
    }

    // Récupérer le nom de la compagnie
    const { prismaPublic } = await import('../services/tenantService.js');
    const company = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { name: true }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée',
      });
    }

    // Attacher le nom de la compagnie à la requête
    req.companyName = company.name;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nom de l\'organisation',
    });
  }
};
