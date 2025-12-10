# Solution Complète pour iOS Safari - Authentification

## 🎯 Problème Résolu

Sur iOS Safari, les cookies cross-site sont bloqués par ITP (Intelligent Tracking Prevention), même avec `SameSite=None; Secure`. Cela empêche l'authentification de fonctionner entre Vercel (frontend) et Render (backend).

## ✅ Solution Implémentée

### 1. Double Authentification (Cookie + localStorage)

**Backend** : Envoie le token JWT dans :
- Cookie `auth_token` (pour navigateurs compatibles)
- Réponse JSON `data.token` (pour localStorage)

**Frontend** : Stocke le token dans :
- localStorage après connexion/inscription
- Envoie le token via header `Authorization: Bearer <token>`

### 2. Modifications Backend

#### `authMiddleware.ts`
```typescript
// Accepte le token depuis cookie OU header Authorization
let token = req.cookies?.auth_token;

if (!token) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
}
```

#### `tenantMiddleware.ts`
```typescript
// Même logique pour les routes tenant
let token = req.cookies?.auth_token;

if (!token) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
}
```

### 3. Modifications Frontend

#### Nouveau composable `useApi.ts`
```typescript
export const useApi = () => {
  const apiFetch = async <T>(url: string, options: any = {}): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Ajouter le token depuis localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return $fetch<T>(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  return { apiFetch };
};
```

#### Mise à jour des composables API
Tous les composables API doivent utiliser `apiFetch` au lieu de `$fetch` :

```typescript
// Avant
const response = await $fetch('/api/employees', {
  baseURL,
  credentials: 'include',
});

// Après
const { apiFetch } = useApi();
const response = await apiFetch('/api/employees', {
  method: 'GET',
});
```

#### Middleware `auth.ts`
```typescript
// Exclure les pages publiques
const publicPages = ['/auth/connexion', '/auth/inscription', '/auth/preparation'];
if (publicPages.includes(to.path)) {
  return;
}

// Ajouter le token dans les headers
const token = localStorage.getItem('auth_token');
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

## 📋 Configuration Render

Variables d'environnement **CRITIQUES** :

```bash
NODE_ENV=production
CORS_ORIGIN=https://votre-app.vercel.app
JWT_SECRET=votre-secret-32-caracteres-minimum
```

⚠️ **Important** : `CORS_ORIGIN` doit correspondre EXACTEMENT à votre URL Vercel (sans slash final).

## 🧪 Test sur iPhone

1. **Vider le cache Safari** : Réglages > Safari > Effacer historique et données
2. **Fermer Safari complètement** : Double-clic bouton home, swipe up
3. **Tester la connexion** :
   - Ouvrir Safari
   - Aller sur votre app Vercel
   - Se connecter
   - Vérifier l'accès aux pages protégées

4. **Vérifier le token** (optionnel) :
   - Réglages > Safari > Avancé > Inspecteur Web
   - Console : `localStorage.getItem('auth_token')`

## 📊 Logs de Debug

### Backend (Render)
```
[⚡ AUTH] Token cookie: ABSENT
[⚡ AUTH] Token Authorization header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[⚡ AUTH] Token décodé: User <userId>
```

### Frontend (Safari Console)
```
[✅ AUTH] Utilisateur authentifié
```

## 🔄 Composables à Mettre à Jour

- [x] `useEmployeeApi.ts`
- [ ] `usePosteApi.ts`
- [ ] `useDepartementApi.ts`
- [ ] `useConfigurationHoraireApi.ts`
- [ ] `useAttendanceApi.ts`
- [ ] `useHistoriqueApi.ts`
- [ ] `useStatsApi.ts`

## 🚀 Déploiement

```powershell
# Backend
cd pointage-back
git add .
git commit -m "fix: support Authorization header pour iOS Safari"
git push

# Frontend
cd pointage-front
git add .
git commit -m "fix: utiliser useApi avec localStorage pour iOS Safari"
git push
```

## ✅ Résultat Attendu

- ✅ Connexion fonctionne sur iPhone
- ✅ Pages protégées accessibles sur iPhone
- ✅ Requêtes API fonctionnent sur iPhone
- ✅ Compatibilité maintenue avec Android/Desktop
