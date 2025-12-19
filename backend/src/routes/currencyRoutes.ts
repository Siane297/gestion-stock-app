import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { prismaPublic } from '../services/tenantService.js';
import { 
  getAllCurrencies, 
  getCurrencyByCountry, 
  getCurrencyByCode, 
  formatAmount,
  Currency,
  DEFAULT_CURRENCY
} from '../utils/countryCurrency.js';

const router: Router = Router();

/**
 * GET /api/currencies
 * Liste toutes les devises disponibles
 * Accessible sans authentification (pour l'inscription)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const currencies = getAllCurrencies();
    
    return res.json({
      success: true,
      data: currencies,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devises:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

/**
 * GET /api/currencies/organization
 * Retourne la devise de l'organisation courante
 * Nécessite authentification
 */
router.get('/organization', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user?.companyId) {
      return res.status(400).json({
        success: false,
        message: 'Aucune organisation associée',
      });
    }

    // Récupérer l'organisation
    const company = await prismaPublic.company.findUnique({
      where: { id: user.companyId },
      select: {
        id: true,
        name: true,
        country: true,
        currency: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée',
      });
    }

    // Déterminer la devise : override manuel > auto-détection par pays
    let currency: Currency;
    let source: 'manual' | 'country';
    
    if (company.currency) {
      const manualCurrency = getCurrencyByCode(company.currency);
      if (manualCurrency) {
        currency = manualCurrency;
        source = 'manual';
      } else {
        currency = getCurrencyByCountry(company.country);
        source = 'country';
      }
    } else {
      currency = getCurrencyByCountry(company.country);
      source = 'country';
    }

    return res.json({
      success: true,
      data: {
        currency,
        source, // 'manual' ou 'country' - pour info admin
        company: {
          id: company.id,
          name: company.name,
          country: company.country,
          currencyOverride: company.currency,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la devise organisation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

/**
 * PUT /api/currencies/organization
 * Modifier la devise de l'organisation (override manuel)
 * Réservé aux Admin
 */
router.put('/organization', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Vérifier que l'utilisateur est admin
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Rôle Admin requis.',
      });
    }
    
    if (!user?.companyId) {
      return res.status(400).json({
        success: false,
        message: 'Aucune organisation associée',
      });
    }

    const { currencyCode } = req.body;
    
    // Si null ou vide, on supprime l'override (retour à auto-détection)
    let newCurrency: string | null = null;
    
    if (currencyCode && currencyCode.trim() !== '') {
      // Vérifier que le code devise est valide
      const currency = getCurrencyByCode(currencyCode);
      if (!currency) {
        return res.status(400).json({
          success: false,
          message: `Code devise invalide: ${currencyCode}`,
        });
      }
      newCurrency = currency.code;
    }

    // Mettre à jour l'organisation
    const updatedCompany = await prismaPublic.company.update({
      where: { id: user.companyId },
      data: { currency: newCurrency },
      select: {
        id: true,
        name: true,
        country: true,
        currency: true,
      },
    });

    // Recalculer la devise effective
    let effectiveCurrency: Currency;
    let source: 'manual' | 'country';
    
    if (updatedCompany.currency) {
      effectiveCurrency = getCurrencyByCode(updatedCompany.currency) || getCurrencyByCountry(updatedCompany.country);
      source = 'manual';
    } else {
      effectiveCurrency = getCurrencyByCountry(updatedCompany.country);
      source = 'country';
    }

    return res.json({
      success: true,
      message: newCurrency 
        ? `Devise changée en ${effectiveCurrency.name} (${effectiveCurrency.code})`
        : 'Devise réinitialisée à la valeur par défaut du pays',
      data: {
        currency: effectiveCurrency,
        source,
        company: {
          id: updatedCompany.id,
          name: updatedCompany.name,
          country: updatedCompany.country,
          currencyOverride: updatedCompany.currency,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la devise:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

/**
 * GET /api/currencies/format
 * Formater un montant avec la devise de l'organisation
 * Utilitaire pour le frontend
 */
router.get('/format', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { amount } = req.query;
    
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide',
      });
    }
    
    if (!user?.companyId) {
      // Fallback : devise par défaut
      const formatted = formatAmount(Number(amount), DEFAULT_CURRENCY);
      return res.json({
        success: true,
        data: { formatted, currency: DEFAULT_CURRENCY },
      });
    }

    // Récupérer l'organisation
    const company = await prismaPublic.company.findUnique({
      where: { id: user.companyId },
      select: { country: true, currency: true },
    });

    if (!company) {
      const formatted = formatAmount(Number(amount), DEFAULT_CURRENCY);
      return res.json({
        success: true,
        data: { formatted, currency: DEFAULT_CURRENCY },
      });
    }

    // Déterminer la devise
    let currency: Currency;
    if (company.currency) {
      currency = getCurrencyByCode(company.currency) || getCurrencyByCountry(company.country);
    } else {
      currency = getCurrencyByCountry(company.country);
    }

    const formatted = formatAmount(Number(amount), currency);
    
    return res.json({
      success: true,
      data: { formatted, currency },
    });
  } catch (error) {
    console.error('Erreur lors du formatage:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

/**
 * GET /api/currencies/by-country/:country
 * Obtenir la devise d'un pays spécifique
 * Utile pour prévisualisation lors de l'inscription
 */
router.get('/by-country/:country', (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    
    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Pays requis',
      });
    }

    const currency = getCurrencyByCountry(country);
    
    return res.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la devise par pays:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

export default router;
