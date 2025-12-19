import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Configuration
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import posteRoutes from './routes/posteRoutes.js';
import tenantUserRoutes from './routes/tenantUserRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import companyRoutes from './routes/companyRoutes.js';

// Routes Stock
import clientRoutes from './routes/clientRoutes.js';
import fournisseurRoutes from './routes/fournisseurRoutes.js';
import magasinRoutes from './routes/magasinRoutes.js';
import categorieProduitRoutes from './routes/categorieProduitRoutes.js';
import uniteRoutes from './routes/uniteRoutes.js';
import produitRoutes from './routes/produitRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import achatRoutes from './routes/achatRoutes.js';
import venteRoutes from './routes/venteRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { identifyTenant, requireTenant } from './middleware/tenantMiddleware.js';
import { debugMiddleware, cookieErrorHandler } from './middleware/debugMiddleware.js';

// Charger les variables d'environnement
// dotenv.config(); // Loaded via import 'dotenv/config' at the top

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

// Configuration pour Render (behind proxy)
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  app.set('trust proxy', 1);
  console.log('🔧 [Server] Trust proxy activé pour Render');
}

// Rate limiting - Configuration sécurisée alignée avec le frontend
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '150'), // limite chaque IP à 150 requêtes par 5 minutes
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
  },
  standardHeaders: true, // Inclure les headers `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
});

// Configuration CORS avec support multi-origines
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim().replace(/\/$/, '')) // Enlever les slashes finaux
  : ['http://localhost:3000'];

// Toujours ajouter l'URL de Vercel en production
if (process.env.NODE_ENV === 'production' && !allowedOrigins.includes('https://gestion-stock-km.vercel.app')) {
  allowedOrigins.push('https://gestion-stock-km.vercel.app');
}

console.log('CORS: Origines autorisées:', allowedOrigins);

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (comme Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Normaliser l'origine (enlever les slashes finaux)
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      // console.log(`CORS: Origine autorisée - ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS: Origine non autorisée - ${origin}`);
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
  credentials: true, // CRITIQUE : Permet l'envoi de cookies cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Middleware supplémentaire pour forcer les headers CORS sur toutes les réponses
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin) || process.env.NODE_ENV === 'production') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, X-Content-Type-Options');
    }
  }
  next();
});
app.use(limiter);

// Middleware de débogage (en production uniquement si DEBUG_REQUESTS=true)
app.use(debugMiddleware);
app.use(cookieErrorHandler);

// Middleware de logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
}));

// Middleware pour parser JSON et cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Servir les fichiers statiques (uploads)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes API
// Routes publiques (pas de tenant requis)
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes); // Super admin only
app.use('/api/subscriptions', subscriptionRoutes); // Super admin only

// Route publique de scan QR (avant les middlewares tenant)




// Routes tenant (nécessitent une organisation)
app.use('/api/employees', identifyTenant, requireTenant, employeeRoutes);
app.use('/api/postes', identifyTenant, requireTenant, posteRoutes);
app.use('/api/tenant-users', identifyTenant, requireTenant, tenantUserRoutes);
app.use('/api/companies', identifyTenant, requireTenant, companyRoutes);
app.use('/api/pdf', pdfRoutes); // Routes PDF avec middleware inclus dans pdfRoutes

// Routes gestion stock
app.use('/api/clients', identifyTenant, requireTenant, clientRoutes);
app.use('/api/fournisseurs', identifyTenant, requireTenant, fournisseurRoutes);
app.use('/api/magasins', identifyTenant, requireTenant, magasinRoutes);
app.use('/api/categories-produits', identifyTenant, requireTenant, categorieProduitRoutes);
app.use('/api/unites-produits', identifyTenant, requireTenant, uniteRoutes);
app.use('/api/produits', identifyTenant, requireTenant, produitRoutes);
app.use('/api/stock', identifyTenant, requireTenant, stockRoutes);
app.use('/api/achats', identifyTenant, requireTenant, achatRoutes);
app.use('/api/ventes', identifyTenant, requireTenant, venteRoutes);
app.use('/api/audit', identifyTenant, requireTenant, auditRoutes);
app.use('/api/dashboard', identifyTenant, requireTenant, dashboardRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Gestion de Stock et vente - Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      attendance: '/api/attendance',
      stats: '/api/stats',
      postes: '/api/postes',
      departements: '/api/departements',
      health: '/health',
    },
  });
});

// Middleware d'erreur (doit être en dernier)
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
// Service de vérification des abonnements
import { initSubscriptionCron } from './services/subscriptionCronService.js';

const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDatabase();
    
    // Initialiser le cron de vérification des abonnements
    initSubscriptionCron();
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
        logger.info(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`📡 API disponible sur: http://localhost:${PORT}`);
        logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      } else {
        logger.info(`🚀 Serveur démarré sur le port ${PORT} [Production]`);
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt avec déconnexion Prisma
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} reçu, arrêt du serveur...`);
  
  try {
    // Déconnecter toutes les instances Prisma
    const { prismaPublic } = await import('./services/tenantService');
    await prismaPublic.$disconnect();
    logger.info('✅ Prisma déconnecté proprement');
  } catch (error) {
    logger.error('Erreur lors de la déconnexion Prisma:', error);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Gestion des erreurs non gérées
process.on('uncaughtException', (error) => {
  logger.error('❌ Erreur non gérée:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promise rejetée non gérée:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Démarrer le serveur
startServer();

export default app;
