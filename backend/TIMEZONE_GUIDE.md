# Guide de Gestion des Fuseaux Horaires

## 📊 Architecture Actuelle

### 1. Configuration Horaire (Format Texte)
Les heures de configuration sont stockées en **format texte HH:MM** (heure locale) :
```typescript
ConfigurationHoraire {
  heureDebut: "08:28"        // Heure locale (EAT/UTC+3)
  heureFin: "18:27"          // Heure locale
  heureDebutPause: "10:27"   // Heure locale
  heureFinPause: "13:27"     // Heure locale
}
```

**Avantages :**
- ✅ Indépendant du fuseau horaire
- ✅ Facile à lire et modifier
- ✅ Pas de conversion nécessaire pour l'affichage
- ✅ Compatible avec tous les pays

### 2. Timestamps de Pointage (DateTime UTC)
Les pointages sont stockés en **DateTime UTC** :
```typescript
Attendance {
  timestamp: "2025-11-09T08:14:42.620Z"  // UTC
}
```

**Avantages :**
- ✅ Standard international
- ✅ Pas de problème de changement d'heure
- ✅ Facilite les calculs de durée

### 3. Conversion pour les Calculs

Le service `bilanPresenceService.ts` fait la conversion :

```typescript
// 1. Récupérer l'heure du timestamp (en heure locale du serveur)
const heureArrivee = entree.timestamp.getHours() + ":" + entree.timestamp.getMinutes();

// 2. Convertir en minutes pour comparaison
const convertirEnMinutes = (heure: string): number => {
  const [h, m] = heure.split(':').map(Number);
  return h * 60 + m;
};

// 3. Comparer avec la configuration
const heureArriveeMin = convertirEnMinutes(heureArrivee);
const heureDebutMin = convertirEnMinutes(config.heureDebut); // "08:28"
```

## ⚙️ Configuration Serveur

### Variable d'Environnement TZ

**Local (.env) :**
```bash
TZ=Africa/Nairobi
```

**Render (Variables d'environnement) :**
```bash
TZ=Africa/Nairobi
```

Cette variable affecte :
- `Date.prototype.getHours()` → retourne l'heure locale
- `Date.prototype.toLocaleString()` → formate en heure locale
- Les logs affichés en heure locale

## 🎯 Comportement Attendu

### Exemple Concret

**Configuration :**
- Début : 08:28 (heure locale)
- Fin : 18:27 (heure locale)
- Pause : 10:27 - 13:27 (heure locale)

**Pointage :**
- Employé arrive à 11:14 (heure locale Nairobi)
- Stocké en DB : `2025-11-09T08:14:00.000Z` (UTC)
- Avec `TZ=Africa/Nairobi`, `getHours()` retourne 11

**Calcul :**
1. Heure arrivée : 11:14 → 674 minutes
2. Début pause : 10:27 → 627 minutes
3. Fin pause : 13:27 → 807 minutes
4. **674 est entre 627 et 807** → Arrivée pendant la pause
5. Durée travail matin : max(0, 627 - 674) = 0
6. Durée travail après-midi : 0 (sorti avant fin de pause)
7. **Total : 0 minutes** ✅

## 📱 Frontend

Le frontend doit afficher les timestamps en heure locale :

```typescript
// ✅ Correct
new Date(timestamp).toLocaleString('fr-FR', { 
  timeZone: 'Africa/Nairobi' 
});

// ✅ Ou laisser le navigateur utiliser son timezone local
new Date(timestamp).toLocaleString('fr-FR');
```

## 🔧 Déploiement

### Sur Render

1. Allez dans **Environment Variables**
2. Ajoutez :
   ```
   TZ=Africa/Nairobi
   ```
3. **Redémarrez** le service
4. Vérifiez les logs pour confirmer l'heure locale

### Test

Créez un pointage et vérifiez :
```bash
# Log backend devrait afficher
[INFO] 🕒 Arrivée: 11h14, Sortie: 11h18
```

Si vous voyez `8h14` au lieu de `11h14`, la variable `TZ` n'est pas configurée.

## ✅ Résumé

| Élément | Format | Timezone |
|---------|--------|----------|
| Configuration horaire | Texte "HH:MM" | Heure locale |
| Timestamps pointages | DateTime | UTC |
| Calculs backend | Minutes | Heure locale (via TZ) |
| Affichage frontend | Formaté | Heure locale navigateur |

**Tout fonctionne correctement tant que `TZ=Africa/Nairobi` est configuré sur le serveur.**
