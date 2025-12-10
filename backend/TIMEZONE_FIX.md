# Correction du Problème de Timezone

## 🎯 Problème

Le backend enregistre les timestamps en **UTC** (temps universel), mais le frontend affiche en **heure locale EAT (UTC+3)**. Cela crée un décalage de 3 heures dans les calculs et l'affichage.

**Exemple :**
- Pointage réel : 11:14 (heure locale Nairobi)
- Stocké en DB : 08:14 (UTC)
- Affiché frontend : 11:14 (converti depuis UTC)
- **Problème** : Les calculs backend utilisent 08:14 au lieu de 11:14

## ✅ Solution Implémentée

### 1. Configuration Timezone

**Backend (.env) :**
```bash
TZ=Africa/Nairobi
```

**Render (Variables d'environnement) :**
```bash
TZ=Africa/Nairobi
```

### 2. Utilitaire Timezone

Créé `src/utils/timezone.ts` avec des fonctions pour :
- `getLocalNow()` : Obtenir l'heure actuelle locale
- `getStartOfDay()` : Début de journée en heure locale
- `getEndOfDay()` : Fin de journée en heure locale
- `formatLocalTime()` : Formater en heure locale

### 3. Modifications à Faire

**Important** : Node.js utilise toujours UTC en interne. La variable `TZ` affecte uniquement `toLocaleString()` et les affichages, **PAS** les calculs `new Date()`.

**Solution** : Utiliser explicitement le fuseau horaire dans les calculs.

## 📋 Fichiers à Modifier

### Option 1 : Utiliser UTC partout (Recommandé)

**Avantages :**
- Standard international
- Pas de problème de changement d'heure
- Compatible avec tous les fuseaux horaires

**Modifications :**
- Backend : Continuer à stocker en UTC
- Frontend : Toujours convertir en heure locale pour l'affichage
- Calculs : Faire en UTC, puis convertir pour l'affichage

### Option 2 : Forcer l'heure locale partout

**Avantages :**
- Cohérence visuelle
- Calculs directs

**Inconvénients :**
- Problèmes si changement de fuseau horaire
- Non standard

## 🚀 Recommandation

**Garder UTC en base de données** mais améliorer la conversion frontend :

1. Backend stocke en UTC (comme actuellement)
2. Frontend convertit TOUJOURS en EAT pour l'affichage
3. Les calculs backend utilisent UTC mais comparent avec les heures configurées ajustées

## 📝 Note Importante

Le problème de "durée = 0" pour Marina est **indépendant** du timezone :
- Elle est arrivée à 11:14 et partie à 11:18 (heure locale)
- C'est pendant la pause (10:27 - 13:27)
- Donc durée de travail = 0 (logique métier, pas timezone)

Pour afficher correctement, assurez-vous que le frontend utilise :
```typescript
new Date(timestamp).toLocaleString('fr-FR', { timeZone: 'Africa/Nairobi' })
```
