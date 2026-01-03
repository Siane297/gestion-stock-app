import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage pour les logos d'entreprise
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Récupérer le nom de la compagnie depuis req
    const companyName = req.companyName || 'default';
    
    // Créer le chemin: uploads/images/[company-name]/
    const uploadPath = path.join(__dirname, '../../uploads/images', companyName);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique: logo-timestamp.extension
    const ext = path.extname(file.originalname);
    const filename = `logo-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Extensions autorisées
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Types MIME autorisés
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PNG, JPG et GIF sont autorisés'));
  }
};

// Configuration de multer pour le logo
export const uploadLogo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  }
});

// Configuration de multer pour l'en-tête PDF (utilise le même storage mais nom de fichier différent)
const pdfHeaderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyName = req.companyName || 'default';
    const uploadPath = path.join(__dirname, '../../uploads/images', companyName);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique: pdf-header-timestamp.extension
    const ext = path.extname(file.originalname);
    const filename = `pdf-header-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Configuration de multer pour l'upload groupé (logo + pdfHeader)
const companyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyName = (req as any).companyName || 'default';
    const uploadPath = path.join(__dirname, '../../uploads/images', companyName);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'pdfHeader' ? 'pdf-header' : 'logo';
    const filename = `${prefix}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

export const uploadCompanyFiles = multer({
  storage: companyStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

export const uploadPdfHeader = multer({
  storage: pdfHeaderStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  }
});

// Configuration de multer pour les photos d'employés
const employeePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyName = req.companyName || 'default';
    const uploadPath = path.join(__dirname, '../../uploads/images', companyName, 'employees');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique: employee-photo-{employeeId}-timestamp.extension
    const employeeId = req.params.id || 'unknown';
    const ext = path.extname(file.originalname);
    const filename = `employee-photo-${employeeId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

export const uploadEmployeePhoto = multer({
  storage: employeePhotoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  }
});

// Configuration de multer pour les produits (stockage temporaire avant upload GDrive)
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Utiliser le nom de la compagnie pour séparer les uploads
    const companyName = req.companyName || 'default';
    const uploadPath = path.join(__dirname, '../../uploads/images', companyName, 'products');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nettoyage du nom de fichier pour éviter les caractères spéciaux
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(originalName);
    const filename = `product-${Date.now()}-${path.basename(originalName, ext)}${ext}`;
    cb(null, filename);
  }
});

export const uploadProductImage = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

