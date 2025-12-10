import { Request, Response } from 'express';

// Obtenir tous les types de congé
export const getAllTypesConge = async (req: Request, res: Response) => {
  try {
    const typesConge = await req.tenantPrisma.typeConge.findMany({
      where: { estActif: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Types de congé récupérés avec succès',
      data: typesConge
    });
  } catch (error: any) {
    console.error('Erreur getAllTypesConge:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types de congé',
      error: error.message
    });
  }
};

// Obtenir un type de congé par ID
export const getTypeCongeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const typeConge = await req.tenantPrisma.typeConge.findUnique({
      where: { id },
      include: {
        conges: {
          select: {
            id: true,
            employeId: true,
            dateDebut: true,
            dateFin: true,
            statut: true
          }
        }
      }
    });

    if (!typeConge) {
      return res.status(404).json({
        success: false,
        message: 'Type de congé non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Type de congé récupéré avec succès',
      data: typeConge
    });
  } catch (error: any) {
    console.error('Erreur getTypeCongeById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du type de congé',
      error: error.message
    });
  }
};

// Créer un nouveau type de congé
export const createTypeConge = async (req: Request, res: Response) => {
  try {
    const { nom, description, estPaye, necessiteDocument, couleur } = req.body;

    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du type de congé est requis'
      });
    }

    if (!couleur) {
      return res.status(400).json({
        success: false,
        message: 'La couleur est requise'
      });
    }

    // Vérifier si le type de congé existe déjà
    const existingType = await req.tenantPrisma.typeConge.findFirst({
      where: { nom }
    });

    if (existingType) {
      return res.status(400).json({
        success: false,
        message: 'Ce type de congé existe déjà'
      });
    }

    const typeConge = await req.tenantPrisma.typeConge.create({
      data: {
        nom,
        description,
        estPaye: estPaye !== undefined ? estPaye : true,
        necessiteDocument: necessiteDocument !== undefined ? necessiteDocument : false,
        couleur
      }
    });

    res.status(201).json({
      success: true,
      message: 'Type de congé créé avec succès',
      data: typeConge
    });
  } catch (error: any) {
    console.error('Erreur createTypeConge:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du type de congé',
      error: error.message
    });
  }
};

// Mettre à jour un type de congé
export const updateTypeConge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, description, estPaye, necessiteDocument, couleur, estActif } = req.body;

    const typeConge = await req.tenantPrisma.typeConge.update({
      where: { id },
      data: {
        ...(nom && { nom }),
        ...(description !== undefined && { description }),
        ...(estPaye !== undefined && { estPaye }),
        ...(necessiteDocument !== undefined && { necessiteDocument }),
        ...(couleur && { couleur }),
        ...(estActif !== undefined && { estActif })
      }
    });

    res.json({
      success: true,
      message: 'Type de congé mis à jour avec succès',
      data: typeConge
    });
  } catch (error: any) {
    console.error('Erreur updateTypeConge:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du type de congé',
      error: error.message
    });
  }
};

// Supprimer un type de congé (soft delete)
export const deleteTypeConge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si des congés utilisent ce type
    const congeCount = await req.tenantPrisma.conge.count({
      where: { typeCongeId: id }
    });

    if (congeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce type car ${congeCount} congé(s) l'utilisent`
      });
    }

    await req.tenantPrisma.typeConge.update({
      where: { id },
      data: { estActif: false }
    });

    res.json({
      success: true,
      message: 'Type de congé désactivé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur deleteTypeConge:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du type de congé',
      error: error.message
    });
  }
};
