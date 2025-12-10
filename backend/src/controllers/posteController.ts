import { Request, Response } from 'express';

// Obtenir tous les postes
export const getAllPostes = async (req: Request, res: Response) => {
  try {
    const postes = await req.tenantPrisma.poste.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      message: 'Postes récupérés avec succès',
      data: postes
    });
  } catch (error: any) {
    console.error('Erreur getAllPostes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des postes',
      error: error.message
    });
  }
};

// Obtenir un poste par ID
export const getPosteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const poste = await req.tenantPrisma.poste.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            fullName: true,
            matricule: true
          }
        }
      }
    });

    if (!poste) {
      return res.status(404).json({
        success: false,
        message: 'Poste non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Poste récupéré avec succès',
      data: poste
    });
  } catch (error: any) {
    console.error('Erreur getPosteById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du poste',
      error: error.message
    });
  }
};

// Créer un nouveau poste
export const createPoste = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du poste est requis'
      });
    }

    // Vérifier si le poste existe déjà
    const existingPoste = await req.tenantPrisma.poste.findUnique({
      where: { name }
    });

    if (existingPoste) {
      return res.status(400).json({
        success: false,
        message: 'Ce poste existe déjà'
      });
    }

    const poste = await req.tenantPrisma.poste.create({
      data: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Poste créé avec succès',
      data: poste
    });
  } catch (error: any) {
    console.error('Erreur createPoste:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du poste',
      error: error.message
    });
  }
};

// Mettre à jour un poste
export const updatePoste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const poste = await req.tenantPrisma.poste.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Poste mis à jour avec succès',
      data: poste
    });
  } catch (error: any) {
    console.error('Erreur updatePoste:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du poste',
      error: error.message
    });
  }
};

// Supprimer un poste (soft delete)
export const deletePoste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si des employés utilisent ce poste
    const employeeCount = await req.tenantPrisma.employee.count({
      where: { positionId: id }
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce poste car ${employeeCount} employé(s) l'utilisent`
      });
    }

    await req.tenantPrisma.poste.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Poste désactivé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur deletePoste:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du poste',
      error: error.message
    });
  }
};
