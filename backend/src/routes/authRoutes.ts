import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prismaPublic } from '../services/tenantService.js';
import { createTenantSchema, normalizeSchemaName } from '../services/tenantService.js';
import { generateToken, generateRefreshToken, generateAccessToken, verifyToken, JWTPayload } from '../config/jwt.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { logger } from '../config/logger.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, tenantLoginSchema } from '../validators/authValidator.js';
import { DateHelpers } from '../utils/dateHelpers.js';

const router: Router = Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur et création de son organisation
 */
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    // console.log('[REGISTER] Début de l\'inscription');
    
    const { email, password, name, companyName, country, address, emailOrganisation, telephoneOrganisation } = req.body;
    
    // Log sans données sensibles (password) - seulement en dev
    if (process.env.NODE_ENV !== 'production') {
      const { password: _, ...safeBody } = req.body;
      console.log('[REGISTER] Données reçues:', JSON.stringify(safeBody, null, 2));
    }

    // Validation
    if (!email || !password || !name) {
      // console.log('[REGISTER] Validation échouée: champs manquants');
      return res.status(400).json({
        success: false,
        message: 'Email, mot de passe et nom requis',
      });
    }

    if (!companyName || !country) {
      // console.log('[REGISTER] Validation échouée: organisation ou pays manquant');
      return res.status(400).json({
        success: false,
        message: 'Nom de l\'organisation et pays requis',
      });
    }

    if (!emailOrganisation || !telephoneOrganisation) {
      // console.log('[REGISTER] Validation échouée: email ou téléphone organisation manquant');
      return res.status(400).json({
        success: false,
        message: 'Email et téléphone de l\'organisation requis',
      });
    }

    // console.log('[REGISTER] Vérification de l\'utilisateur existant...');
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prismaPublic.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // Générer le nom du schéma (normaliser le nom de l'organisation)
    const schemaName = normalizeSchemaName(companyName);
    // console.log('[REGISTER] Schéma normalisé:', schemaName);

    // console.log('[REGISTER] Vérification de l\'organisation existante...');
    // Vérifier si le nom de schéma existe déjà
    const existingCompany = await prismaPublic.company.findUnique({
      where: { schemaName },
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Ce nom d\'organisation est déjà utilisé. Veuillez en choisir un autre.',
      });
    }

    // console.log('[REGISTER] Hashage du mot de passe...');
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // console.log('[REGISTER] Création de l\'organisation...');
    // Créer l'organisation avec statut PROVISIONING
    const now = new Date();
    const trialEndsAt = DateHelpers.addDaysInTimezone(now, 14, country);
    
    const company = await prismaPublic.company.create({
      data: {
        name: companyName,
        schemaName: schemaName,
        email: email, // Email de l'organisation = email du créateur
        emailOrganisation: emailOrganisation,
        telephoneOrganisation: telephoneOrganisation,
        country: country,
        address: address || null,
        isActive: true,
        // Période d'essai de 14 jours
        trialEndsAt: trialEndsAt,
        subscriptionStatus: 'PROVISIONING', // <-- Statut initial
      },
    });

    logger.info(`Organisation créée (PROVISIONING): ${company.name} (${schemaName})`);

    // Créer l'utilisateur ADMIN public immédiatement pour avoir un compte actif
    const user = await prismaPublic.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: false,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Utilisateur ADMIN créé: ${user.email}`);
    }

    // Lancer la création du schéma en ARRIÈRE-PLAN
    (async () => {
      try {
        if (process.env.NODE_ENV !== 'production') {
          logger.info(`[BACKGROUND] Début création schéma pour ${schemaName}...`);
        }
        
        await createTenantSchema(schemaName);
        
        // Mettre à jour le statut en TRIAL une fois terminé
        await prismaPublic.company.update({
          where: { id: company.id },
          data: { subscriptionStatus: 'TRIAL' }
        });
        
        // Créer les données dans le TENANT (Employé, TenantUser, Magasin)
        const { getTenantConnection } = await import('../services/tenantService.js');
        const tenantPrisma = getTenantConnection(schemaName);

        const matricule = `ADMIN-${Date.now().toString().slice(-6)}`;

        const ownerEmployee = await tenantPrisma.employee.create({
          data: {
            matricule,
            fullName: name,
            email,
            positionId: null,
            departmentId: null,
            isActive: true,
            isOwner: true,
            hireDate: new Date(),
          },
        });

        const ownerTenantUser = await tenantPrisma.tenantUser.create({
          data: {
            id: user.id, // IMPORTANT: garder le même ID
            employeeId: ownerEmployee.id,
            email,
            password: hashedPassword,
            role: 'ADMIN',
            isBlocked: false,
            isOwner: true,
            permissions: JSON.stringify(['accueil', 'employees', 'pointage', 'historique', 'parametre', 'utilisateur']),
          },
        });

        await tenantPrisma.magasin.create({
          data: {
            nom: companyName,
            localisation: address || null,
            telephone: telephoneOrganisation || null,
            email: emailOrganisation || null,
            gerant_id: ownerTenantUser.id,
            est_actif: true,
            heure_ouverture: '08:00',
            heure_fermeture: '18:00',
          },
        });
        
        logger.info(`[BACKGROUND] Initialisation complète pour ${schemaName}`);
        
      } catch (err) {
        logger.error(`[BACKGROUND] Erreur critique lors de la création du tenant ${schemaName}:`, err);
        await prismaPublic.company.update({
          where: { id: company.id },
          data: { subscriptionStatus: 'FAILED' }
        });
      }
    })();
    
    // Générer les tokens JWT avec le companyId
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: company.id,
    };

    const refreshToken = generateRefreshToken(tokenPayload);
    const accessToken = generateAccessToken(tokenPayload);

    // Configuration des cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(isProduction && { domain: undefined }),
    };
    
    res.clearCookie('refresh_token');
    res.clearCookie('auth_token');
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie. Préparation de votre espace en cours...',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        company: {
          id: company.id,
          name: company.name,
        },
        // Indicateur pour le frontend
        requiresProvisioning: true 
      },
    });
  } catch (error: any) {
    console.error('[❌ REGISTER] Erreur lors de l\'inscription:', error);
    console.error('[❌ REGISTER] Stack trace:', error.stack);
    logger.error('Erreur inscription:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + (error.message || 'Erreur inconnue'),
    });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur (Admin ou TenantUser)
 * Détecte automatiquement le type d'utilisateur
 */
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    // 1. Essayer de trouver un utilisateur ADMIN dans la table publique
    const adminUser = await prismaPublic.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (adminUser && adminUser.password) {
      // Vérifier si le compte est actif
      if (!adminUser.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé',
        });
      }

      // Vérifier si l'organisation est active (sauf pour SUPER_ADMIN)
      if (adminUser.role !== 'SUPER_ADMIN' && adminUser.company && !adminUser.company.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Organisation désactivée',
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);

      if (isPasswordValid) {
        // Générer les tokens JWT
        const tokenPayload = {
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          ...(adminUser.companyId && { companyId: adminUser.companyId }),
        };

        const refreshToken = generateRefreshToken(tokenPayload);
        const accessToken = generateAccessToken(tokenPayload);

        // Configuration des cookies adaptée à l'environnement
        const isProduction = process.env.NODE_ENV === 'production';
        
        const refreshCookieOptions = {
          httpOnly: true,
          secure: isProduction, // true en production, false en dev
          sameSite: isProduction ? 'none' as const : 'lax' as const, // none en prod pour cross-domain, lax en dev
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          ...(isProduction && { domain: undefined }), // Pas de domain spécifique en production
        };
        
        console.log('[🍪 ADMIN LOGIN] Configuration cookies:', {
          secure: refreshCookieOptions.secure,
          sameSite: refreshCookieOptions.sameSite,
          isProduction,
          host: req.get('host')
        });
        
        // Nettoyer les anciens cookies
        res.clearCookie('refresh_token');
        res.clearCookie('auth_token');

        res.cookie('refresh_token', refreshToken, refreshCookieOptions);
        if (process.env.NODE_ENV !== 'production') {
          console.log('[✅ ADMIN LOGIN] Cookie refresh_token défini pour', adminUser.email);
        }

        return res.json({
          success: true,
          message: 'Connexion réussie',
          data: {
            accessToken,
            user: {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.name,
              role: adminUser.role,
              company: adminUser.company ? {
                id: adminUser.company.id,
                name: adminUser.company.name,
              } : null,
            },
          },
        });
      }
    }

    // 2. Si pas trouvé ou mot de passe incorrect, chercher dans les TenantUsers
    // Récupérer toutes les organisations actives
    const companies = await prismaPublic.company.findMany({
      where: { isActive: true },
      select: { schemaName: true, id: true, name: true },
    });

    const { getTenantConnection } = await import('../services/tenantService.js');

    // Chercher dans chaque tenant
    for (const company of companies) {
      try {
        const tenantPrisma = getTenantConnection(company.schemaName);
        
        const tenantUser = await tenantPrisma.tenantUser.findUnique({
          where: { email },
          include: {
            employee: {
              include: {
                // department: true,
                position: true,
              },
            },
          },
        });

        if (tenantUser && tenantUser.password) {
          // Vérifier si le compte est bloqué
          if (tenantUser.isBlocked) {
            return res.status(403).json({
              success: false,
              message: 'Compte bloqué. Contactez votre administrateur.',
            });
          }

          // Vérifier si l'employé est actif
          if (!tenantUser.employee.isActive) {
            return res.status(403).json({
              success: false,
              message: 'Compte désactivé',
            });
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(password, tenantUser.password);

          if (isPasswordValid) {
            // Mettre à jour lastLoginAt
            await tenantPrisma.tenantUser.update({
              where: { id: tenantUser.id },
              data: { lastLoginAt: new Date() },
            });

            // Générer les tokens JWT
            const tokenPayload = {
              userId: tenantUser.id,
              email: tenantUser.email,
              role: tenantUser.role,
              tenantId: company.schemaName,
              companyId: company.id,
              employeeId: tenantUser.employeeId,
            };

            const refreshToken = generateRefreshToken(tokenPayload);
            const accessToken = generateAccessToken(tokenPayload);

            // Configuration des cookies adaptée à l'environnement
            const isProduction = process.env.NODE_ENV === 'production';
            
            const refreshCookieOptions = {
              httpOnly: true,
              secure: isProduction, // true en production, false en dev
              sameSite: isProduction ? 'none' as const : 'lax' as const, // none en prod pour cross-domain, lax en dev
              path: '/',
              maxAge: 7 * 24 * 60 * 60 * 1000,
              ...(isProduction && { domain: undefined }), // Pas de domain spécifique en production
            };
            
            console.log('[🍪 TENANT LOGIN] Configuration cookies:', {
              secure: refreshCookieOptions.secure,
              sameSite: refreshCookieOptions.sameSite,
              isProduction,
              host: req.get('host')
            });
            
            res.cookie('refresh_token', refreshToken, refreshCookieOptions);
            if (process.env.NODE_ENV !== 'production') {
              console.log('[✅ TENANT LOGIN] Cookie refresh_token défini pour', tenantUser.email);
            }

            return res.json({
              success: true,
              message: 'Connexion réussie',
              data: {
                accessToken,
                user: {
                  id: tenantUser.id,
                  email: tenantUser.email,
                  role: tenantUser.role,
                  permissions: tenantUser.permissions,
                  employee: {
                    id: tenantUser.employee.id,
                    matricule: tenantUser.employee.matricule,
                    fullName: tenantUser.employee.fullName,
                    // department: tenantUser.employee.department?.name || null,
                    position: tenantUser.employee.position?.name || null,
                  },
                  company: {
                    id: company.id,
                    name: company.name,
                  },
                },
              },
            });
          }
        }
      } catch (tenantError) {
        // Ignorer les erreurs de tenant (table n'existe pas, etc.)
        console.log(`[LOGIN] Erreur tenant ${company.schemaName}:`, tenantError);
      }
    }

    // Si rien n'a été trouvé ou mot de passe incorrect
    return res.status(401).json({
      success: false,
      message: 'Email ou mot de passe incorrect',
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

/**
 * POST /api/auth/tenant-login
 * Connexion d'un utilisateur tenant (employé avec compte)
 */
router.post('/tenant-login', validateRequest(tenantLoginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID requis',
      });
    }

    // Récupérer l'organisation pour avoir les infos complètes
    const company = await prismaPublic.company.findUnique({
      where: { schemaName: tenantId },
    });

    if (!company || !company.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Organisation introuvable ou désactivée',
      });
    }

    // Se connecter au tenant
    const { getTenantConnection } = await import('../services/tenantService.js');
    const tenantPrisma = getTenantConnection(tenantId);

    // Trouver l'utilisateur tenant avec son employé
    const tenantUser = await tenantPrisma.tenantUser.findUnique({
      where: { email },
      include: {
        employee: {
          include: {
            // department: true,
            position: true,
          },
        },
      },
    });

    if (!tenantUser || !tenantUser.password) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier si le compte est bloqué
    if (tenantUser.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Compte bloqué. Contactez votre administrateur.',
      });
    }

    // Vérifier si l'employé est actif
    if (!tenantUser.employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, tenantUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Mettre à jour lastLoginAt
    await tenantPrisma.tenantUser.update({
      where: { id: tenantUser.id },
      data: { lastLoginAt: new Date() },
    });

    // Générer les tokens JWT
    const tokenPayload = {
      userId: tenantUser.id,
      email: tenantUser.email,
      role: tenantUser.role,
      tenantId: tenantId,
      companyId: company.id,
      employeeId: tenantUser.employeeId,
    };

    const refreshToken = generateRefreshToken(tokenPayload);
    const accessToken = generateAccessToken(tokenPayload);

    // Configuration des cookies adaptée à l'environnement
    const isProduction = process.env.NODE_ENV === 'production';
    
    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProduction, // true en production, false en dev
      sameSite: isProduction ? 'none' as const : 'lax' as const, // none en prod pour cross-domain, lax en dev
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      ...(isProduction && { domain: undefined }), // Pas de domain spécifique en production
    };
    
    console.log('[🍪 TENANT LOGIN DIRECT] Configuration cookies:', {
      secure: refreshCookieOptions.secure,
      sameSite: refreshCookieOptions.sameSite,
      isProduction,
      host: req.get('host')
    });
    
    // Nettoyer les anciens cookies pour éviter les conflits
    res.clearCookie('refresh_token');
    res.clearCookie('auth_token');

    res.cookie('refresh_token', refreshToken, refreshCookieOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[✅ TENANT LOGIN] Cookie refresh_token défini pour', tenantUser.email);
    }

    return res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        accessToken,
        user: {
          id: tenantUser.id,
          email: tenantUser.email,
          role: tenantUser.role,
          permissions: tenantUser.permissions,
          employee: {
            id: tenantUser.employee.id,
            matricule: tenantUser.employee.matricule,
            fullName: tenantUser.employee.fullName,
            // department: tenantUser.employee.department?.name || null,
            position: tenantUser.employee.position?.name || null,
          },
          company: {
            id: company.id,
            name: company.name,
          },
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion tenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
    });
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion d'un utilisateur
 */
router.post('/logout', (req: Request, res: Response) => {
  console.log('[🚪 LOGOUT] Déconnexion demandée');
  
  // Configuration des cookies pour clearCookie (doit correspondre aux options de création)
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    path: '/',
  };
  
  // Nettoyer les cookies avec les bonnes options
  res.clearCookie('refresh_token', cookieOptions);
  res.clearCookie('auth_token', cookieOptions); // Compatibilité avec l'ancien système
  
  console.log('[✅ LOGOUT] Cookies nettoyés');
  
  return res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
});

/**
 * POST /api/auth/refresh
 * Renouvellement du token d'accès via le refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // Récupérer le refresh token depuis les cookies
    // Essayer d'abord avec req.cookies (cookie-parser)
    let refreshToken = req.cookies.refresh_token;
    
    // Fallback : parser manuellement le header Cookie si cookie-parser a échoué
    if (!refreshToken) {
      const cookieHeader = req.get('cookie');
      if (cookieHeader) {
        // console.log('[🔄 REFRESH] cookie-parser a échoué, parsing manuel du header Cookie');
        const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {});
        refreshToken = cookies.refresh_token;
      }
    }

    if (!refreshToken) {
      // console.log('[❌ REFRESH] Refresh token manquant dans les cookies');
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant',
      });
    }
    
    // console.log('[🔍 REFRESH] Refresh token trouvé, longueur:', refreshToken.length);

    // Vérifier le refresh token
    const payload = verifyToken(refreshToken);

    if (!payload) {
      res.clearCookie('refresh_token');
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide ou expiré',
      });
    }

    // console.log('[🔍 REFRESH] Payload décodé:', JSON.stringify(payload, null, 2));

    // Vérifier que l'utilisateur existe toujours et est actif
    let user = null;
    let isValid = false;

    if (payload.tenantId) {
      // C'est un TenantUser
      try {
        const { getTenantConnection } = await import('../services/tenantService.js');
        const tenantPrisma = getTenantConnection(payload.tenantId);
        
        const tenantUser = await tenantPrisma.tenantUser.findUnique({
          where: { id: payload.userId },
          include: {
            employee: {
              include: {
                // department: true,
                position: true,
              },
            },
          },
        });

        if (tenantUser && !tenantUser.isBlocked && tenantUser.employee.isActive) {
          // Récupérer les infos de la company
          const company = await prismaPublic.company.findUnique({
            where: { schemaName: payload.tenantId },
          });

          if (company && company.isActive) {
            user = { ...tenantUser, company };
            isValid = true;
          } else {
            isValid = false;
          }
        }
      } catch (error) {
        console.log(`[REFRESH] Erreur tenant ${payload.tenantId}:`, error);
        isValid = false;
      }
    } else {
      // C'est un Admin User
      const adminUser = await prismaPublic.user.findUnique({
        where: { id: payload.userId },
        include: {
          company: true,
        },
      });

      if (adminUser && adminUser.isActive) {
        // Vérifier si l'organisation est active (sauf pour SUPER_ADMIN)
        if (adminUser.role === 'SUPER_ADMIN' || (adminUser.company && adminUser.company.isActive)) {
          user = adminUser;
          isValid = true;
        }
      }
    }

    if (!isValid || !user) {
      res.clearCookie('refresh_token');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou désactivé',
      });
    }

    // Créer un nouveau payload pour l'access token (sans les propriétés JWT internes)
    const newPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId || (user as any).company?.id,
      ...(payload.tenantId && { tenantId: payload.tenantId }),
      ...(payload.employeeId && { employeeId: payload.employeeId })
    };

    // Générer un nouveau access token
    const newAccessToken = generateAccessToken(newPayload);

    // console.log('[✅ REFRESH] Nouveau access token généré pour', payload.email, 'longueur:', newAccessToken.length);

    // Construire les données utilisateur pour la réponse
    let userData: any;

    if (payload.tenantId) {
      // TenantUser - inclure les infos complètes
      const tenantUser = user as any;
      userData = {
        id: tenantUser.id,
        email: tenantUser.email,
        role: tenantUser.role,
        permissions: tenantUser.permissions,
        employee: tenantUser.employee ? {
          id: tenantUser.employee.id,
          matricule: tenantUser.employee.matricule,
          fullName: tenantUser.employee.fullName,
          department: tenantUser.employee.department?.name || null,
          position: tenantUser.employee.position?.name || null,
        } : null,
        company: tenantUser.company ? {
          id: tenantUser.company.id,
          name: tenantUser.company.name,
        } : null,
      };
    } else {
      // AdminUser - inclure les infos de base
      const adminUser = user as any;
      userData = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        company: adminUser.company ? {
          id: adminUser.company.id,
          name: adminUser.company.name,
          country: adminUser.company.country,
          logo: adminUser.company.logo,
        } : null,
      };
    }

    const response = {
      success: true,
      message: 'Token renouvelé avec succès',
      data: {
        accessToken: newAccessToken,
        user: userData, // Inclure les données utilisateur pour éviter un second appel API
      },
    };

    return res.json(response);

  } catch (error: any) {
    console.error('[❌ REFRESH] Erreur lors du renouvellement du token:', error);
    console.error('[❌ REFRESH] Stack trace:', error?.stack);
    
    // Configuration des cookies pour clearCookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      path: '/',
    };
    
    res.clearCookie('refresh_token', cookieOptions);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du renouvellement',
    });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté (Admin ou TenantUser)
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const payload = req.user!;

    // Vérifier si c'est un TenantUser (présence de tenantId)
    if (payload.tenantId) {
      // C'est un TenantUser
      const { getTenantConnection } = await import('../services/tenantService.js');
      const tenantPrisma = getTenantConnection(payload.tenantId);

      const tenantUser = await tenantPrisma.tenantUser.findUnique({
        where: { id: payload.userId },
        include: {
          employee: {
            include: {
              // department: true,
              position: true,
            },
          },
        },
      });

      if (!tenantUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Récupérer les infos de la company avec les infos d'abonnement
      const company = await prismaPublic.company.findUnique({
        where: { schemaName: payload.tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          logo: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
        },
      });

      // Calculer les jours restants
      let daysRemaining: number | null = null;
      if (company) {
        const now = new Date();
        if (company.subscriptionStatus === 'TRIAL' && company.trialEndsAt) {
          daysRemaining = Math.max(0, Math.ceil((company.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        } else if (company.subscriptionStatus === 'ACTIVE' && company.subscriptionEndsAt) {
          daysRemaining = Math.max(0, Math.ceil((company.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }

      return res.json({
        success: true,
        data: { 
          user: {
            id: tenantUser.id,
            email: tenantUser.email,
            role: tenantUser.role,
            permissions: tenantUser.permissions,
            employee: {
              id: tenantUser.employee.id,
              matricule: tenantUser.employee.matricule,
              fullName: tenantUser.employee.fullName,
              // department: tenantUser.employee.department?.name || null,
              position: tenantUser.employee.position?.name || null,
            },
            createdAt: tenantUser.createdAt,
            company: company ? {
              ...company,
              daysRemaining,
            } : null,
          }
        },
      });
    } else {
      // C'est un Admin User
      const user = await prismaPublic.user.findUnique({
        where: { id: payload.userId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              country: true,
              logo: true,
              subscriptionStatus: true,
              trialEndsAt: true,
              subscriptionEndsAt: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Calculer les jours restants pour Admin
      let daysRemaining: number | null = null;
      if (user.company) {
        const now = new Date();
        if (user.company.subscriptionStatus === 'TRIAL' && user.company.trialEndsAt) {
          daysRemaining = Math.max(0, Math.ceil((user.company.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        } else if (user.company.subscriptionStatus === 'ACTIVE' && user.company.subscriptionEndsAt) {
          daysRemaining = Math.max(0, Math.ceil((user.company.subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }

      return res.json({
        success: true,
        data: { 
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            createdAt: user.createdAt,
            company: user.company ? {
              ...user.company,
              daysRemaining,
            } : null,
          }
        },
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

/**
 * GET /api/auth/company-status/:companyId
 * Vérifier le statut de création de l'entreprise
 */
router.get('/company-status/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    const company = await prismaPublic.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        schemaName: true,
        subscriptionStatus: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Si actif, on ne fait rien de spécial, le frontend redirigera
    if (company.subscriptionStatus === 'TRIAL' || company.subscriptionStatus === 'ACTIVE') {
       // Succès
    }

    return res.json({
      success: true,
      data: {
        status: company.subscriptionStatus
      }
    });
  } catch (error) {
    logger.error('Erreur vérification statut:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;
