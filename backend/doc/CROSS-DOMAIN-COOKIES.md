# Configuration des Cookies Cross-Domain entre Vercel et Render

Ce document explique comment configurer correctement les cookies et CORS pour permettre l'authentification entre un frontend sur Vercel et un backend sur Render.

## Problème 

Lorsqu'une application déployée sur Vercel (frontend) communique avec une API sur Render (backend), les cookies HttpOnly ne sont pas automatiquement transmis entre les domaines, ce qui provoque des erreurs d'authentification 401 Unauthorized.

## Solution

### 1. Configuration des Cookies côté Backend

Les cookies utilisés pour l'authentification doivent être configurés avec les options suivantes:

```typescript
const refreshCookieOptions = {
  httpOnly: true,
  secure: true,                // TOUJOURS true pour les cookies SameSite=None
  sameSite: 'none' as const,   // Permet l'utilisation cross-domain
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};
```

### 2. Configuration CORS côté Backend

```typescript
// Configuration CORS avec support multi-origines
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:3000'];

// Toujours ajouter l'URL de Vercel en production
if (process.env.NODE_ENV === 'production' && !allowedOrigins.includes('https://pointage-front.vercel.app')) {
  allowedOrigins.push('https://pointage-front.vercel.app');
}

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (comme Postman)
    if (!origin) return callback(null, true);
    
    // Normaliser l'origine (enlever les slashes finaux)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,           // IMPORTANT: permet l'envoi de cookies cross-domain
}));
```

### 3. Configuration du Frontend (Nuxt.js)

Dans `nuxt.config.ts`:

```typescript
// CORS configuration
corsHandler: {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pointage-back.onrender.com']
    : ['http://localhost:3001'],
  credentials: true,
},
```

Et pour les requêtes fetch, toujours inclure `credentials: 'include'`:

```typescript
// Faire la requête avec les cookies HttpOnly inclus
const response = await $fetch(url, {
  method: 'POST',
  credentials: 'include',  // IMPORTANT: inclure les cookies
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

## Vérification

Pour vérifier que les cookies sont correctement configurés:

1. Ouvrir les DevTools du navigateur
2. Aller dans l'onglet Application > Cookies
3. S'assurer que le cookie a les propriétés suivantes:
   - HttpOnly: ✓
   - Secure: ✓
   - SameSite: None

## Dépannage

Si les cookies ne fonctionnent toujours pas:

1. Vérifier que le frontend est en HTTPS (obligatoire pour SameSite=None)
2. Vérifier que le backend est en HTTPS (obligatoire pour SameSite=None)
3. Vérifier les logs CORS dans la console du backend
4. Vérifier que le domaine du backend est correctement listé dans les origines autorisées du frontend
5. Vérifier que le domaine du frontend est correctement listé dans les origines autorisées du backend

## Environnements de Production

Assurez-vous que les variables d'environnement suivantes sont définies dans vos plateformes:

### Backend (Render)
- NODE_ENV=production
- CORS_ORIGIN=https://pointage-front.vercel.app

### Frontend (Vercel)
- NODE_ENV=production
- NUXT_PUBLIC_API_BASE=https://pointage-back.onrender.com
