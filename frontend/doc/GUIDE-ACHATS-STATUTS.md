# Guide des Statuts d'Achat (Cycle de Vie)

Ce guide explique les différentes étapes d'une commande fournisseur dans l'application et l'impact de chaque statut sur le stock et la comptabilité.

## Liste des Statuts

| Statut                   | Libellé      | Description                                                                              | Impact Stock                     | Action Requise                   |
| :----------------------- | :----------- | :--------------------------------------------------------------------------------------- | :------------------------------- | :------------------------------- |
| **`COMMANDE`**           | Commande     | La commande est créée et envoyée au fournisseur. Les produits ne sont pas encore livrés. | ❌ Aucun                         | Attendre la livraison.           |
| **`RECU_PARTIELLEMENT`** | Reçu Partiel | Une partie de la marchandise a été livrée.                                               | ⚠️ Augmente le stock (qté reçue) | Mettre à jour le reste à livrer. |
| **`RECU_COMPLET`**       | Reçu Complet | La totalité de la commande a été livrée.                                                 | ✅ Augmente le stock (totalité)  | Vérifier la facture.             |
| **`FACTURE_RECU`**       | Facturé      | La facture fournisseur a été reçue et enregistrée.                                       | ➖ Aucun (déjà reçu)             | Procéder au paiement.            |
| **`PAYE`**               | Payé         | Le paiement a été effectué. Le cycle est clos.                                           | ➖ Aucun                         | Archiver.                        |
| **`ANNULE`**             | Annulé       | La commande est abandonnée.                                                              | ❌ Aucun                         | Aucune.                          |

## Scénarios Types

### 1. Scénario Classique (Idéal)

1.  **Création** : Vous créez un achat en statut `COMMANDE`. Le stock ne bouge pas.
2.  **Réception** : Le camion arrive avec tout. Vous passez le statut à `RECU_COMPLET`.
    - _Action système_ : Le stock de tous les produits augmente immédiatement.
3.  **Facturation** : Vous recevez la facture 2 jours plus tard. Vous passez à `FACTURE_RECU`.
4.  **Paiement** : Vous payez le fournisseur. Vous passez à `PAYE`.

### 2. Scénario Réception Partielle

1.  **Création** : Achat en statut `COMMANDE` de 10 cartons.
2.  **Livraison 1** : Seulement 4 cartons arrivent. Vous passez à `RECU_PARTIELLEMENT`.
    - _Action système_ : Le stock augmente de +4 cartons.
3.  **Livraison 2** : Les 6 derniers cartons arrivent. Vous passez à `RECU_COMPLET`.
    - _Action système_ : Le stock augmente de +6 cartons.

### 3. Scénario Annulation

1.  **Création** : Achat en statut `COMMANDE`.
2.  **Problème** : Le fournisseur ne peut pas livrer.
3.  **Annulation** : Vous passez le statut à `ANNULE`.
    - _Action système_ : Rien ne se passe sur le stock. La commande est juste fermée.
