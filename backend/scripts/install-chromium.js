/**
 * Script pour installer Chromium pour Puppeteer sur Render
 * Nécessaire pour la génération de PDFs
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installation de Chromium pour Puppeteer...');

try {
  // Vérifier si nous sommes en production (Render)
  if (process.env.RENDER) {
    console.log('🚀 Environnement Render détecté');
    
    // Installer les dépendances système nécessaires pour Chromium
    console.log('📥 Installation des dépendances système...');
    
    // Sur Render, Puppeteer installe automatiquement Chromium
    // Pas besoin d'action supplémentaire
    console.log('✅ Chromium sera installé par Puppeteer');
  } else {
    console.log('💻 Environnement local - skip installation Chromium');
  }
} catch (error) {
  console.warn('⚠️  Avertissement lors de l\'installation de Chromium:', error.message);
  console.log('ℹ️  Le serveur démarrera quand même, mais la génération de PDF pourrait échouer');
}
