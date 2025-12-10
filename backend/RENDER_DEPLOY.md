# 🚀 Configuration Render

## ⚙️ Build & Start Commands

### **Build Command** (à configurer dans Render Dashboard)
```bash
npm install --force --include=dev && npm run build
```

**Ce qui se passe** :
- ✅ Installation des dépendances
- ✅ Génération du client Prisma
- ✅ Compilation TypeScript

⚠️ **NE PAS** ajouter `npm run db:seed` ou `npm run db:seed-superadmin` ici car les migrations ne sont pas encore appliquées !

---

### **Start Command** (à configurer dans Render Dashboard)
```bash
npm run start
```

**Ce qui se passe** (dans l'ordre) :
1. ✅ `npx prisma migrate deploy` - Applique les migrations
2. ✅ `npx prisma db seed` - Seed départements/postes
3. ✅ `npx tsx prisma/seed-superadmin.ts` - Crée le super admin
4. ✅ `node dist/server.js` - Lance le serveur

---

## 🔧 Variables d'environnement Render

Dans **Environment** → **Environment Variables** :

```env
DATABASE_URL=postgresql://...VOTRE_URL_RENDER...
NODE_ENV=production
PORT=10000
JWT_SECRET=votre-secret-jwt-production
CORS_ORIGIN=https://votre-frontend.vercel.app
```

---

## 📋 Résumé

| Commande | Où | Quand |
|----------|-----|-------|
| **Build** | `npm install && npm run build` | À chaque push |
| **Start** | `npm run start` | Après le build |

**Ordre d'exécution** :
```
1. Build → Installe + Compile
2. Start → Migrations → Seeds → Serveur
```

---

## ✅ Vérification post-déploiement

1. **Logs Render** : Vérifier que les migrations sont appliquées
2. **Super Admin créé** : `admin@pointage.com` / `Admin@123`
3. **API accessible** : `https://votre-backend.onrender.com/api/health`

---

## 🆘 En cas d'erreur

### "Table does not exist"
➡️ Vérifier que les migrations sont dans le **start command**, pas le build command

### "Cannot find module"
➡️ Vérifier que `--include=dev` est dans le build command

### "Timeout"
➡️ Render met en veille après 15 min d'inactivité (plan gratuit)
