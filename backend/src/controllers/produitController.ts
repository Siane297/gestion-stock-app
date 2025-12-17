import type { Request, Response } from 'express';
import { ProduitService } from '../services/produitService.js';
import { logger } from '../config/logger.js';
import { CloudinaryService } from '../services/CloudinaryService.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Récupère tous les produits
 */
export const getAllProduits = async (req: Request, res: Response) => {
  try {
    const produitService = new ProduitService(req.tenantPrisma);
    
    const produits = await produitService.getAll({
      search: req.query.search as string,
      categorie_id: req.query.categorie_id as string,
      est_actif: req.query.est_actif === 'false' ? false : true
    });

    res.json({
      success: true,
      data: produits,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des produits',
    });
  }
};

/**
 * Récupère un produit par ID
 */
export const getProduitById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const produit = await produitService.getById(id);

    res.json({
      success: true,
      data: produit,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération du produit:', error);
    const status = error.message === 'Produit non trouvé' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du produit',
    });
  }
};

/**
 * Crée un nouveau produit
 */

export const createProduit = async (req: Request, res: Response) => {
  try {
    const produitService = new ProduitService(req.tenantPrisma);
    const productData = req.body;

    // Map pour stocker les fichiers uploadés : filename -> { url, public_id }
    const uploadedFiles: Record<string, { url: string, public_id: string }> = {};

    // Gestion des uploads (Multi-files) -> Cloudinary
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const companyName = req.companyName || 'default';
      const files = req.files as Express.Multer.File[];
      
      for (const file of files) {
          try {
              // Générer un ID public basé sur le nom de fichier généré par Multer (contient déjà un timestamp)
              const publicId = `${companyName}-product-${path.parse(file.filename).name}`;
              
              const result = await CloudinaryService.uploadImage(
                  file.path,
                  'products',
                  publicId
              );

              uploadedFiles[file.filename] = {
                  url: result.secure_url,
                  public_id: result.public_id
              };

              // Supprimer le fichier local temporaire
              await fs.unlink(file.path).catch(err => logger.warn(`Impossible de supprimer le fichier temp ${file.path}`, err));
          } catch (error) {
              logger.error(`Erreur upload Cloudinary pour ${file.originalname}:`, error);
          }
      }

      // Assigner l'image principale
      const mainImage = files.find(f => f.fieldname === 'image');
      if (mainImage) {
          const uploadedMain = uploadedFiles[mainImage.filename];
          if (uploadedMain) {
              productData.image_url = uploadedMain.url;
              productData.image_id = uploadedMain.public_id;
          }
      }
    }

    // Parsing nécessaire car FormData envoie tout en string
    if (typeof productData.conditionnements === 'string') {
        try {
            productData.conditionnements = JSON.parse(productData.conditionnements);
        } catch (e) {
            logger.warn("Erreur parsing conditionnements", e);
        }
    }
    
    // Assignation des images aux conditionnements
    if (req.files && Array.isArray(req.files) && productData.conditionnements && Array.isArray(productData.conditionnements)) {
        const files = req.files as Express.Multer.File[];
        
        productData.conditionnements.forEach((cond: any) => {
            if (cond.image_key) {
                const file = files.find(f => f.fieldname === cond.image_key);
                if (file) {
                    const uploadedCond = uploadedFiles[file.filename];
                    if (uploadedCond) {
                        cond.image_url = uploadedCond.url;
                        delete cond.image_key;
                    }
                }
            }
        });
    }
    // Conversion des types numériques si nécessaire (FormData envoie des strings)
    if (productData.prix_vente) productData.prix_vente = Number(productData.prix_vente);
    if (productData.prix_achat) productData.prix_achat = Number(productData.prix_achat);
    if (productData.marge_min_pourcent) productData.marge_min_pourcent = Number(productData.marge_min_pourcent);
    if (productData.tva_pourcentage) productData.tva_pourcentage = Number(productData.tva_pourcentage);
    if (productData.est_actif === 'true') productData.est_actif = true;
    if (productData.est_actif === 'false') productData.est_actif = false;
    if (productData.gere_peremption === 'true') productData.gere_peremption = true;
    if (productData.gere_peremption === 'false') productData.gere_peremption = false;


    const produit = await produitService.create(productData);

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: produit,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la création du produit:', error);
    const status = error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la création du produit',
    });
  }
};

/**
 * Met à jour un produit
 */
export const updateProduit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const productData = req.body;

    // Map pour stocker les fichiers uploadés
    const uploadedFiles: Record<string, { url: string, public_id: string }> = {};

    // Gestion des uploads (Multi-files) -> Cloudinary
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const companyName = req.companyName || 'default';
      const files = req.files as Express.Multer.File[];
      
      for (const file of files) {
          try {
              const publicId = `${companyName}-product-${path.parse(file.filename).name}`;
              
              const result = await CloudinaryService.uploadImage(
                  file.path,
                  'products',
                  publicId
              );

              uploadedFiles[file.filename] = {
                  url: result.secure_url,
                  public_id: result.public_id
              };

              await fs.unlink(file.path).catch(err => logger.warn(`Impossible de supprimer le fichier temp ${file.path}`, err)); // Delete local
          } catch (error) {
               logger.error(`Erreur upload Cloudinary update pour ${file.originalname}:`, error);
          }
      }

      // Image principale
      const mainImage = files.find(f => f.fieldname === 'image');
      if (mainImage) {
          const uploadedMain = uploadedFiles[mainImage.filename];
          if (uploadedMain) {
              productData.image_url = uploadedMain.url;
              productData.image_id = uploadedMain.public_id;
          }
      }
    }

    // Parsing et typage (FormData)
    if (typeof productData.conditionnements === 'string') {
         try {
            productData.conditionnements = JSON.parse(productData.conditionnements);
        } catch (e) {
            logger.warn("Erreur parsing conditionnements update", e);
        }
    }

    // Assignation des images aux conditionnements
    if (req.files && Array.isArray(req.files) && productData.conditionnements && Array.isArray(productData.conditionnements)) {
        const files = req.files as Express.Multer.File[];
        
        productData.conditionnements.forEach((cond: any) => {
            if (cond.image_key) {
                const file = files.find(f => f.fieldname === cond.image_key);
                if (file) {
                    const uploadedCond = uploadedFiles[file.filename];
                    if (uploadedCond) {
                        cond.image_url = uploadedCond.url;
                        delete cond.image_key;
                    }
                }
            }
        });
    }
    if (productData.prix_vente) productData.prix_vente = Number(productData.prix_vente);
    if (productData.prix_achat) productData.prix_achat = Number(productData.prix_achat);
    if (productData.marge_min_pourcent) productData.marge_min_pourcent = Number(productData.marge_min_pourcent);
    if (productData.est_actif === 'true') productData.est_actif = true;
    if (productData.est_actif === 'false') productData.est_actif = false;
    if (productData.gere_peremption === 'true') productData.gere_peremption = true;
    if (productData.gere_peremption === 'false') productData.gere_peremption = false;

    const produit = await produitService.update(id, productData);

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: produit,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la mise à jour du produit:', error);
    const status = error.message === 'Produit non trouvé' ? 404 : 
                   error.message.includes('existe déjà') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour du produit',
    });
  }
};

/**
 * Supprime un produit
 */
export const deleteProduit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const result = await produitService.delete(id);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la suppression du produit:', error);
    const status = error.message === 'Produit non trouvé' ? 404 : 
                   error.message.includes('stock positif') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression du produit',
    });
  }
};

/**
 * Récupère l'historique des prix
 */
export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID requis' });
    }
    const produitService = new ProduitService(req.tenantPrisma);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const history = await produitService.getPriceHistory(id, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    logger.error('Erreur lors de la récupération de l\'historique des prix:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'historique des prix',
    });
  }
};
