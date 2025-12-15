# Comprendre le calcul des Prix : Colis vs Unitaire

Ce document explique comment le système calcule automatiquement le prix de revient de vos produits lorsque vous achetez en gros (Colis, Pack, Carton, etc.).

## 💡 Le Principe de Base

Le système stocke toujours **la valeur unitaire** d'un produit (la valeur d'une seule pièce). Cela permet de garder une cohérence dans votre stock, que vous achetiez par carton de 24 ou par paquet de 6.

### La Formule Magique

Lorsque vous saisissez un achat par colis, le système fait ce calcul instantané :

> **Prix Unitaire = Prix du Colis ÷ Nombre d'articles dans le Colis**

---

## 📝 Exemple Concret

Imaginons que vous achetiez des **Jus d'Orange 1L**.
Ce produit est conditionné en **Cajot de 12 bouteilles**.

Vous achetez **2 Cajots** à **5 000 KMF** l'unité (le cajot).

### Ce que vous saisissez :

- **Conditionnement** : Cajot (12 unités)
- **Quantité** : 2 (colis)
- **Prix par Colis** : 5 000 KMF

### Ce que le système calcule :

1.  **Le Prix Unitaire (Réel)** :

    - Le système prend le prix du colis : **5 000 KMF**
    - Il divise par le contenu du cajot : **12 bouteilles**
    - Calcul : `5 000 ÷ 12 = 416,67 KMF`
    - 👉 **Chaque bouteille vous coûte réellement 416,67 KMF.**

2.  **Le Total à payer** :
    - Vous avez pris 2 colis à 5 000 KMF.
    - Calcul : `2 × 5 000 = 10 000 KMF`.

### Résumé Visuel

| Donnée            | Valeur Saisie / Calculée | Explication                                                      |
| :---------------- | :----------------------- | :--------------------------------------------------------------- |
| **Prix Colis**    | **5 000 KMF**            | C'est ce que vous payez au fournisseur pour un carton.           |
| **Quantité**      | **2 Colis**              | Le nombre de cartons que vous achetez.                           |
| **Contenu**       | 12 Unités                | Le nombre de bouteilles dans un carton.                          |
| **Prix Unitaire** | **416,67 KMF**           | `5 000 ÷ 12`. La valeur réelle d'une bouteille dans votre stock. |
| **Total Ligne**   | **10 000 KMF**           | `5 000 × 2`. Ce que vous devez payer au fournisseur.             |

---

## ❓ Question Fréquente

**"Si je prends 10 colis, est-ce que le Prix Unitaire change ?"**

**Non**, sauf si le fournisseur vous fait une réduction sur le prix du colis.

- Si le carton reste à 5 000 KMF, la bouteille reviendra toujours à 416,67 KMF, que vous en preniez 1 ou 100.
- Le **Prix Unitaire** est votre indicateur de rentabilité. Il vous aide à savoir combien vous gagnez sur la vente d'une seule bouteille.
