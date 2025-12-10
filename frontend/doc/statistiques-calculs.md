# Documentation des Calculs de Statistiques

Ce document explique comment les pourcentages et statistiques sont calculés dans l'application de pointage.

## Table des Matières

- [Widget Top Employés](#widget-top-employés)
- [Graphique PieChart (Donut)](#graphique-piechart-donut)

---

## Widget Top Employés

**Emplacement**: `components/statistics/TopEmployees.vue`  
**API Backend**: `/api/stats/top-employees`  
**Contrôleur**: `pointage-back/src/controllers/statsController.ts` (`getTopEmployees`)

### Calcul du Taux de Présence

Le taux de présence d'un employé est calculé pour un mois donné comme suit :

#### 1. Décompte des Jours de Présence

Le backend compte tous les jours où l'employé a un statut "présent" dans la table `BilanPresence` :

```typescript
const presenceCount = await tenantPrisma.bilanPresence.count({
  where: {
    employeeId: employee.id,
    createdAt: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
    statut: {
      in: ["A_L_HEURE", "EN_RETARD"], // Statuts considérés comme "présent"
    },
  },
});
```

**Statuts pris en compte**:

- `A_L_HEURE` : Employé à l'heure
- `EN_RETARD` : Employé en retard (mais présent)

**Statuts exclus**:

- `ABSENT` : Absence non justifiée
- `INCOMPLET` : Journée incomplète (pas de sortie enregistrée)
- `CONGE` : Employé en congé

#### 2. Calcul des Jours Ouvrables

Le backend calcule le nombre de jours ouvrables **écoulés** dans le mois (du 1er du mois jusqu'à aujourd'hui ou la fin du mois si c'est un mois passé) :

```typescript
let workingDays = 0;
const today = new Date();
const loopEnd = today < endOfMonth ? today : endOfMonth;

for (let d = new Date(startOfMonth); d <= loopEnd; d.setDate(d.getDate() + 1)) {
  const day = d.getDay();
  if (day !== 0 && day !== 6) workingDays++; // Exclure samedi (6) et dimanche (0)
}

// Éviter la division par zéro
workingDays = Math.max(workingDays, 1);
```

**Points importants**:

- Seuls les jours du lundi au vendredi sont comptabilisés
- Les week-ends (samedi et dimanche) sont automatiquement exclus
- Le calcul s'arrête à aujourd'hui pour le mois en cours
- **⚠️ Limitation**: Les jours fériés ne sont pas encore pris en compte

#### 3. Calcul du Pourcentage

Le taux de présence est calculé avec la formule suivante :

```typescript
const presenceRate = Math.min(
  Math.round((presenceCount / workingDays) * 100),
  100
);
```

**Formule**: `Taux = (Jours Présents / Jours Ouvrables) × 100`

**Exemple**:

- Mois : Décembre 2024 (du 1er au 3, donc 3 jours écoulés)
- Jours ouvrables : 2 (lundi 2 et mardi 3, le dimanche 1er est exclu)
- Jours présents : 2
- Taux de présence : `(2 / 2) × 100 = 100%`

#### 4. Filtrage et Tri

Le backend filtre et trie les employés :

```typescript
const topEmployees = employeeStats
  .filter((emp: any) => emp.presenceRate > 0) // Exclure ceux avec 0%
  .sort((a: any, b: any) => b.presenceRate - a.presenceRate) // Tri décroissant
  .slice(0, 5); // Prendre les 5 premiers
```

**Règles de filtrage**:

- Seuls les employés **actifs** (`isActive: true`) sont pris en compte
- Les employés avec 0% de présence sont exclus du classement
- Maximum 5 employés affichés

### Affichage Frontend

Le widget affiche pour chaque employé :

- **Nom complet** avec avatar
- **Pourcentage de présence** (arrondi à l'entier)
- **Barre de progression** visuelle
- **Département** de l'employé
- **Nombre de jours présents** (ex: "15 jours")

---

## Graphique PieChart (Donut)

**Emplacement**: `components/chart/PieChart.vue`  
**Type**: Donut Chart (ApexCharts)  
**Données**: Basées sur les statistiques du dashboard

### Source des Données

**Exemple**:

- Présences : 8 (6 à l'heure + 2 en retard)
- Absences : 2
- Congés : 0
- **Total** : 10

**Résultat**:

- Présences : `(8 / 10) × 100 = 80%`
- Absences : `(2 / 10) × 100 = 20%`
- Congés : `(0 / 10) × 100 = 0%`

#### 3. Affichage

Le graphique utilise les options suivantes :

```typescript
dataLabels: {
  enabled: true,
  formatter: (val: number) => `${val.toFixed(1)}%`, // Affiche 1 décimale
  style: {
    fontSize: "14px",
    fontWeight: 600,
    colors: ["#fff"], // Texte blanc sur les segments
  },
}
```

### Notes Importantes

#### Différence avec Top Employés

## Améliorations Futures

### Pour Top Employés

- **Backend Stats Controller**: `pointage-back/src/controllers/statsController.ts`
- **Frontend Stats API**: `pointage-front/composables/api/useStatsApi.ts`
- **Frontend Charts API**: `pointage-front/composables/api/useChartsApi.ts`
- **ApexCharts Documentation**: https://apexcharts.com/docs/
