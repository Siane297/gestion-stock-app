# Problème de Déconnexion sur iPhone lors du Rafraîchissement

## 🎯 Problème Identifié

Sur iPhone Safari, lors du rafraîchissement de page, l'utilisateur est automatiquement déconnecté et renvoyé à la page de connexion.

## 🔍 Cause Racine

1. **Access Token perdu** - Lors du rafraîchissement, l'access token stocké en mémoire JavaScript est perdu
2. **Erreur Backend** - L'endpoint `/api/auth/refresh` génère une erreur JWT lors de la création du nouvel access token
3. **Gestion d'erreur Frontend** - Le frontend déconnecte automatiquement l'utilisateur en cas d'échec du refresh

## 🛠️ Solution Implémentée

### Backend (authRoutes.ts)

#### Problème JWT résolu :
```typescript
// AVANT - Payload contenant des propriétés JWT internes
const newAccessToken = generateAccessToken(payload);

// APRÈS - Payload nettoyé
const newPayload: JWTPayload = {
  userId: payload.userId,
  email: payload.email,
  role: payload.role,
  ...(payload.companyId && { companyId: payload.companyId }),
  ...(payload.tenantId && { tenantId: payload.tenantId }),
  ...(payload.employeeId && { employeeId: payload.employeeId })
};
const newAccessToken = generateAccessToken(newPayload);
```

#### Debug ajouté :
```typescript
console.log('[🔍 REFRESH] Payload décodé:', JSON.stringify(payload, null, 2));
```

### Frontend (useSecureAuth.ts)

#### Gestion d'erreur améliorée :
```typescript
// AVANT - Déconnexion automatique en cas d'erreur
catch (error) {
  await logout();
}

// APRÈS - Gestion plus souple
catch (error) {
  console.error('❌ [checkAuth] Erreur:', error);
  // Ne pas déconnecter automatiquement en cas d'erreur réseau
  isAuthenticated.value = false;
  user.value = null;
  accessToken.value = null;
}
```

## 🧪 Test sur iPhone

### Étapes de test :
1. **Connexion** - Se connecter sur iPhone Safari
2. **Vérification** - Naviguer dans l'application
3. **Rafraîchissement** - Actualiser la page (pull down ou F5)
4. **Résultat attendu** - L'utilisateur reste connecté

### Logs à surveiller :

**Console iPhone (Safari > Développement > Inspecteur Web)** :
```
🔍 [checkAuth] Début de la vérification d'authentification
✅ [checkAuth] Refresh token réussi, récupération des infos utilisateur
✅ [checkAuth] Utilisateur récupéré après refresh: user@example.com
```

**Backend (Render Logs)** :
```
[🔍 REFRESH] Payload décodé: {
  "userId": "...",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1699123456,
  "exp": 1699987456
}
[✅ REFRESH] Nouveau access token généré pour user@example.com
```

## 🔧 Dépannage

### Si le problème persiste :

1. **Vérifier les cookies** :
   - Safari > Développement > Inspecteur Web > Stockage > Cookies
   - Vérifier que `refresh_token` est présent

2. **Vérifier les logs backend** :
   - Render Dashboard > Logs
   - Chercher les erreurs JWT ou refresh

3. **Vider le cache Safari** :
   - Réglages > Safari > Effacer historique et données

4. **Tester en navigation privée** :
   - Ouvrir un nouvel onglet privé
   - Se connecter et tester le rafraîchissement

## 📱 Spécificités iOS Safari

### Limitations connues :
- **ITP (Intelligent Tracking Prevention)** - Peut bloquer les cookies cross-site
- **Navigation privée** - Stockage limité
- **Gestion mémoire** - JavaScript peut être purgé plus agressivement

### Solutions appliquées :
- **SameSite=None + Secure** - Pour les cookies cross-domain
- **Gestion d'erreur robuste** - Éviter les déconnexions intempestives
- **Logs détaillés** - Pour faciliter le débogage

## ✅ Résultat Attendu

Après ces corrections :
- ✅ L'utilisateur reste connecté après rafraîchissement sur iPhone
- ✅ Les erreurs JWT sont résolues
- ✅ La gestion d'erreur est plus robuste
- ✅ Les logs permettent un meilleur débogage
