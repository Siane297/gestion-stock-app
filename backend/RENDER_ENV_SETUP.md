# Configuration des Variables d'Environnement sur Render

## ⚠️ IMPORTANT pour iOS Safari

Pour que l'authentification fonctionne sur **tous les appareils** (iPhone, iPad, Safari), vous devez configurer correctement les variables d'environnement à configurer sur Render

## Variables obligatoires

```bash
NODE_ENV=production
TZ=Africa/Nairobi
```

### 1. NODE_ENV (Obligatoire)
```
NODE_ENV=production
```

### 2. CORS_ORIGIN (CRITIQUE pour iOS Safari)
```
CORS_ORIGIN=https://pointage-front.vercel.app
```
⚠️ **Remplacez par votre vraie URL Vercel** (sans slash final)

Si vous avez plusieurs domaines frontend :
```
CORS_ORIGIN=https://pointage-front.vercel.app,https://autre-domaine.com
```

### 3. DATABASE_URL (Déjà configuré normalement)
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 4. JWT_SECRET (Obligatoire)
```
JWT_SECRET=votre-secret-super-long-minimum-32-caracteres-aleatoires
```

### 5. JWT_EXPIRES_IN
```
JWT_EXPIRES_IN=7d
```

### 6. LOG_LEVEL
```
LOG_LEVEL=info
```

## ✅ Vérification

Après avoir configuré ces variables :

1. **Redémarrez le service** sur Render
2. Vérifiez les logs pour voir :
   ```
   🚀 Serveur démarré sur le port 10000
   🌍 Environnement: production
   ✅ Connexion à PostgreSQL établie
   ```

3. Testez la connexion depuis votre iPhone :
   - Ouvrez Safari
   - Allez sur votre app Vercel
   - Connectez-vous
   - Vérifiez que vous êtes redirigé vers l'accueil

## 🔍 Debugging

Si la connexion ne fonctionne toujours pas sur iPhone :

1. **Vérifiez les logs Render** pour voir les requêtes CORS
2. **Ouvrez la console Safari** sur iPhone (Réglages > Safari > Avancé > Inspecteur Web)
3. Vérifiez que le token est bien stocké dans localStorage :
   ```javascript
   localStorage.getItem('auth_token')
   ```

## 📱 Test Final

1. Sur iPhone, videz le cache Safari
2. Fermez complètement Safari
3. Rouvrez et testez la connexion
4. Vérifiez que vous pouvez accéder aux pages protégées

## 🆘 Support

Si le problème persiste :
- Vérifiez que `CORS_ORIGIN` correspond EXACTEMENT à votre URL Vercel
- Assurez-vous que votre URL Vercel utilise HTTPS (obligatoire pour SameSite=None)
- Vérifiez les logs Render pour voir les erreurs CORS
