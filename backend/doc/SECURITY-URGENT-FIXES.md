# 🚨 CORRECTIONS SÉCURITÉ URGENTES

## Score global : 7.5/10 🟡

---

## 🔴 CRITIQUE #1 - Secret JWT faible

**Fichier** : `src/config/jwt.ts` ligne 3

### Problème
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-super-securise-changez-moi';
```
- Secret par défaut prévisible
- Permet de forger des tokens valides

### Solution IMMÉDIATE

```bash
# 1. Générer un secret fort
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```typescript
// 2. Modifier jwt.ts
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 64) {
  throw new Error('❌ JWT_SECRET must be at least 64 characters!');
}
```

```bash
# 3. Mettre à jour .env
JWT_SECRET=...64_caracteres_generes...
```

---

## 🔴 CRITIQUE #2 - Logs de mots de passe

**Fichier** : `src/routes/authRoutes.ts` ligne 18

### Problème
```typescript
console.log('[REGISTER] Body reçu:', JSON.stringify(req.body, null, 2));
// Affiche le mot de passe en clair !
```

### Solution IMMÉDIATE

```typescript
const { password, ...safeBody } = req.body;
console.log('[REGISTER] Body reçu:', JSON.stringify(safeBody, null, 2));
```

---

## 🔴 CRITIQUE #3 - Logs de tokens JWT

**Fichier** : `src/middleware/authMiddleware.ts` lignes 22-30

### Problème
```typescript
console.log('[⚡ AUTH] Token cookie:', token ? token.substring(0, 50) + '...' : 'ABSENT');
```

### Solution IMMÉDIATE

```typescript
console.log('[⚡ AUTH] Token présent:', !!token);
// Ne jamais logger le token
```

---

## 🔴 CRITIQUE #4 - Validation des inputs manquante

**Fichier** : `src/routes/authRoutes.ts`

### Problème
- Aucune validation de format email
- Pas de validation de force du mot de passe
- Risque XSS, injection

### Solution IMMÉDIATE

```bash
npm install joi
```

```typescript
// src/validators/authValidator.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required(),
  name: Joi.string().min(2).max(100).trim().required(),
  companyName: Joi.string().min(2).max(100).trim().required(),
});

// src/middleware/validateRequest.ts
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(d => d.message),
      });
    }
    
    req.body = value;
    next();
  };
};

// Dans authRoutes.ts
import { validateRequest } from '../middleware/validateRequest.js';
import { registerSchema } from '../validators/authValidator.js';

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  // req.body est maintenant validé
});
```

---

## 🔴 CRITIQUE #5 - TLS désactivé

**Fichier** : `src/server.ts` lignes 3-6

### Problème
```typescript
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ❌ DANGER
}
```

### Solution IMMÉDIATE

```typescript
// Supprimer complètement OU ajouter protection
if (process.env.NODE_ENV === 'development' && process.env.ALLOW_INSECURE_TLS === 'true') {
  console.error('❌ WARNING: TLS disabled - DEV ONLY');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
```

---

## 🔴 CRITIQUE #6 - .env versionné ?

### Vérifier

```bash
git check-ignore .env
# Si rien ne s'affiche, .env est versionné !
```

### Solution

```bash
# .gitignore
.env
.env.local
.env.production
*.log
logs/
```

---

## ✅ Checklist d'action

- [ ] Générer nouveau JWT_SECRET (64+ chars)
- [ ] Forcer validation JWT_SECRET au démarrage
- [ ] Supprimer logs de password (authRoutes.ts ligne 18)
- [ ] Supprimer logs de token (authMiddleware.ts lignes 22-30)
- [ ] Installer Joi : `npm install joi`
- [ ] Créer validators/authValidator.ts
- [ ] Créer middleware/validateRequest.ts
- [ ] Ajouter validation sur /register et /login
- [ ] Retirer NODE_TLS_REJECT_UNAUTHORIZED OU protéger
- [ ] Vérifier .gitignore pour .env
- [ ] Tester l'application

---

## 📊 Autres problèmes (moins urgents)

### 🟡 IMPORTANT
- Implémenter refresh tokens (access 15min + refresh 7j)
- Rate limiting spécifique auth (5 tentatives / 15min)
- Messages d'erreur génériques (pas de détails techniques)
- Renforcer normalizeSchemaName() contre injection

### 🟢 BON À AVOIR
- Protection brute force (express-brute)
- Renforcer Helmet CSP
- Audit npm (npm audit fix)
- Tests de pénétration

---

**Rapport complet** : Voir `security-audit-report.md`
