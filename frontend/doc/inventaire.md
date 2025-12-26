# Documentation : Module d'Inventaire Physique

Ce document explique le fonctionnement, la logique métier et le cycle de vie du module d'inventaire implémenté dans l'application.

## 1. Vue d'ensemble

Le module d'inventaire permet de rapprocher le stock théorique (enregistré dans le logiciel) avec le stock réel (physiquement présent dans le magasin). Il permet d'identifier les pertes ou les surplus et d'ajuster automatiquement les stocks pour refléter la réalité.

## 2. Cycle de vie de l'inventaire (Workflow)

L'inventaire passe par quatre statuts successifs, chacun ayant un rôle précis :

| Statut        | Description                                             | Actions possibles                                            |
| :------------ | :------------------------------------------------------ | :----------------------------------------------------------- |
| **BROUILLON** | L'inventaire est créé mais n'a pas encore commencé.     | Modifier les commentaires, Supprimer l'inventaire, Démarrer. |
| **EN_COURS**  | Le comptage physique est actif.                         | Saisir les quantités comptées, Finaliser.                    |
| **TERMINE**   | Le comptage est clos. On visualise les écarts.          | Consulter les rapports, Valider (Ajuster les stocks).        |
| **VALIDE**    | L'inventaire est définitif. Les stocks ont été ajustés. | Consulter le rapport final (Historique).                     |

### Détails des étapes :

1. **Démarrage** : Au moment où l'utilisateur clique sur "Démarrer", le système fige la **Quantité Théorique** de chaque produit. Même si des ventes ont lieu pendant l'inventaire, c'est cette valeur figée qui servira de base de calcul.
2. **Finalisation** : L'utilisateur peut finaliser dès qu'**au moins un produit** a été compté. Si des produits ne sont pas comptés, un message d'avertissement s'affiche pour confirmer l'action. Les produits non comptés **conserveront leur stock théorique** (aucun ajustement ne sera effectué sur ces lignes).
3. **Validation** : C'est l'étape critique. Le système calcule les écarts définitifs et génère automatiquement des mouvements de stock de type **AJUSTEMENT** uniquement pour les produits qui ont été comptés.

---

## 3. Formules de calcul

Le système utilise les formules suivantes pour calculer les performances de l'inventaire :

### Écart de quantité

L'écart représente la différence entre ce que vous avez trouvé et ce qui était attendu.

> **Formule :**  
> `Écart = Quantité Comptée - Quantité Théorique`

- **Écart > 0** : Surplus (Vous avez plus de stock que prévu).
- **Écart < 0** : Manquant (Il manque du stock par rapport au logiciel).
- **Écart = 0** : Stock conforme.

### Valorisation de l'écart

Pour transformer cet écart en valeur monétaire, on utilise le prix d'achat du produit.

> **Formule :**  
> `Valeur de l'Écart = Écart × Prix d'Achat`

> [!IMPORTANT]
> Si le prix d'achat n'est pas renseigné dans la fiche produit (valeur à 0 ou null), la valeur de l'écart sera de **0**, même si la quantité est différente.

### Statistiques Globales

- **Valeur Écart Positif** : Somme des valeurs des produits en surplus.
- **Valeur Écart Négatif** : Somme des valeurs (en valeur absolue) des produits manquants.
- **Progression** : `(Produits Comptés / Total Produits) × 100`

---

## 4. Logique d'Ajustement des Stocks

Lors de la **Validation**, le système remplace le stock par la quantité réellement comptée.

**Principe clé :** Le stock est **remplacé** par la quantité comptée, pas simplement ajusté par l'écart.

**Exemple concret :**

- Produit : Riz Basmati
- **Au démarrage de l'inventaire**
  - Stock théorique figé : **48 kg**
- **Pendant l'inventaire (mouvements possibles)**
  - 2 ventes : -2 kg → Stock réel devient **46 kg**
- **Lors du comptage**
  - Quantité physiquement comptée : **60 kg**
- **À la validation**
  1. Le système récupère le **stock actuel** : 46 kg
  2. Compare avec la **quantité comptée** : 60 kg
  3. Calcule l'ajustement nécessaire : 60 - 46 = **+14 kg**
  4. Crée un mouvement `AJUSTEMENT` de +14 kg
  5. **Résultat final** : Stock = **60 kg** (quantité comptée)

> [!IMPORTANT]
> Cette logique garantit que le stock dans le système correspond **exactement** à ce qui a été physiquement compté, indépendamment des mouvements survenus pendant l'inventaire.

**Raison du mouvement :**
_"Inventaire INV-2025-001 - Ajustement +14 (Stock: 46 → 60)"_

---

## 5. Gestion des Permissions

L'accès au module est sécurisé par des permissions granulaires :

- **`inventaire:voir`** : Permet de voir la liste et les rapports.
- **`inventaire:creer`** : Permet de créer un brouillon et de démarrer.
- **`inventaire:modifier`** : Permet de saisir les quantités lors du comptage.
- **`inventaire:valider`** : (Critique) Permet d'ajuster les stocks définitifs. Généralement réservé aux Managers ou Admins.
- **`inventaire:supprimer`** : Permet de supprimer un brouillon.

---

## 6. Conseils d'utilisation

- **Péremption** : Si un produit gère les lots, l'inventaire se fait **lot par lot**. Assurez-vous de compter chaque lot séparément.
- **Interruption** : Vous pouvez quitter la page de comptage et revenir plus tard, vos saisies sont enregistrées à chaque clic sur le bouton de validation de ligne.
- **Vérification** : Toujours vérifier les produits avec des prix d'achat à 0 avant de valider l'inventaire pour garantir des statistiques financières exactes.
