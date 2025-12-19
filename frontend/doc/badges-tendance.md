# 📊 Guide des Badges de Tendance (Dashboard)

## Introduction

Les badges de tendance sont des indicateurs visuels affichés sur les cartes du tableau de bord. Ils permettent de comparer la performance actuelle avec la période précédente et d'identifier rapidement si l'activité est en hausse, en baisse, ou stable.

## Comment ça fonctionne ?

### Principe de base

Chaque badge compare **deux périodes** :

- **Période N (actuelle)** : Les données de la période en cours
- **Période N-1 (précédente)** : Les données de la période juste avant

Le badge affiche la **variation en pourcentage** entre ces deux périodes.

### Les différents modes

#### Mode "7 derniers jours" (par défaut)

- **Période N** : Aujourd'hui
- **Période N-1** : Hier
- **Exemple** : Si le CA d'aujourd'hui est de 15000 KMF et celui d'hier était de 12000 KMF, le badge affichera **+25%** en vert.

#### Mode "4 dernières semaines"

- **Période N** : La semaine en cours (du lundi à maintenant)
- **Période N-1** : La semaine dernière (du lundi au dimanche)
- **Exemple** : Si les ventes de cette semaine sont de 50 unités et celles de la semaine dernière étaient de 60 unités, le badge affichera **-17%** en rouge.

#### Mode "Mois en cours"

- **Période N** : Le mois en cours (du 1er à aujourd'hui)
- **Période N-1** : Le mois précédent (du 1er au dernier jour)
- **Exemple** : Si le CA du mois en cours est de 500000 KMF et celui du mois dernier était de 400000 KMF, le badge affichera **+25%** en vert.

## Formule de calcul

```
Variation (%) = ((Valeur Actuelle - Valeur Précédente) / Valeur Précédente) × 100
```

### Exemples de calcul

#### Cas 1 : Hausse de performance

- Hier : 10000 KMF
- Aujourd'hui : 15000 KMF
- Calcul : ((15000 - 10000) / 10000) × 100 = **+50%** ✅ (Badge vert)

#### Cas 2 : Baisse de performance

- Hier : 20000 KMF
- Aujourd'hui : 15000 KMF
- Calcul : ((15000 - 20000) / 20000) × 100 = **-25%** ⚠️ (Badge rouge)

#### Cas 3 : Performance stable

- Hier : 10000 KMF
- Aujourd'hui : 10000 KMF
- Calcul : ((10000 - 10000) / 10000) × 100 = **0%** (Badge gris)

#### Cas 4 : Aucune activité aujourd'hui

- Hier : 20000 KMF
- Aujourd'hui : 0 KMF
- Calcul : ((0 - 20000) / 20000) × 100 = **-100%** ❌ (Badge rouge)

## Interprétation des couleurs

| Couleur      | Icône | Signification         | Exemple           |
| ------------ | ----- | --------------------- | ----------------- |
| 🟢 **Vert**  | ↑     | Performance en hausse | +15%, +50%, +120% |
| 🔴 **Rouge** | ↓     | Performance en baisse | -10%, -35%, -80%  |
| ⚪ **Gris**  | —     | Performance stable    | 0%                |

## Pourquoi je vois du rouge au début ?

### Scénario typique au lancement

Lorsque vous lancez l'application pour la première fois ou en début de journée, il est **normal** de voir des badges rouges avec des pourcentages élevés (ex: -88%, -100%). Voici pourquoi :

1. **Hier** : Vous aviez des ventes (ex: 50000 KMF)
2. **Aujourd'hui (maintenant)** : Il est encore tôt, peu ou pas de ventes (ex: 5000 KMF)
3. **Résultat** : Le système compare et affiche -90% en rouge

> **Ce n'est pas un bug, c'est une fonctionnalité !** Le badge vous alerte qu'il n'y a pas encore eu beaucoup d'activité aujourd'hui.

### Au fil de la journée

Au fur et à mesure que les ventes arrivent, le badge évoluera :

- **8h00** : -95% (rouge) → Ventes = 2500 KMF
- **12h00** : -50% (rouge) → Ventes = 25000 KMF
- **16h00** : +10% (vert) → Ventes = 55000 KMF ✅

## Conseils d'utilisation

### Pour une analyse plus stable

- Utilisez le mode **"Mois en cours"** pour avoir une vue globale moins sujette aux fluctuations quotidiennes.
- Consultez le dashboard en **fin de journée** pour obtenir des tendances plus représentatives en mode "Jour".

### Pour un suivi précis

- Le mode **"7 derniers jours"** est idéal pour détecter rapidement les anomalies.
- Le mode **"4 dernières semaines"** permet d'identifier les tendances à moyen terme.

### Interprétation contextuelle

- Un badge **rouge le matin** est normal, ne paniquez pas !
- Un badge **rouge en fin de journée** mérite une attention particulière.
- Comparez toujours avec les graphiques pour avoir le contexte complet.

## Questions fréquentes

### Pourquoi -100% ?

**Réponse** : Cela signifie qu'il n'y a eu **aucune activité** pendant la période actuelle, alors qu'il y en avait pendant la période précédente.

### Le badge ne change pas, pourquoi ?

**Réponse** : Vérifiez que le filtre de période est bien configuré et que de nouvelles ventes ont été enregistrées. Cliquez sur le bouton 🔄 pour rafraîchir.

### Peut-on masquer les badges ?

**Réponse** : Les badges sont une fonctionnalité clé pour le pilotage de l'activité. Toutefois, les cartes "Stock faible" et "Achats en attente" n'en ont pas car elles ne sont pas comparables dans le temps.

## Support technique

Si vous constatez des incohérences dans les calculs ou si un badge affiche une valeur incorrecte, vérifiez :

1. La date et l'heure du serveur
2. Les données de ventes pour les deux périodes comparées
3. Les logs du backend pour d'éventuelles erreurs de calcul

---

_Dernière mise à jour : 19 décembre 2024_
