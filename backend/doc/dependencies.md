# Dépendances Backend - Rôles et Explications

## 📦 Dépendances de Production

### Framework et Serveur

#### **express** `^5.1.0`
- **Rôle** : Framework web Node.js minimaliste et flexible
- **Utilisation** : 
  - Création du serveur HTTP
  - Gestion des routes API
  - Middleware pipeline
  - Parsing JSON/URL-encoded
- **Pourquoi** : Standard de l'industrie, grande communauté, performant

#### **dotenv** `^17.2.3`
- **Rôle** : Charge les variables d'environnement depuis fichier `.env`
- **Utilisation** :
  - Configuration serveur (PORT, HOST)
  - Credentials base de données
  - Secrets JWT
  - Configuration CORS
- **Pourquoi** : Sépare configuration du code, sécurité

---

### Base de Données (ORM)

#### **@prisma/client** `^5.7.0`
- **Rôle** : Client ORM (Object-Relational Mapping) pour PostgreSQL
- **Utilisation** :
  - Requêtes base de données type-safe
  - Migrations automatiques
  - Relations entre tables
  - Protection SQL injection
- **Pourquoi** : Type-safety TypeScript, moderne, performant
- **Exemple** :
```typescript
await prisma.employee.findMany({
  where: { isActive: true },
  include: { attendances: true }
});
```

---

### Sécurité

#### **helmet** `^7.1.0`
- **Rôle** : Sécurise les headers HTTP
- **Utilisation** :
  - Protection XSS (Cross-Site Scripting)
  - Protection clickjacking
  - Headers de sécurité automatiques
- **Pourquoi** : Sécurité essentielle en production
- **Headers ajoutés** :
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Strict-Transport-Security`

#### **cors** `^2.8.5`
- **Rôle** : Gère Cross-Origin Resource Sharing
- **Utilisation** :
  - Autorise frontend (localhost:3000) à appeler l'API
  - Configure headers CORS
  - Gère preflight requests
- **Pourquoi** : Nécessaire pour communication frontend-backend
- **Configuration** :
```typescript
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

#### **express-rate-limit** `^7.1.5`
- **Rôle** : Limite le nombre de requêtes par IP
- **Utilisation** :
  - Protection contre DDoS
  - Protection brute-force
  - Limite 100 requêtes/15 minutes par défaut
- **Pourquoi** : Protège l'API des abus

#### **bcryptjs** `^2.4.3`
- **Rôle** : Hash et vérifie les mots de passe
- **Utilisation** :
  - Hash mots de passe utilisateurs
  - Vérification lors du login
  - Salage automatique
- **Pourquoi** : Sécurité mots de passe (jamais en clair)
- **Exemple** :
```typescript
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);
```

#### **jsonwebtoken** `^9.0.2`
- **Rôle** : Génère et vérifie les tokens JWT
- **Utilisation** :
  - Authentification stateless
  - Tokens d'accès
  - Vérification identité utilisateur
- **Pourquoi** : Standard pour API REST modernes
- **Exemple** :
```typescript
const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
const decoded = jwt.verify(token, JWT_SECRET);
```

---

### Logging et Monitoring

#### **winston** `^3.11.0`
- **Rôle** : Logger professionnel multi-transport
- **Utilisation** :
  - Logs console (développement)
  - Logs fichiers (production)
  - Niveaux de log (error, warn, info, debug)
  - Rotation de logs
- **Pourquoi** : Traçabilité, debugging, monitoring
- **Transports** :
  - Console avec couleurs
  - `logs/error.log` (erreurs)
  - `logs/combined.log` (tous)

#### **morgan** `^1.10.0`
- **Rôle** : Logger HTTP middleware pour Express
- **Utilisation** :
  - Log toutes les requêtes HTTP
  - Format personnalisable
  - Intégration avec Winston
- **Pourquoi** : Monitoring requêtes API
- **Format** : `combined` (Apache style)

---

### Validation

#### **joi** `^17.11.0`
- **Rôle** : Validation de schémas de données
- **Utilisation** :
  - Validation body requêtes
  - Validation query params
  - Messages d'erreur personnalisés
- **Pourquoi** : Sécurité et intégrité données
- **Exemple** :
```typescript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});
```

---

### Utilitaires

#### **uuid** `^9.0.1`
- **Rôle** : Génère des identifiants uniques universels
- **Utilisation** :
  - Génération QR codes uniques pour employés
  - IDs de sessions
  - Tokens uniques
- **Pourquoi** : Garantit unicité globale
- **Exemple** :
```typescript
const qrCode = uuidv4(); // "550e8400-e29b-41d4-a716-446655440000"
```

#### **multer** `^1.4.5-lts.1`
- **Rôle** : Gère l'upload de fichiers multipart/form-data
- **Utilisation** :
  - Upload photos employés (futur)
  - Upload documents
  - Validation taille/type fichiers
- **Pourquoi** : Nécessaire pour fichiers dans Express

---

## 🛠️ Dépendances de Développement

### TypeScript

#### **typescript** `^5.9.3`
- **Rôle** : Superset JavaScript avec typage statique
- **Utilisation** :
  - Type-safety
  - IntelliSense IDE
  - Détection erreurs compilation
- **Pourquoi** : Qualité code, maintenabilité

#### **tsx** `^4.7.0`
- **Rôle** : Exécuteur TypeScript moderne (remplace ts-node)
- **Utilisation** :
  - Exécute `.ts` directement
  - Support modules ES
  - Hot reload avec nodemon
- **Pourquoi** : Plus rapide et compatible que ts-node

#### **@types/node** `^24.9.2`
- **Rôle** : Définitions TypeScript pour Node.js
- **Utilisation** : Types pour `process`, `Buffer`, `fs`, etc.

#### **@types/express** `^5.0.5`
- **Rôle** : Définitions TypeScript pour Express
- **Utilisation** : Types pour `Request`, `Response`, `NextFunction`

#### **@types/cors** `^2.8.17`
- **Rôle** : Types TypeScript pour CORS

#### **@types/bcryptjs** `^2.4.6`
- **Rôle** : Types TypeScript pour bcryptjs

#### **@types/jsonwebtoken** `^9.0.5`
- **Rôle** : Types TypeScript pour JWT

#### **@types/morgan** `^1.9.9`
- **Rôle** : Types TypeScript pour Morgan

#### **@types/multer** `^1.4.11`
- **Rôle** : Types TypeScript pour Multer

#### **@types/uuid** `^9.0.7`
- **Rôle** : Types TypeScript pour UUID

---

### Base de Données

#### **prisma** `^5.7.0`
- **Rôle** : CLI Prisma pour migrations et génération client
- **Utilisation** :
  - `prisma generate` : Génère client TypeScript
  - `prisma migrate` : Gère migrations DB
  - `prisma studio` : Interface graphique DB
  - `prisma db push` : Synchronise schéma
- **Pourquoi** : Outils développement Prisma

---

### Développement

#### **nodemon** `^3.1.10`
- **Rôle** : Redémarre automatiquement le serveur lors de changements
- **Utilisation** :
  - Watch fichiers `.ts` et `.json`
  - Redémarrage automatique
  - Configuration via `nodemon.json`
- **Pourquoi** : Productivité développement
- **Configuration** :
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "exec": "tsx src/server.ts"
}
```

---

## 📊 Résumé par catégorie

| Catégorie | Dépendances | Rôle principal |
|-----------|-------------|----------------|
| **Framework** | express, dotenv | Serveur web et configuration |
| **Base de données** | @prisma/client, prisma | ORM PostgreSQL |
| **Sécurité** | helmet, cors, rate-limit, bcrypt, jwt | Protection API |
| **Logging** | winston, morgan | Traçabilité et monitoring |
| **Validation** | joi | Validation données |
| **Utilitaires** | uuid, multer | Fonctionnalités diverses |
| **TypeScript** | typescript, tsx, @types/* | Développement type-safe |
| **Dev Tools** | nodemon | Hot reload |

## 🔧 Installation

```bash
# Toutes les dépendances
npm install

# Production seulement
npm install --production

# Développement seulement
npm install --only=dev
```

## 📈 Taille du projet

- **Dependencies** : ~15 packages production
- **DevDependencies** : ~12 packages développement
- **Total** : ~200 packages (avec sous-dépendances)
- **node_modules** : ~50-100 MB

## 🔄 Mises à jour

```bash
# Vérifier mises à jour disponibles
npm outdated

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour une dépendance spécifique
npm update express

# Audit sécurité
npm audit
npm audit fix
```

## ⚠️ Notes importantes

1. **Prisma** : Nécessite PostgreSQL installé et accessible
2. **JWT_SECRET** : Doit être une chaîne aléatoire sécurisée en production
3. **CORS** : Configurer origin selon environnement
4. **Rate Limit** : Ajuster selon besoins production
5. **Bcrypt rounds** : 12 rounds = bon équilibre sécurité/performance

---

Toutes ces dépendances travaillent ensemble pour créer une **API REST sécurisée, performante et maintenable**.
