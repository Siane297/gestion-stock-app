# Dépendances du projet - Frontend

## 📦 Dépendances de production

### Framework principal
- **nuxt** `^4.2.0`
  - Framework Vue.js full-stack
  - Routing automatique, SSR, génération statique
  - Utilisé comme base de l'application

- **vue** `^3.5.22`
  - Framework JavaScript réactif
  - Base de Nuxt 4
  - Composition API utilisée

- **vue-router** `^4.6.3`
  - Routeur officiel Vue.js
  - Navigation entre pages
  - Intégré automatiquement par Nuxt

### Interface utilisateur
- **primevue** `^4.4.1`
  - Bibliothèque de composants Vue
  - Composants utilisés : Card, Button, InputText, Dropdown, etc.
  - Thème : Aura

- **@primeuix/themes** `^1.2.5`
  - Thèmes pour PrimeVue v4
  - Thème Aura importé dans nuxt.config.ts

- **primeicons** `^7.0.0`
  - Icônes pour PrimeVue
  - Utilisées dans toute l'interface (pi-camera, pi-qrcode, etc.)

### Styling
- **@nuxtjs/tailwindcss** `^6.14.0`
  - Module Nuxt pour Tailwind CSS
  - Classes utilitaires pour le styling
  - Configuration responsive

### QR Code
- **html5-qrcode** `^2.3.8`
  - Scanner QR code via caméra web
  - Utilisé dans `/pages/attendance/scan.vue`
  - Gestion permissions caméra

- **qrcode** `^1.5.4`
  - Génération de QR codes
  - Utilisé dans `/pages/employees/register.vue`
  - Export en canvas/image

### Modules Nuxt
- **@primevue/nuxt-module** `^4.4.1`
  - Module Nuxt pour PrimeVue
  - Auto-import des composants
  - Configuration thème

## 🛠️ Dépendances de développement

### Types TypeScript
- **@types/qrcode** `^1.5.6`
  - Types TypeScript pour le package qrcode
  - IntelliSense et validation de types

## 📋 Installation des dépendances

### Installation initiale
```bash
# Framework principal
pnpm add nuxt vue vue-router

# Interface utilisateur
pnpm add primevue @primeuix/themes primeicons
pnpm add -D @primevue/nuxt-module

# Styling
pnpm add -D @nuxtjs/tailwindcss

# QR Code
pnpm add html5-qrcode qrcode
pnpm add -D @types/qrcode
```

### Installation par fonctionnalité

#### Page d'accueil et navigation
```bash
pnpm add primevue primeicons
pnpm add -D @primevue/nuxt-module
```

#### Page enregistrement employés
```bash
pnpm add qrcode
pnpm add -D @types/qrcode
```

#### Page pointage scanner
```bash
pnpm add html5-qrcode
```

#### Styling responsive
```bash
pnpm add -D @nuxtjs/tailwindcss
```

## ⚙️ Configuration

### nuxt.config.ts
```typescript
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module'
  ],
  
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },
  
  css: [
    'primeicons/primeicons.css'
  ]
});
```

### package.json (extrait)
```json
{
  "dependencies": {
    "@nuxtjs/tailwindcss": "^6.14.0",
    "@primeuix/themes": "^1.2.5",
    "html5-qrcode": "^2.3.8",
    "nuxt": "^4.2.0",
    "primeicons": "^7.0.0",
    "primevue": "^4.4.1",
    "qrcode": "^1.5.4",
    "vue": "^3.5.22",
    "vue-router": "^4.6.3"
  },
  "devDependencies": {
    "@primevue/nuxt-module": "^4.4.1",
    "@types/qrcode": "^1.5.6"
  }
}
```

## 🎯 Utilisation par page

### `/pages/index.vue`
- **primevue** : Card, Button
- **primeicons** : pi-user-plus, pi-qrcode, pi-chart-bar
- **@nuxtjs/tailwindcss** : Classes responsive et styling

### `/pages/employees/register.vue`
- **primevue** : Card, Button, InputText, Dropdown
- **qrcode** : Génération QR code employé
- **primeicons** : pi-user, pi-building, etc.

### `/pages/attendance/scan.vue`
- **html5-qrcode** : Scanner caméra
- **primevue** : Card, Button
- **primeicons** : pi-camera, pi-qrcode

### `/pages/dashboard.vue`
- **primevue** : Card, Button, TabView, DataTable, Calendar
- **primeicons** : pi-users, pi-calendar, pi-chart-line

## 🔄 Mises à jour

### Commandes utiles
```bash
# Vérifier les mises à jour
pnpm outdated

# Mettre à jour toutes les dépendances
pnpm update

# Mettre à jour une dépendance spécifique
pnpm update primevue

# Réinstaller toutes les dépendances
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Compatibilité
- **Node.js** : 18+ recommandé
- **pnpm** : 8+ recommandé
- **Navigateurs** : Chrome 90+, Firefox 90+, Safari 14+

## ⚠️ Notes importantes

1. **@primeuix/themes** remplace l'ancien `@primevue/themes`
2. **html5-qrcode** nécessite HTTPS en production
3. **Nuxt 4** est en version RC, API stable
4. **Tailwind CSS** configuré automatiquement par le module Nuxt
5. Toutes les dépendances sont compatibles Vue 3
