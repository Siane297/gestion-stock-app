# Gestionnaire de Présence - Frontend

Application web moderne de gestion de présence avec système de QR codes.

## 🚀 Technologies

- **Framework**: Nuxt 3 / Vue.js 3
- **UI Components**: PrimeVue
- **Styling**: Tailwind CSS
- **QR Code**: 
  - Génération: `qrcode`
  - Scan: `html5-qrcode`
- **Icons**: PrimeIcons

## 📋 Fonctionnalités

### ✅ Implémentées

1. **Page d'accueil**
   - Navigation intuitive vers les différents modules
   - Statistiques en temps réel
   - Design responsive et moderne

2. **Module d'enregistrement des employés** (`/employees/register`)
   - Formulaire complet avec validation
   - Génération automatique de QR code unique
   - Téléchargement du QR code
   - Champs: Nom, Matricule, Poste, Département, Email, Téléphone

3. **Module de pointage** (`/attendance/scan`)
   - Scanner QR code via caméra
   - Sélection Entrée/Sortie
   - Historique des derniers pointages
   - Feedback visuel immédiat

4. **Tableau de bord** (`/dashboard`)
   - Vue d'ensemble des statistiques
   - Liste complète des employés avec recherche
   - Historique des présences avec filtres
   - Export des données (à connecter au backend)

## 🛠️ Installation

```bash
# Installer les dépendances
pnpm install

# Ou avec npm
npm install
```

## 💻 Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# L'application sera accessible sur http://localhost:3000
```

## 🏗️ Build Production

```bash
# Build pour la production
pnpm build

# Prévisualiser le build
pnpm preview
```

## 📁 Structure du projet

```
frontend/
├── app.vue                 # Composant racine
├── pages/
│   ├── index.vue          # Page d'accueil
│   ├── employees/
│   │   └── register.vue   # Enregistrement employé
│   ├── attendance/
│   │   └── scan.vue       # Scan QR code
│   └── dashboard.vue      # Tableau de bord
├── assets/
│   └── css/
│       └── main.css       # Styles globaux + Tailwind
├── nuxt.config.ts         # Configuration Nuxt
└── tailwind.config.js     # Configuration Tailwind
```

## 🔌 Intégration Backend

Les appels API sont préparés mais commentés. Pour connecter au backend:

1. Décommenter les appels `$fetch` dans les composants
2. Configurer l'URL de l'API dans `nuxt.config.ts`
3. Implémenter les endpoints correspondants

### Endpoints à créer:

- `POST /api/employees` - Créer un employé
- `GET /api/employees` - Liste des employés
- `POST /api/attendance/check` - Vérifier et enregistrer un pointage
- `GET /api/attendance` - Historique des présences
- `GET /api/stats` - Statistiques

## 🎨 Design

- **Mobile-first**: Responsive sur tous les écrans
- **Couleurs**: Palette moderne avec dégradés
- **Composants**: PrimeVue pour une UI cohérente
- **Animations**: Transitions fluides

## 📱 Compatibilité

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Chrome Mobile)
- ✅ Tablette

## 🔐 Sécurité

- Validation des formulaires côté client
- Sanitisation des données QR code
- HTTPS recommandé en production

## 📝 Notes

- Les erreurs TypeScript concernant `ref`, `computed`, etc. sont normales - Nuxt les auto-importe
- Les données actuelles sont des exemples - à remplacer par les données du backend
- Le scan QR nécessite HTTPS en production (ou localhost en dev)

## 🚧 À faire (Backend)

- [ ] Connexion à la base de données PostgreSQL
- [ ] API REST pour CRUD employés
- [ ] API pour gestion des présences
- [ ] Authentification/Authorization
- [ ] Export CSV/Excel
- [ ] Rapports et statistiques avancées

## 📞 Support

Pour toute question ou problème, consultez la documentation de:
- [Nuxt 3](https://nuxt.com/docs)
- [PrimeVue](https://primevue.org/)
- [Tailwind CSS](https://tailwindcss.com/)
