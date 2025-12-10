import { Request, Response } from 'express';

// Obtenir tous les départements
export const getAllDepartements = async (req: Request, res: Response) => {
  try {
    const departements = await req.tenantPrisma.departement.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      message: 'Départements récupérés avec succès',
      data: departements
    });
  } catch (error: any) {
    console.error('Erreur getAllDepartements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des départements',
      error: error.message
    });
  }
};

// Obtenir un département par ID
export const getDepartementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const departement = await req.tenantPrisma.departement.findUnique({
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

    if (!departement) {
      return res.status(404).json({
        success: false,
        message: 'Département non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Département récupéré avec succès',
      data: departement
    });
  } catch (error: any) {
    console.error('Erreur getDepartementById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du département',
      error: error.message
    });
  }
};

// Créer un nouveau département
export const createDepartement = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du département est requis'
      });
    }

    // Vérifier si le département existe déjà
    const existingDepartement = await req.tenantPrisma.departement.findUnique({
      where: { name }
    });

    if (existingDepartement) {
      return res.status(400).json({
        success: false,
        message: 'Ce département existe déjà'
      });
    }

    const departement = await req.tenantPrisma.departement.create({
      data: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Département créé avec succès',
      data: departement
    });
  } catch (error: any) {
    console.error('Erreur createDepartement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du département',
      error: error.message
    });
  }
};

// Mettre à jour un département
export const updateDepartement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const departement = await req.tenantPrisma.departement.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Département mis à jour avec succès',
      data: departement
    });
  } catch (error: any) {
    console.error('Erreur updateDepartement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du département',
      error: error.message
    });
  }
};

// Supprimer un département (soft delete)
export const deleteDepartement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si des employés utilisent ce département
    const employeeCount = await req.tenantPrisma.employee.count({
      where: { departmentId: id }
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce département car ${employeeCount} employé(s) l'utilisent`
      });
    }

    await req.tenantPrisma.departement.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Département désactivé avec succès'
    });
  } catch (error: any) {
    console.error('Erreur deleteDepartement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du département',
      error: error.message
    });
  }
};
