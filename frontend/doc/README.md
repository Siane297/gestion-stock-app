# Documentation Frontend - Application de Pointage

## 📚 Vue d'ensemble

Ce dossier contient la documentation complète du frontend de l'application de gestion de présence avec QR codes.

## 📂 Structure de la documentation

### 📄 [scan-page-documentation.md](./scan-page-documentation.md)
Documentation détaillée de la page de pointage QR (`/pages/attendance/scan.vue`)

**Contient :**
- Vue d'ensemble de la fonctionnalité
- Documentation de toutes les méthodes
- Configuration du scanner QR
- Interface utilisateur
- Gestion des permissions caméra
- Résolution de problèmes
- Guide d'utilisation

### 📄 [dependencies.md](./dependencies.md)
Liste complète des dépendances du projet

**Contient :**
- Dépendances de production et développement
- Versions utilisées
- Commandes d'installation
- Configuration dans nuxt.config.ts
- Utilisation par page
- Notes de compatibilité

## 🎯 Application de Pointage

### Fonctionnalités principales

1. **Page d'accueil** (`/pages/index.vue`)
   - Navigation vers les modules
   - Statistiques générales
   - Design responsive

2. **Enregistrement employés** (`/pages/employees/register.vue`)
   - Formulaire d'inscription
   - Génération automatique QR code
   - Validation des données

3. **Pointage scanner** (`/pages/attendance/scan.vue`)
   - Scanner QR via caméra
   - Gestion permissions
   - Enregistrement entrées/sorties

4. **Tableau de bord** (`/pages/dashboard.vue`)
   - Liste des employés
   - Historique des présences
   - Statistiques détaillées

### Technologies utilisées

- **Framework** : Nuxt 4.2.0 + Vue 3.5.22
- **UI** : PrimeVue 4.4.1 + Tailwind CSS
- **QR Code** : html5-qrcode + qrcode
- **TypeScript** : Support complet

## 🚀 Démarrage rapide

### Installation
```bash
cd frontend
pnpm install
```

### Développement
```bash
pnpm dev
# Accès : http://localhost:3000
```

### Build production
```bash
pnpm build
pnpm preview
```

## 🔧 Configuration

### Fichiers de configuration principaux

- **nuxt.config.ts** : Configuration Nuxt et modules
- **tailwind.config.js** : Configuration Tailwind CSS
- **package.json** : Dépendances et scripts
- **tsconfig.json** : Configuration TypeScript

### Variables d'environnement

Aucune variable d'environnement requise pour le moment. Le frontend utilise des données mockées.

## 📱 Fonctionnement du scanner QR

### Processus de scan

1. **Permissions** : Demande accès caméra
2. **Configuration** : Scanner adaptatif 15 FPS
3. **Détection** : Cadre 70% de la zone visible
4. **Traitement** : Parse JSON + validation
5. **Résultat** : Affichage informations employé

### Format QR Code attendu
```json
{
  "fullName": "Jean Dupont",
  "matricule": "EMP001",
  "position": "Développeur",
  "department": "IT"
}
```

## 🐛 Résolution de problèmes

### Problèmes courants

1. **Caméra inaccessible**
   - Vérifier permissions navigateur
   - Utiliser HTTPS en production
   - Tester sur différents navigateurs

2. **QR non détecté**
   - Améliorer éclairage
   - Stabiliser la main
   - Vérifier format JSON du QR

3. **Erreurs de build**
   - Supprimer node_modules
   - Réinstaller dépendances
   - Vérifier versions Node.js/pnpm

### Support navigateurs

| Navigateur | Version minimale | Scanner QR | Caméra |
|------------|------------------|------------|--------|
| Chrome | 90+ | ✅ | ✅ |
| Firefox | 90+ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ |

## 🔮 Roadmap

### Backend intégration
- API REST pour employés
- Base de données pointages
- Authentification
- Temps réel WebSocket

### Fonctionnalités futures
- Mode hors ligne
- Notifications push
- Export rapports
- Multi-entreprises
- App mobile native

## 📞 Support

Pour toute question sur le frontend :

1. Consulter cette documentation
2. Vérifier les logs console navigateur
3. Tester sur navigateur compatible
4. Consulter documentation PrimeVue/Nuxt

## 📝 Notes de développement

### Conventions code
- **Composition API** Vue 3
- **TypeScript** strict
- **PascalCase** composants
- **camelCase** variables/fonctions
- **kebab-case** routes/fichiers

### Structure projet
```
frontend/
├── pages/           # Pages Nuxt (routing auto)
├── components/      # Composants réutilisables
├── assets/          # Ressources statiques
├── public/          # Fichiers publics
├── doc/            # Documentation
└── nuxt.config.ts  # Configuration Nuxt
```

Cette documentation est maintenue à jour avec les évolutions du projet.
