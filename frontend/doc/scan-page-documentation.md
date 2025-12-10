# Documentation - Page de Pointage QR

## 📋 Vue d'ensemble

La page de pointage (`/pages/attendance/scan.vue`) permet aux employés de scanner des QR codes pour enregistrer leurs entrées et sorties. Elle utilise la caméra de l'appareil pour scanner les codes QR générés lors de l'enregistrement des employés.

## 📦 Dépendances

### Dépendances principales
- **html5-qrcode** `^2.3.8` - Bibliothèque pour scanner les QR codes via la caméra
- **primevue** `^4.4.1` - Composants UI (Card, Button, etc.)
- **@primeuix/themes** `^1.2.5` - Thèmes pour PrimeVue
- **primeicons** `^7.0.0` - Icônes PrimeVue

### Dépendances de développement
- **@types/qrcode** `^1.5.6` - Types TypeScript pour le package qrcode

## 🔧 Méthodes et Fonctions

### 1. `requestCameraPermission(): Promise<boolean>`

**Objectif :** Demande explicitement les permissions d'accès à la caméra au navigateur.

**Fonctionnement :**
```typescript
const requestCameraPermission = async (): Promise<boolean> => {
  try {
    // Vérification API permissions si disponible
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'camera' });
      if (result.state === 'denied') {
        // Permission refusée définitivement
        return false;
      }
    }

    // Demande d'accès via getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    
    // Arrêt du stream après vérification
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    // Gestion des erreurs spécifiques
    return false;
  }
}
```

**Gestion d'erreurs :**
- `NotAllowedError` : Permission refusée par l'utilisateur
- `NotFoundError` : Aucune caméra détectée
- `NotSupportedError` : Navigateur non compatible

### 2. `checkCameraPermission()`

**Objectif :** Teste les permissions de caméra sans démarrer le scanner.

**Utilisation :** 
- Bouton "Vérifier la caméra"
- Permet à l'utilisateur de s'assurer que les permissions sont accordées
- Affiche un message de confirmation si successful

### 3. `startScanning()`

**Objectif :** Démarre le scanner QR avec configuration optimisée.

**Processus :**
1. Demande les permissions via `requestCameraPermission()`
2. Active l'état `isScanning = true`
3. Attend le rendu Vue avec `nextTick()`
4. Vérifie l'existence de l'élément DOM `qr-reader`
5. Initialise `Html5Qrcode` avec configuration
6. Démarre le scanner avec callbacks

**Configuration scanner :**
```typescript
const config = {
  fps: 15, // Images par seconde pour une détection fluide
  qrbox: function(viewfinderWidth, viewfinderHeight) {
    // Cadre adaptatif (70% de la zone minimale)
    const minEdgePercentage = 0.7;
    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
    return { width: qrboxSize, height: qrboxSize };
  },
  aspectRatio: 1.0, // Ratio carré optimal pour QR codes
  disableFlip: false // Permet rotation pour améliorer détection
};
```

### 4. `stopScanning()`

**Objectif :** Arrête proprement le scanner et libère les ressources.

**Actions :**
- Arrêt de `html5QrCode.stop()`
- Nettoyage avec `html5QrCode.clear()`
- Désactivation de l'état `isScanning = false`
- Gestion d'erreurs en cas d'échec

### 5. `onScanSuccess(decodedText: string)`

**Objectif :** Traite les QR codes scannés avec succès.

**Processus :**
1. Arrêt automatique du scanner
2. Parsing des données JSON du QR code
3. Simulation de vérification backend (TODO)
4. Création du résultat de scan avec timestamp
5. Ajout aux scans récents
6. Affichage du résultat à l'utilisateur

**Format de données attendu :**
```typescript
interface Employee {
  fullName: string;
  matricule: string;
  position: string;
  department: string;
}
```

### 6. `onScanFailure(error: string)`

**Objectif :** Gère les erreurs de scan (actuellement silencieuse).

### 7. `resetScan()`

**Objectif :** Remet à zéro l'interface pour un nouveau scan.

**Actions :**
- Efface `scanResult.value = null`
- Permet de scanner un nouveau QR code

## 🎨 Interface Utilisateur

### Composants principaux

1. **Sélection du type de pointage**
   - Boutons radio : "Entrée" / "Sortie"
   - Détermine le type d'enregistrement

2. **Zone de scanner**
   - État initial : Icône QR et boutons d'action
   - État actif : Flux vidéo avec cadre de scan
   - État résultat : Affichage des informations employé

3. **Boutons d'action**
   - "Vérifier la caméra" : Test des permissions
   - "Démarrer le scan" : Lance le scanner
   - "Arrêter le scan" : Arrête le scanner

4. **Affichage des résultats**
   - Informations employé (nom, matricule, poste, département)
   - Timestamp du scan
   - Type de pointage (entrée/sortie)
   - Actions : Nouveau scan / Retour accueil

5. **Scans récents**
   - Liste des 5 derniers scans
   - Nom, type, timestamp pour chaque scan

## ⚙️ Configuration technique

### Contraintes caméra
```typescript
const cameraConstraints = {
  facingMode: 'environment' // Caméra arrière privilégiée
};
```

### Timing et performance
- **FPS** : 15 images/seconde (balance fluidité/performance)
- **Cadre adaptatif** : 70% de la zone d'affichage
- **nextTick()** : Synchronisation avec le rendu Vue

## 🔒 Sécurité et permissions

1. **Demande explicite** des permissions caméra
2. **Gestion gracieuse** des refus de permission
3. **Messages explicites** pour guider l'utilisateur
4. **Nettoyage propre** des streams vidéo

## 🐛 Résolution de problèmes

### Erreurs communes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Element not found" | Timing Vue/DOM | Ajout de `nextTick()` |
| "Camera permission denied" | Utilisateur refuse | Guide vers paramètres navigateur |
| "No camera found" | Pas de caméra | Message informatif |
| "Scanner won't start" | Configuration invalide | Configuration simplifiée |

### Debug

Pour diagnostiquer les problèmes :
1. Ouvrir console navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Tester les permissions manuellement
4. Vérifier compatibilité navigateur

## 🚀 Utilisation

### Workflow normal
1. Utilisateur arrive sur `/attendance/scan`
2. Sélectionne "Entrée" ou "Sortie"
3. Clique "Vérifier la caméra" (optionnel)
4. Clique "Démarrer le scan"
5. Autorise l'accès caméra si demandé
6. Présente le QR code devant la caméra
7. Scanner détecte et traite automatiquement
8. Résultat affiché avec possibilité de nouveau scan

### Cas d'erreur
- Permissions refusées → Message guide utilisateur
- QR invalide → Scanner continue automatiquement
- Erreur technique → Message d'erreur et reset

## 📱 Compatibilité

### Navigateurs supportés
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Chrome Mobile
- Safari Mobile

### Limitations
- Nécessite HTTPS en production
- Accès caméra requis
- JavaScript activé

## 🔄 Intégration future

### TODO Backend
```typescript
// Vérification employé avec backend
const response = await $fetch('/api/attendance/check', {
  method: 'POST',
  body: {
    employeeId: employeeData.matricule,
    type: scanType.value
  }
});
```

### Améliorations possibles
- Cache des employés scannés
- Mode hors ligne
- Scanner de codes-barres
- Notifications en temps réel
- Statistiques de pointage
