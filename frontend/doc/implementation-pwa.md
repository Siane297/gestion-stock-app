# Documentation Technique : Implémentation PWA dans Nuxt 3/4

Ce guide détaille les étapes pour transformer une application Nuxt en une Progressive Web App (PWA) robuste, incluant la gestion de la sécurité (CSP) et les notifications de mise à jour.

## 1. Installation des Dépendances

Installer le module Vite PWA pour Nuxt :

```bash
pnpm add -D @vite-pwa/nuxt
```

## 2. Configuration des Actifs (Icônes)

Le manifeste PWA nécessite plusieurs tailles d'icônes. Placez-les dans le dossier `public/` :

- `pwa-192x192.png` : Icône standard 192px.
- `pwa-512x512.png` : Icône standard 512px.
- `apple-touch-icon.png` : Icône pour iOS (180x180px recommandé).
- `maskable-icon.png` : Icône adaptable pour Android (512x512px avec marge de sécurité).

## 3. Configuration `nuxt.config.ts`

Ajoutez le module et sa configuration. **Note importante sur la sécurité** : Si vous utilisez `nuxt-security`, vous devez explicitement autoriser le Service Worker.

```typescript
export default defineNuxtConfig({
  modules: [
    "@vite-pwa/nuxt",
    "nuxt-security",
    // ... autres modules
  ],

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      id: "/",
      name: "Mon Application",
      short_name: "App",
      description: "Description de l'application",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-512x512.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "maskable-icon.png",
          sizes: "1024x1024",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      screenshots: [
        {
          src: "screenshot-wide.png",
          sizes: "1491x739",
          type: "image/png",
          form_factor: "wide",
        },
        {
          src: "screenshot-mobile.png",
          sizes: "590x644",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2,json}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        // ... vos règles existantes
        "worker-src": ["'self'", "blob:"],
        "manifest-src": ["'self'"],
      },
    },
  },
});
```

## 4. Composant de Notification (`PwaUpdatePrompt.vue`)

Créez un composant pour gérer les mises à jour et le mode hors-ligne.

```vue
<script setup lang="ts">
const pwa = useNuxtApp().$pwa as any;

const updateServiceWorker = () => {
  if (pwa) pwa.updateServiceWorker(true);
};

const close = () => {
  if (pwa) {
    pwa.needRefresh.value = false;
  }
};
</script>

<template>
  <div v-if="pwa?.needRefresh" class="pwa-toast" role="alert">
    <div class="message">Nouvelle version disponible !</div>
    <div class="actions">
      <button @click="updateServiceWorker">Mettre à jour</button>
      <button @click="close">Fermer</button>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 1000;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
```

## 5. Intégration dans `app.vue`

Ajoutez les composants PWA à la racine de votre application.

```vue
<template>
  <div>
    <ClientOnly>
      <VitePwaManifest />
      <PwaUpdatePrompt />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

## 6. Vérification

1. **Build** : Lancez `npm run build` pour vérifier la génération de `sw.js` et `manifest.webmanifest`.
2. **Lighthouse** : Utilisez l'onglet Lighthouse des outils de développement Chrome pour valider les critères PWA.
3. **Installation** : Vérifiez que l'icône d'installation apparaît dans la barre d'adresse.
