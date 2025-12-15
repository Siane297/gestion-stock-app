# Guide des Opérations de Stock

Ce document explique les différents types de mouvements que vous pouvez enregistrer dans le système pour gérer votre stock.

Comprendre ces types d'opérations est essentiel pour garder un historique propre et des rapports comptables précis.

---

## 🟢 Les Entrées (Augmentent le stock)

Ces opérations rajoutent des produits dans votre magasin.

### 1. Achat (`ENTREE_ACHAT`)

- **Quand l'utiliser :** Lorsque vous recevez une livraison d'un fournisseur.
- **Exemple :** Vous recevez 10 cartons de jus d'orange de votre fournisseur.
- **Impact :** Le stock augmente (+).

### 2. Retour Client (`ENTREE_RETOUR`)

- **Quand l'utiliser :** Lorsqu'un client vous rapporte un produit (remboursement, échange).
- **Exemple :** Un client rapporte une bouteille non ouverte car il s'est trompé.
- **Impact :** Le stock augmente (+) car le produit revient dans le rayon.

---

## 🔴 Les Sorties (Diminuent le stock)

Ces opérations retirent des produits de votre magasin.

### 3. Vente (`SORTIE_VENTE`)

- **Quand l'utiliser :** Généralement automatique via la caisse, mais peut être saisi manuellement si besoin.
- **Exemple :** Vous vendez un produit sans passer par l'interface de caisse principale.
- **Impact :** Le stock diminue (-).

### 4. Perte / Périmé (`SORTIE_PERISSABLE`)

- **Quand l'utiliser :** Pour sortir du stock des produits invendables (endommagés, cassés ou date d'expiration dépassée).
- **Exemple :** Une bouteille s'est cassée ou un lot de yaourts est périmé.
- **Impact :** Le stock diminue (-). C'est considéré comme une perte sèche.

---

## 🟡 Les Mouvements Spéciaux

### 5. Ajustement (`AJUSTEMENT`)

- **Quand l'utiliser :** Pour corriger une erreur de stock sans explication précise (vol, erreur de comptage lors de l'inventaire).
- **Exemple :** L'ordinateur dit qu'il reste 5 stylos, mais vous n'en comptez que 4 en rayon. Vous faites un ajustement de -1.
- **Impact :** Peut augmenter (+) ou diminuer (-) le stock selon le besoin.

### 6. Transfert (`TRANSFERT`)

- **Quand l'utiliser :** Pour déplacer du stock vers un autre de vos magasins ou entrepôts (si vous en avez plusieurs).
- **Exemple :** Vous envoyez 2 cartons de la "Boutique Principale" vers la "Boutique Secondaire".
- **Impact :** Le stock diminue dans le magasin de départ et augmente dans le magasin d'arrivée.
