import type { Request, Response } from 'express';
import { ProduitService } from '../services/produitService.js';
import { logger } from '../config/logger.js';

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

    // Gestion des uploads (Multi-files)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const companyName = req.companyName || 'default';
      
      const files = req.files as Express.Multer.File[];
      
      files.forEach(file => {
          const imageUrl = `/uploads/images/${companyName}/products/${file.filename}`;
          
          if (file.fieldname === 'image') {
              // Image principale du produit
              productData.image_url = imageUrl;
              productData.image_id = file.filename;
          } else {
              // Vérifier si c'est une image de conditionnement (via image_key)
              // Le parsing des conditionnements se fait plus bas, mais on peut préparer une map ou le faire après parsing.
              // Le plus simple : on parse d'abord, ensuite on assigne.
              // Mais ici on est AVANT le parsing JSON des conditionnements.
              // Sauf que le file upload est déjà fait.
          }
      });
    }

    // Parsing nécessaire car FormData envoie tout en string
    if (typeof productData.conditionnements === 'string') {
        try {
            productData.conditionnements = JSON.parse(productData.conditionnements);
        } catch (e) {
            logger.warn("Erreur parsing conditionnements", e);
        }
    }
    
    // Assignation des images aux conditionnements après parsing
    if (req.files && Array.isArray(req.files) && productData.conditionnements && Array.isArray(productData.conditionnements)) {
        const companyName = req.companyName || 'default';
        const files = req.files as Express.Multer.File[];
        
        productData.conditionnements.forEach((cond: any) => {
            if (cond.image_key) {
                const file = files.find(f => f.fieldname === cond.image_key);
                if (file) {
                    cond.image_url = `/uploads/images/${companyName}/products/${file.filename}`;
                    // cond.image_id = file.filename; // si besoin
                    delete cond.image_key; // Nettoyage
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

    // Gestion des uploads (Multi-files)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const companyName = req.companyName || 'default';
      const files = req.files as Express.Multer.File[];
      
      files.forEach(file => {
          const imageUrl = `/uploads/images/${companyName}/products/${file.filename}`;
          
          if (file.fieldname === 'image') {
              productData.image_url = imageUrl;
              productData.image_id = file.filename;
          }
      });
    }

    // Parsing et typage (FormData)
    if (typeof productData.conditionnements === 'string') {
         try {
            productData.conditionnements = JSON.parse(productData.conditionnements);
        } catch (e) {
            logger.warn("Erreur parsing conditionnements update", e);
        }
    }

    // Assignation des images aux conditionnements après parsing
    if (req.files && Array.isArray(req.files) && productData.conditionnements && Array.isArray(productData.conditionnements)) {
        const companyName = req.companyName || 'default';
        const files = req.files as Express.Multer.File[];
        
        productData.conditionnements.forEach((cond: any) => {
            if (cond.image_key) {
                const file = files.find(f => f.fieldname === cond.image_key);
                if (file) {
                    cond.image_url = `/uploads/images/${companyName}/products/${file.filename}`;
                    delete cond.image_key;
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
