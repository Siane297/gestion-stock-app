import Joi from 'joi';

/**
 * Schéma de validation pour l'inscription (register)
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .max(255)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'string.max': 'L\'email ne doit pas dépasser 255 caractères',
      'any.required': 'L\'email est requis',
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.max': 'Le mot de passe ne doit pas dépasser 128 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins : une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)',
      'any.required': 'Le mot de passe est requis',
    }),
  
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne doit pas dépasser 100 caractères',
      'string.pattern.base': 'Le nom contient des caractères invalides',
      'any.required': 'Le nom est requis',
    }),
  
  companyName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Le nom de l\'organisation doit contenir au moins 2 caractères',
      'string.max': 'Le nom de l\'organisation ne doit pas dépasser 100 caractères',
      'any.required': 'Le nom de l\'organisation est requis',
    }),
  
  country: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Le pays doit contenir au moins 2 caractères',
      'string.max': 'Le pays ne doit pas dépasser 100 caractères',
      'any.required': 'Le pays est requis',
    }),
  
  address: Joi.string()
    .max(255)
    .trim()
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'L\'adresse ne doit pas dépasser 255 caractères',
    }),
  
  emailOrganisation: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .max(255)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Format d\'email organisation invalide',
      'string.max': 'L\'email organisation ne doit pas dépasser 255 caractères',
      'any.required': 'L\'email de l\'organisation est requis',
    }),
  
  telephoneOrganisation: Joi.string()
    .pattern(/^\+?[0-9][\d\s\-\(\)]{6,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Format de téléphone invalide (ex: +33612345678, 0612345678 ou +269 32 12 45)',
      'any.required': 'Le téléphone de l\'organisation est requis',
    }),
});

/**
 * Schéma de validation pour la connexion (login)
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'any.required': 'L\'email est requis',
    }),
  
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Le mot de passe est requis',
    }),
});

/**
 * Schéma de validation pour la connexion tenant
 */
export const tenantLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .max(255)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Format d\'email invalide',
      'any.required': 'L\'email est requis',
    }),
  
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'Le mot de passe est requis',
    }),
});
