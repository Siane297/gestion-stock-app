import type { Request, Response } from 'express';
import type { CreateEmployeeDto, UpdateEmployeeDto, ApiResponse } from '../types/index.js';
import { logger } from '../config/logger.js';
import { EmployeeService } from '../services/employeeService.js';

// Helper pour instancier le service
const getService = (req: Request) => {
  return new EmployeeService(req.tenantPrisma, req.tenantSchema);
};

// Obtenir tous les employés
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { search, isActive } = req.query;
    const service = getService(req);
    
    // cast query params safely
    const filters = {
      search: search ? String(search) : undefined,
      isActive: isActive === 'true' ? true : (isActive === 'false' ? false : undefined)
    };

    const employees = await service.getAll(filters);

    const response: ApiResponse = {
      success: true,
      message: 'Employés récupérés avec succès',
      data: employees,
    };
    res.json(response);
  } catch (error: any) {
    logger.error('Erreur getAllEmployees:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};

// Obtenir un employé par ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID manquant' });

    const service = getService(req);
    const employee = await service.getById(id);
    
    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employé non trouvé' });
    }

    res.json({ success: true, message: 'Employé récupéré', data: employee });
  } catch (error: any) {
    logger.error('Erreur getEmployeeById:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};

// Créer un employé
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const service = getService(req);
    const employee = await service.create(req.body);
    res.status(201).json({ success: true, message: 'Employé créé avec succès', data: employee });
  } catch (error: any) {
    logger.error('Erreur createEmployee:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mettre à jour un employé
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID manquant' });

    const service = getService(req);
    const employee = await service.update(id, req.body);
    res.json({ success: true, message: 'Employé mis à jour', data: employee });
  } catch (error: any) {
    logger.error('Erreur updateEmployee:', error);
    const status = error.message === 'Employé non trouvé' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Supprimer un employé
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID manquant' });

    const service = getService(req);
    await service.delete(id);
    res.json({ success: true, message: 'Employé supprimé avec succès' });
  } catch (error: any) {
    logger.error('Erreur deleteEmployee:', error);
    const status = error.message === 'Employé non trouvé' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Upload Photo
export const uploadEmployeePhoto = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID manquant' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    
    const service = getService(req);
    const result = await service.uploadPhoto(id, req.file, req.companyName || 'default');
    
    res.json({ success: true, message: 'Photo uploadée', data: result });
  } catch (error: any) {
    logger.error('Erreur uploadEmployeePhoto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Photo
export const deleteEmployeePhoto = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'ID manquant' });

    const service = getService(req);
    const result = await service.deletePhoto(id, req.companyName || 'default');
    res.json({ success: true, message: 'Photo supprimée', data: result });
  } catch (error: any) {
    logger.error('Erreur deleteEmployeePhoto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
