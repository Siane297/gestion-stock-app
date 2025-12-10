# Documentation des Formules Statistiques

Ce document détaille les formules mathématiques et la logique métier utilisées pour calculer les statistiques affichées sur le tableau de bord, en incluant les extraits de code correspondants.

## 1. Graphique de Répartition (PieChart)

Ce graphique affiche la répartition journalière des employés selon trois catégories : Présents, Absents et En Congé.

### Calcul des Pourcentages

Le calcul des pourcentages est effectué automatiquement par la librairie de graphique (ApexCharts) sur la base des données brutes fournies.

**Code (Frontend - `PieChart.vue`)** :

```typescript
// Séries de données pour le donut chart
const series = computed(() => {
  if (!props.data) return [];

  return [
    props.data.presencesDuJour,  // Déjà inclut A_L_HEURE + EN_RETARD
    props.data.absencesDuJour,
    props.data.congesDuJour,
  ];
});

// ...

dataLabels: {
  formatter: (val: number) => `${val.toFixed(1)}%`,
}
```

**Explication en Français** :

> Le pourcentage pour chaque catégorie (Présence, Absence, Congé) est calculé en divisant le nombre d'employés dans cette catégorie par le nombre total d'employés (somme des trois catégories), puis en multipliant par 100.
>
> _Par exemple : Si 3 employés sont présents sur un total de 6, le calcul est (3 ÷ 6) × 100 = 50%._

---

## 2. Classement des Meilleurs Employés (Top Employees)

Ce widget affiche les 5 employés ayant le meilleur taux de présence sur le mois sélectionné.

### Calcul du Taux de Présence Mensuel

Le taux est calculé pour chaque employé en comparant ses jours de présence aux jours ouvrables du mois.

**Code (Backend - `statsController.ts`)** :

```typescript
// Calcul des jours ouvrables (lundi au vendredi)
for (let d = new Date(startOfMonth); d <= loopEnd; d.setDate(d.getDate() + 1)) {
  const day = d.getDay();
  if (day !== 0 && day !== 6) workingDays++; // Exclure samedi (6) et dimanche (0)
}

// ...

// Calcul du pourcentage
const presenceRate = Math.min(
  Math.round((presenceCount / workingDays) * 100),
  100
);
```

**Explication en Français** :

> 1.  **Jours Ouvrables** : On compte le nombre de jours du lundi au vendredi écoulés depuis le début du mois jusqu'à aujourd'hui. Les samedis et dimanches sont exclus.
> 2.  **Jours de Présence** : On compte le nombre de fois où l'employé a pointé (à l'heure ou en retard).
> 3.  **Taux** : On divise le nombre de jours de présence par le nombre de jours ouvrables, puis on multiplie par 100 pour obtenir un pourcentage. Le résultat est arrondi à l'entier le plus proche et ne peut pas dépasser 100%.

### Filtrage et Tri

**Code (Backend - `statsController.ts`)** :

```typescript
const topEmployees = employeeStats
  .filter((emp: any) => emp.presenceRate > 0) // Exclure ceux avec 0%
  .sort((a: any, b: any) => b.presenceRate - a.presenceRate) // Tri décroissant
  .slice(0, 5); // Prendre les 5 premiers
```

**Explication en Français** :

> La liste des employés est d'abord filtrée pour retirer ceux qui ont 0% de présence. Ensuite, elle est triée du plus grand pourcentage au plus petit. Enfin, on ne garde que les 5 premiers employés de cette liste triée pour les afficher dans le widget.
