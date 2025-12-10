# Configuration Puppeteer pour Render

## Problème
Les PDF ne fonctionnent pas sur Render à cause de Puppeteer qui nécessite Chromium.

## Solutions

### Solution 1: Utiliser @sparticuz/chromium (Recommandée)

1. **Installer le package Chromium optimisé pour serverless:**
```bash
npm install @sparticuz/chromium
```

2. **Modifier BasePdfService.ts pour utiliser le Chromium binaire:**
```typescript
import chromium from '@sparticuz/chromium';

// Dans getBrowser():
const renderConfig = {
  headless: true,
  executablePath: await chromium.executablePath(),
  args: [
    ...chromium.args,
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
};
```

### Solution 2: Variable d'environnement Render

Dans les variables d'environnement Render, ajouter:
```
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Solution 3: Script de build Render

Créer un `build.sh`:
```bash
#!/bin/bash
# Installer Chromium
apt-get update
apt-get install -y chromium-browser

# Build normal
npm install
npm run build
```

## Test de la solution

Après déploiement, vérifier les logs Render pour:
- `✅ [PDF] Navigateur Puppeteer initialisé avec succès`
- Messages d'erreur détaillés si échec

## Alternative temporaire

Si aucune solution ne marche, désactiver temporairement les PDF:
```typescript
// Dans les contrôleurs PDF
throw new Error('Service PDF temporairement indisponible. Veuillez réessayer plus tard.');
```
