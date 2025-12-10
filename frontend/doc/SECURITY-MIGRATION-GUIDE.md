# Guide de Migration - Sécurisation de l'Authentification Frontend

## 🚨 Problèmes de Sécurité Identifiés

### Vulnérabilités Critiques
1. **localStorage utilisé pour tokens JWT** - Vulnérable aux attaques XSS
2. **Configuration CORS dangereuse** - Risque CSRF avec credentials: true
3. **Absence de headers de sécurité** - Pas de CSP, X-Frame-Options, etc.
4. **Validation uniquement côté client** - Bypassable
5. **Messages d'erreur détaillés exposés** - Information disclosure

### Problème Spécifique iOS Safari
- localStorage peut être bloqué en navigation privée
- Risques de sécurité accrus sur mobile
- Nécessité d'une solution compatible et sécurisée

## 🛡️ Solution Implémentée

### Approche Hybride (Memory + HttpOnly Cookies)

#### 1. Refresh Token (HttpOnly Cookie)
- **Durée de vie** : Long-lived (7-30 jours)
- **Stockage** : Cookie HttpOnly, Secure, SameSite=Strict
- **Usage** : Uniquement pour renouveler les access tokens
- **Sécurité** : Inaccessible via JavaScript, résistant aux XSS

#### 2. Access Token (Mémoire)
- **Durée de vie** : Short-lived (15-30 minutes)
- **Stockage** : Variables JavaScript/state management
- **Usage** : Authentification des requêtes API
- **Sécurité** : Perdu au refresh, renouvelé automatiquement

## 📁 Fichiers Créés/Modifiés

### Nouveaux Composables Sécurisés
1. **`composables/useSecureAuth.ts`** - Authentification sécurisée
2. **`composables/useSecureApi.ts`** - API calls sécurisés

### Configuration Sécurité
1. **`nuxt.config.ts`** - Headers de sécurité avec nuxt-security

## 🔧 Migration des Composables Existants

### Étapes de Migration

#### 1. Remplacer useAuthApi par useSecureAuth
```typescript
// AVANT (non sécurisé)
const { login, register, logout } = useAuthApi();

// APRÈS (sécurisé)
const { login, register, logout, checkAuth } = useSecureAuth();
```

#### 2. Remplacer useApi par useSecureApi
```typescript
// AVANT (non sécurisé)
const { apiFetch } = useApi();

// APRÈS (sécurisé)
const { secureApiFetch, get, post, put, delete } = useSecureApi();
```

#### 3. Initialisation de l'authentification
```typescript
// Dans app.vue ou plugin
const { checkAuth } = useSecureAuth();
await checkAuth(); // Vérifier l'auth au démarrage
```

### Composables à Migrer
- [ ] `composables/api/useAuthApi.ts`
- [ ] `composables/api/useEmployeeApi.ts`
- [ ] `composables/api/useAttendanceApi.ts`
- [ ] `composables/useApi.ts`
- [ ] `composables/useFetchWithAuth.ts`

## 🔒 Configuration Backend Requise

### Endpoints à Modifier
1. **`/api/auth/login`** - Retourner refresh token en HttpOnly cookie
2. **`/api/auth/register`** - Retourner refresh token en HttpOnly cookie
3. **`/api/auth/refresh`** - Nouveau endpoint pour refresh des tokens
4. **`/api/auth/logout`** - Invalider le refresh token

### Configuration Cookies
```javascript
// Configuration recommandée
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  path: '/'
});
```

## 📋 Checklist de Migration

### Frontend
- [x] ✅ Installer nuxt-security
- [x] ✅ Configurer headers de sécurité
- [x] ✅ Créer useSecureAuth composable
- [x] ✅ Créer useSecureApi composable
- [ ] 🔄 Migrer les composables API existants
- [ ] 🔄 Mettre à jour les composants utilisant l'auth
- [ ] 🔄 Tester sur iOS Safari

### Backend (À faire)
- [ ] 🔄 Créer endpoint /api/auth/refresh
- [ ] 🔄 Modifier login/register pour HttpOnly cookies
- [ ] 🔄 Configurer CORS sécurisé
- [ ] 🔄 Ajouter validation côté serveur
- [ ] 🔄 Implémenter rate limiting

## 🧪 Tests de Sécurité

### Tests à Effectuer
1. **XSS Protection** - Vérifier que les tokens ne sont pas accessibles via JavaScript
2. **CSRF Protection** - Tester les requêtes cross-origin
3. **iOS Safari** - Tester en navigation normale et privée
4. **Token Refresh** - Vérifier le renouvellement automatique
5. **Logout** - Vérifier l'invalidation complète

### Outils de Test
- OWASP ZAP pour scan de sécurité
- Browser DevTools pour vérifier les cookies
- Postman pour tester les APIs

## 🚀 Déploiement

### Ordre de Déploiement
1. **Backend** - Déployer les nouveaux endpoints d'abord
2. **Frontend** - Déployer avec fallback vers ancien système
3. **Migration** - Basculer progressivement les utilisateurs
4. **Cleanup** - Supprimer l'ancien code après validation

### Variables d'Environnement
```env
# Production
NUXT_PUBLIC_API_BASE=https://your-api-domain.com
NODE_ENV=production

# Development
NUXT_PUBLIC_API_BASE=http://localhost:3001
NODE_ENV=development
```

## 📊 Monitoring

### Métriques à Surveiller
- Taux d'échec des refresh tokens
- Temps de réponse des endpoints d'auth
- Erreurs 401/403 côté client
- Utilisation mémoire (tokens en mémoire)

## 🔗 Ressources

### Documentation
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Nuxt Security Module](https://nuxt-security.vercel.app/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Outils
- [nuxt-security](https://www.npmjs.com/package/nuxt-security)
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Security Headers](https://securityheaders.com/)

---

**⚠️ Important** : Cette migration améliore significativement la sécurité mais nécessite des modifications backend. Coordonner avec l'équipe backend pour une migration complète.
