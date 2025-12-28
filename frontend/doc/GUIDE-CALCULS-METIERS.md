# Guide des Calculs et Formules Métiers

Ce document explique les formules utilisées pour générer les indicateurs de performance (KPI) dans votre application de gestion de stock.

---

## 1. Chiffre d'Affaires (CA)

Le Chiffre d'Affaires représente le montant total des ventes réalisées (TTC), après déduction des remises éventuelles.

**Formule :**

> `CA = ∑ (Somme des Montants Totaux des ventes au statut "PAYEE")`

**Exemple :**

- Vente A : 10 000 FCFA
- Vente B : 5 000 FCFA
- **CA Total = 15 000 FCFA**

---

## 2. Bénéfice (Marge Brute Estimée)

L'objectif est d'afficher le bénéfice réalisé sur les ventes.

> [!IMPORTANT] > **Calcul de la Marge**
> Comme le prix d'achat historique n'est pas stocké dans les lignes de vente (`vente_detail`), nous utilisons le **prix d'achat actuel** du produit (`produit.prix_achat`) pour calculer la marge estimée.

**Formule :**

> `Bénéfice = Ventes TTC - Coût d'Achat`

**Calcul du Coût d'Achat (Priorités) :**

1.  **Priorité 1** : Si un **Prix d'Achat** est défini sur le **Conditionnement** (ex: prix du carton), c'est ce prix qui est utilisé directement.
2.  **Priorité 2** : Sinon, le système utilise le **Prix d'Achat du Produit** (unité) multiplié par la **Quantité de base**.

_Note : Pour une vente contenant plusieurs articles différents, le système calcule la marge de **chaque ligne** individuellement avec ces règles de priorité, puis additionne le tout pour obtenir le bénéfice total._

**Exemple Concret :**

- **Ventes TTC** : Vous avez vendu pour 15 000 FCFA de marchandises.
- **Coût Estimé** : 10 x 1 000 = 10 000 FCFA.
- **Bénéfice** : 15 000 - 10 000 = **5 000 FCFA**.

---

## 3. Indicateurs de Stock

### Stock Faible

Un produit est considéré en "Stock Faible" s'il reste en stock mais que sa quantité est inférieure ou égale au seuil de sécurité (Quantité Minimum) que vous avez défini.

> **Condition :** `0 < Quantité ≤ Quantité Minimum`

### Stock en Rupture

Un produit est considéré en "Rupture" lorsqu'il n'y a plus aucune unité disponible en magasin.

> **Condition :** `Quantité ≤ 0`

### Total Produits

Représente le nombre total de produits actifs configurés dans votre catalogue.

### Produits Périmés

Indique le nombre de produits ayant au moins un lot dont la date de péremption est dépassée et dont il reste du stock physiquement.

> **Condition :** `Date Péremption < Aujourd'hui` ET `Stock du lot > 0`

---

## 4. Panier Moyen

Le panier moyen indique le montant moyen dépensé par un client lors d'une transaction.

**Formule :**

> `Panier Moyen = Chiffre d'Affaires Total / Nombre de Ventes`

**Exemple :**

- CA Total : 100 000 FCFA
- Nombre de ventes : 20
- **Panier Moyen = 100 000 / 20 = 5 000 FCFA**

---

## 5. Taux de Variation (Tendances)

Les flèches de tendance (ex: +15%) comparent la période actuelle (ex: aujourd'hui) à la période précédente (ex: hier).

**Formule :**

> `Variation (%) = ((Valeur Actuelle - Valeur Précédente) / Valeur Précédente) × 100`

**Exemple :**

- CA Aujourd'hui : 12 000 FCFA
- CA Hier : 10 000 FCFA
- Variation = ((12 000 - 10 000) / 10 000) × 100 = **+20%**

---

> [!NOTE] > **Précision sur le Bénéfice**
> Le bénéfice affiché est une **estimation**. Si vous changez le prix d'achat d'un produit dans les réglages, les bénéfices passés seront recalculés avec ce nouveau prix. Pour une précision comptable absolue, il est recommandé de maintenir vos prix d'achat à jour.
