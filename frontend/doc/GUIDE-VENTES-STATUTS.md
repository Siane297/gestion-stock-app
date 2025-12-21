# Guide de Gestion des Statuts de Vente 📝

Ce guide explique comment gérer les différents états d'une vente dans le système et les conséquences de chaque changement.

---

## 1. Cycle de Vie d'une Vente

| Statut         | Signification                           | Impact Stock                      |
| :------------- | :-------------------------------------- | :-------------------------------- |
| **BROUILLON**  | Vente en cours de préparation.          | Aucun impact.                     |
| **EN_ATTENTE** | Vente confirmée mais pas encore payée.  | **Soustrait** du stock.           |
| **PAYEE**      | Vente validée et encaissée.             | **Soustrait** du stock.           |
| **ANNULEE**    | Vente annulée après validation.         | **Remis en stock** (Automatique). |
| **REMBOURSEE** | Client remboursé après une vente payée. | **Remis en stock** (Automatique). |

---

## 2. Détails des Statuts

### ✅ PAYEE (Statut Standard)

C'est le statut final après une vente réussie au POS (Point de Vente).

- L'argent est ajouté au chiffre d'affaires.
- Le stock est déduit immédiatement.
- Un numéro de ticket (`TC-XXX`) est généré.

### ⏳ EN_ATTENTE

Utilisé pour les ventes à crédit ou les commandes en attente de règlement.

- Le stock est déjà réservé (sorti) pour éviter de vendre deux fois le même produit.
- La vente apparaît dans l'historique mais n'est pas encore comptabilisée dans le fond de caisse réel.

### ❌ ANNULEE (Gestion des Erreurs)

Si une erreur est commise lors de la vente, vous pouvez passer le statut à **ANNULEE**.

- **Action automatique :** Le système détecte l'annulation et remet automatiquement les quantités en stock dans le bon magasin.
- La vente reste dans l'historique pour la traçabilité mais n'apparaît plus dans le calcul du chiffre d'affaires.

---

## 3. Comment changer un statut ?

1. Rendez-vous dans **Historique des Ventes**.
2. Cliquez sur les actions (les trois points `...`) d'une vente.
3. Choisissez l'option correspondante (ex: "Annuler la vente").
4. Confirmez l'action.

> [!WARNING]
> Une vente **ANNULEE** ne peut pas être remise en "PAYEE" directement. Il est conseillé de refaire une nouvelle vente si nécessaire.

> [!IMPORTANT]
> Seuls les utilisateurs avec les droits d'administration ou les responsables de magasin peuvent annuler des ventes déjà payées.
