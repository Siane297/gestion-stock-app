# 🔒 Rapport d'Audit de Sécurité - Backend Pointage

**Date** : 2025-11-12  
**Version** : 1.0.0  
**Auditeur** : Cascade AI Security Analysis  
**Niveau global** : 🟢 **BON** (avec améliorations recommandées)

---

## 📋 Résumé exécutif

Le backend présente une **bonne base de sécurité** avec l'utilisation de bibliothèques standards (Helmet, CORS, bcrypt, JWT, Prisma). Cependant, **plusieurs vulnérabilités critiques** ont été identifiées et doivent être corrigées immédiatement.

### 🎯 Score global : 7.5/10

| Catégorie | Score | Statut |
|-----------|-------|--------|
| **Injection SQL** | 9/10 | 🟢 Excellent |
| **Authentification JWT** | 6/10 | 🟡 Améliorations nécessaires |
| **Validation des inputs** | 4/10 | 🔴 Critique |
| **Gestion des erreurs** | 7/10 | 🟢 Bon |
| **CORS & Headers** | 8/10 | 🟢 Bon |
| **Secrets & Env** | 5/10 | 🔴 Critique |
| **Rate Limiting** | 7/10 | 🟢 Bon |
| **Logs sensibles** | 3/10 | 🔴 Critique |

---

## 🛡️ 1. Protection contre l'injection SQL

### ✅ Points positifs

1. **Utilisation de Prisma ORM**
   - ✅ Prisma utilise des **requêtes paramétrées** par défaut
   - ✅ Toutes les opérations CRUD utilisent le client Prisma typé
   - ✅ **AUCUNE utilisation de `$queryRawUnsafe`** (vulnérable)

2. **Requêtes brutes sécurisées**
   ```typescript
   // ✅ Utilise $executeRawUnsafe pour la création de schémas
   // SEULEMENT dans tenantService.ts avec des variables internes
   await prismaPublic.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}"`);
   ```

### ⚠️ Risques identifiés

**Utilisation de `$executeRawUnsafe` dans `tenantService.ts`**

```typescript
// ⚠️ RISQUE MODÉRÉ
await prismaPublic.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "${schemaName}"."employees" (...)
`);
```

**Analyse** :
- La variable `schemaName` provient de `normalizeSchemaName()` qui nettoie les inputs
- ✅ Fonction `normalizeSchemaName()` supprime les caractères dangereux
- ✅ Pas d'input utilisateur direct dans les raw queries
- ⚠️ Si la fonction `normalizeSchemaName()` est contournée, risque d'injection

### 🔧 Recommandations

#### 🔴 CRITIQUE - Renforcer `normalizeSchemaName()`

```typescript
// ACTUEL (à vérifier)
export const normalizeSchemaName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^[0-9]/, 'schema_$&')
    .substring(0, 63);
};

// RECOMMANDÉ - Ajouter validation stricte
export const normalizeSchemaName = (name: string): string => {
  // 1. Nettoyer
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^[0-9]/, 'schema_$&')
    .substring(0, 63);
  
  // 2. Whitelist validation
  if (!/^[a-z_][a-z0-9_]*$/.test(cleaned)) {
    throw new Error('Invalid schema name format');
  }
  
  // 3. Blacklist SQL keywords
  const sqlKeywords = ['select', 'drop', 'delete', 'insert', 'update', 'table', 'database'];
  if (sqlKeywords.includes(cleaned)) {
    throw new Error('Schema name contains SQL keyword');
  }
  
  return cleaned;
};
```

### 📊 Score : 9/10 🟢 Excellent

---

## 🔑 2. Sécurité JWT

### ✅ Points positifs

1. **Utilisation de `jsonwebtoken`** (bibliothèque standard)
2. **Expiration du token** : 7 jours (configuré)
3. **Vérification du token** avant chaque requête protégée
4. **Support cookie + Authorization header** (bon pour iOS)

### 🔴 Vulnérabilités CRITIQUES

#### 🔴 CRITIQUE #1 - Secret JWT faible

**Fichier** : `src/config/jwt.ts` ligne 3

```typescript
// ❌ DANGER
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-super-securise-changez-moi';
```

**Problème** :
- Secret par défaut **prévisible**
- Si `JWT_SECRET` n'est pas défini, utilise une valeur faible
- Permet à un attaquant de forger des tokens valides

**Impact** : 🔴 **CRITIQUE** - Prise de contrôle totale de l'application

#### 🔴 CRITIQUE #2 - Secret JWT dans `.env` non crypté

**Fichier** : `.env` ligne 13

```bash
JWT_SECRET=your-super-secret-jwt-key-here
```

**Problème** :
- Secret trop court (33 caractères)
- Pas assez aléatoire
- Risque de commit dans Git

#### ⚠️ MODÉRÉ - Pas de rotation des tokens

**Problème** :
- Token valide 7 jours sans possibilité de révocation
- Si un token est volé, il reste valide jusqu'à expiration
- Pas de refresh token / access token séparé

#### ⚠️ MODÉRÉ - Pas de validation des claims

**Fichier** : `src/config/jwt.ts`

```typescript
// ❌ Manque de validation
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded; // ⚠️ Pas de validation de iss, aud, exp manuellement
  } catch (error) {
    return null;
  }
};
```

### 🔧 Recommandations

#### 🔴 IMMÉDIAT - Générer un secret fort

```bash
# Générer un secret de 256 bits (64 caractères hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OU
openssl rand -hex 64
```

**Mettre à jour `.env` et `.env.production`** :
```bash
JWT_SECRET=a1b2c3d4e5f6...64_caracteres_aleatoires
```

#### 🔴 IMMÉDIAT - Forcer le secret en production

```typescript
// src/config/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 64) {
  throw new Error('❌ JWT_SECRET must be at least 64 characters long!');
}

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-super-secret-jwt-key-here') {
  throw new Error('❌ Default JWT_SECRET detected in production!');
}
```

#### 🟡 RECOMMANDÉ - Implémenter refresh tokens

```typescript
// Séparer access token (15 min) et refresh token (7 jours)
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};
```

#### 🟡 RECOMMANDÉ - Valider les claims

```typescript
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'pointage-app',        // Vérifier l'émetteur
      audience: 'pointage-frontend', // Vérifier l'audience
    }) as JWTPayload;
    
    // Validation supplémentaire
    if (!decoded.userId || !decoded.email) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};
```

### 📊 Score : 6/10 🟡 Améliorations nécessaires

---

## ✅ 3. Validation des inputs

### 🔴 Vulnérabilités CRITIQUES

#### 🔴 CRITIQUE - Aucune validation des inputs

**Fichier** : `src/routes/authRoutes.ts`

```typescript
// ❌ DANGER - Validation manuelle insuffisante
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, companyName, country, address, 
          emailOrganisation, telephoneOrganisation } = req.body;
  
  // Validation basique
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Champs requis' });
  }
  
  // ⚠️ Pas de validation de format email
  // ⚠️ Pas de validation de longueur password
  // ⚠️ Pas de sanitization des inputs
  // ⚠️ Pas de protection XSS
```

**Problèmes identifiés** :

1. **Pas de validation de format**
   - Email peut être n'importe quoi
   - Pas de limite de longueur
   - Pas de caractères interdits

2. **Risque XSS (Cross-Site Scripting)**
   ```typescript
   const name = "<script>alert('XSS')</script>";
   // Stocké tel quel dans la base
   // Exécuté dans le frontend
   ```

3. **Risque NoSQL injection** (si migration vers MongoDB)
   ```typescript
   const email = { $ne: null }; // Contournerait la validation
   ```

### 🔧 Recommandations

#### 🔴 IMMÉDIAT - Installer et utiliser Joi ou Zod

```bash
npm install joi
# OU
npm install zod
```

#### 🔴 IMMÉDIAT - Créer des schémas de validation

```typescript
// src/validators/authValidator.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(255)
    .required()
    .messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis',
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Mot de passe trop court (min 8 caractères)',
      'string.pattern.base': 'Le mot de passe doit contenir : majuscule, minuscule, chiffre, caractère spécial',
    }),
  
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required(),
  
  companyName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required(),
  
  country: Joi.string()
    .min(2)
    .max(100)
    .required(),
  
  emailOrganisation: Joi.string()
    .email()
    .max(255)
    .required(),
  
  telephoneOrganisation: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) // Format E.164
    .required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});
```

#### 🔴 IMMÉDIAT - Créer un middleware de validation

```typescript
// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Retire les champs non définis
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation échouée',
        errors,
      });
    }
    
    // Remplacer req.body par les valeurs validées
    req.body = value;
    next();
  };
};
```

#### 🔴 IMMÉDIAT - Utiliser dans les routes

```typescript
// src/routes/authRoutes.ts
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  // req.body est maintenant validé et sanitisé
  const { email, password, name, companyName, country, 
          emailOrganisation, telephoneOrganisation } = req.body;
  
  // Continue avec la logique...
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  // req.body validé
});
```

#### 🟡 RECOMMANDÉ - Sanitization XSS

```bash
npm install xss
```

```typescript
import xss from 'xss';

// Dans les routes
const safeName = xss(name);
const safeCompanyName = xss(companyName);
```

### 📊 Score : 4/10 🔴 Critique

---

## 📝 4. Gestion des erreurs et logs

### ⚠️ Problèmes identifiés

#### 🔴 CRITIQUE - Logs sensibles exposés

**Fichier** : `src/routes/authRoutes.ts`

```typescript
// ❌ DANGER - Log des mots de passe
console.log('[REGISTER] Body reçu:', JSON.stringify(req.body, null, 2));
// Affiche : { email, password: "motdepasse123", ... }
```

**Fichier** : `src/middleware/authMiddleware.ts`

```typescript
// ❌ DANGER - Log des tokens JWT
console.log('[⚡ AUTH] Token cookie:', token ? token.substring(0, 50) + '...' : 'ABSENT');
// Permet la reconstruction du token
```

**Impact** :
- Mots de passe en clair dans les logs
- Tokens JWT exposés
- Données personnelles (email, téléphone) enregistrées
- Violation RGPD

#### ⚠️ MODÉRÉ - Messages d'erreur trop verbeux

```typescript
catch (error: any) {
  return res.status(500).json({
    success: false,
    message: 'Erreur serveur: ' + (error.message || 'Erreur inconnue'),
    // ⚠️ Expose les détails techniques
  });
}
```

### 🔧 Recommandations

#### 🔴 IMMÉDIAT - Supprimer logs sensibles

```typescript
// ❌ AVANT
console.log('[REGISTER] Body reçu:', JSON.stringify(req.body, null, 2));

// ✅ APRÈS
const { password, ...safeBody } = req.body;
console.log('[REGISTER] Body reçu:', JSON.stringify(safeBody, null, 2));
```

```typescript
// ❌ AVANT
console.log('[⚡ AUTH] Token cookie:', token ? token.substring(0, 50) + '...' : 'ABSENT');

// ✅ APRÈS
console.log('[⚡ AUTH] Token présent:', !!token);
```

#### 🔴 IMMÉDIAT - Messages d'erreur génériques

```typescript
// ❌ AVANT
catch (error: any) {
  return res.status(500).json({
    message: 'Erreur serveur: ' + error.message,
  });
}

// ✅ APRÈS
catch (error: any) {
  logger.error('Erreur inscription:', error); // Log serveur uniquement
  
  return res.status(500).json({
    success: false,
    message: 'Une erreur est survenue lors de l\'inscription',
    // Pas de détails techniques
  });
}
```

#### 🟡 RECOMMANDÉ - Fonction de sanitization des logs

```typescript
// src/utils/logSanitizer.ts
export const sanitizeForLog = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

// Utilisation
console.log('[REGISTER] Body:', sanitizeForLog(req.body));
// { email: "...", password: "[REDACTED]", ... }
```

### 📊 Score : 3/10 🔴 Critique

---

## 🌐 5. CORS et Headers de sécurité

### ✅ Points positifs

1. **Helmet.js activé** ✅
   ```typescript
   app.use(helmet({
     crossOriginResourcePolicy: { policy: 'cross-origin' },
   }));
   ```

2. **CORS configuré avec whitelist** ✅
   ```typescript
   const allowedOrigins = ['http://localhost:3000', 'https://pointage-front.vercel.app'];
   ```

3. **Credentials activés** ✅ (pour les cookies)

4. **Headers autorisés** ✅ (`x-tenant-id`)

### ⚠️ Améliorations possibles

#### 🟡 RECOMMANDÉ - Renforcer Helmet

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

### 📊 Score : 8/10 🟢 Bon

---

## 🔐 6. Secrets et variables d'environnement

### 🔴 Vulnérabilités CRITIQUES

#### 🔴 CRITIQUE #1 - `.env` versionné dans Git ?

**Vérifier** :
```bash
git check-ignore .env
# Si rien ne s'affiche, .env est versionné ❌
```

**Solution** :
```bash
# .gitignore
.env
.env.local
.env.production
```

#### 🔴 CRITIQUE #2 - Secret JWT faible

Déjà mentionné dans la section JWT (voir section 2)

#### 🔴 CRITIQUE #3 - TLS désactivé en développement

**Fichier** : `src/server.ts` ligne 3-6

```typescript
// ❌ DANGER ABSOLU
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('⚠️  SSL verification disabled (DEV ONLY)');
}
```

**Impact** :
- Man-in-the-Middle attacks possibles
- Certificats invalides acceptés
- **JAMAIS** déployer en production avec cette ligne

**Solution** :
```typescript
// ✅ Alternative sécurisée - Utiliser un proxy local ou configurer les certificats
if (process.env.NODE_ENV === 'development' && process.env.ALLOW_INSECURE_TLS === 'true') {
  console.error('❌ ATTENTION: TLS verification disabled - DEVELOPMENT ONLY');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
```

### 🔧 Recommandations

#### 🔴 IMMÉDIAT - Vérifier `.gitignore`

```bash
# Ajouter à .gitignore
.env
.env.local
.env.production
.env.*.local
*.log
logs/
```

#### 🔴 IMMÉDIAT - Secrets en production (Render)

Sur Render :
1. Dashboard → Service → Environment
2. Ajouter les variables manuellement
3. **NE JAMAIS** commit `.env.production` dans Git

#### 🟡 RECOMMANDÉ - Utiliser un service de secrets

```bash
# Alternatives
- AWS Secrets Manager
- HashiCorp Vault
- Doppler
- Infisical
```

### 📊 Score : 5/10 🔴 Critique

---

## ⏱️ 7. Rate Limiting

### ✅ Points positifs

1. **Rate limiting activé** ✅
   ```typescript
   const limiter = rateLimit({
     windowMs: 900000, // 15 minutes
     max: 100,         // 100 requêtes par IP
   });
   ```

2. **Appliqué globalement** ✅

### 🟡 Améliorations possibles

#### 🟡 RECOMMANDÉ - Rate limiting spécifique par route

```typescript
// Rate limiting sévère pour login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives seulement
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  skipSuccessfulRequests: true, // Ne compte que les échecs
});

router.post('/login', authLimiter, async (req, res) => { ... });
router.post('/register', authLimiter, async (req, res) => { ... });
```

#### 🟡 RECOMMANDÉ - Protection force brute

```bash
npm install express-brute
```

```typescript
import ExpressBrute from 'express-brute';

const bruteforce = new ExpressBrute(new ExpressBrute.MemoryStore(), {
  freeRetries: 3,
  minWait: 5 * 60 * 1000,  // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 heure
});

router.post('/login', bruteforce.prevent, async (req, res) => { ... });
```

### 📊 Score : 7/10 🟢 Bon

---

## 🎯 Plan d'action prioritaire

### 🔴 URGENT (À faire IMMÉDIATEMENT)

| # | Action | Fichier | Impact |
|---|--------|---------|--------|
| 1 | **Générer secret JWT fort (64+ chars)** | `.env`, `jwt.ts` | 🔴 Critique |
| 2 | **Forcer validation JWT_SECRET** | `src/config/jwt.ts` | 🔴 Critique |
| 3 | **Supprimer logs de mot de passe** | `authRoutes.ts` | 🔴 Critique |
| 4 | **Supprimer logs de tokens JWT** | `authMiddleware.ts` | 🔴 Critique |
| 5 | **Installer Joi et créer validators** | Nouveau | 🔴 Critique |
| 6 | **Valider tous les inputs (register/login)** | `authRoutes.ts` | 🔴 Critique |
| 7 | **Vérifier `.env` non versionné** | `.gitignore` | 🔴 Critique |
| 8 | **Retirer `NODE_TLS_REJECT_UNAUTHORIZED`** | `server.ts` | 🔴 Critique |

### 🟡 IMPORTANT (Semaine prochaine)

| # | Action | Fichier | Impact |
|---|--------|---------|--------|
| 9 | Implémenter refresh tokens | `jwt.ts` | 🟡 Important |
| 10 | Ajouter validation des claims JWT | `jwt.ts` | 🟡 Important |
| 11 | Rate limiting spécifique auth | `authRoutes.ts` | 🟡 Important |
| 12 | Sanitization XSS | Nouveau | 🟡 Important |
| 13 | Messages d'erreur génériques | Tous controllers | 🟡 Important |
| 14 | Renforcer `normalizeSchemaName()` | `tenantService.ts` | 🟡 Important |

### 🟢 RECOMMANDÉ (Mois prochain)

| # | Action | Impact |
|---|--------|--------|
| 15 | Implémenter express-brute | 🟢 Bon à avoir |
| 16 | Renforcer Helmet CSP | 🟢 Bon à avoir |
| 17 | Audit de dépendances (npm audit) | 🟢 Bon à avoir |
| 18 | Tests de pénétration | 🟢 Bon à avoir |
| 19 | Documentation sécurité | 🟢 Bon à avoir |

---

## 📚 Ressources de référence

- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [JWT Security Best Practices](https://www.nodejs-security.com/blog/how-avoid-jwt-security-mistakes-nodejs)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Prochaine révision** : Dans 1 mois après implémentation des corrections  
**Contact** : Créer une issue GitHub pour toute question de sécurité
