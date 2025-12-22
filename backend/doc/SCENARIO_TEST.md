# Scénario de Test du Système de Permissions

Ce guide vous propose un parcours pas-à-pas pour vérifier que votre nouveau système de permissions fonctionne correctement sur toutes les couches (Interface, Navigation, API).

---

## Étape 1 : Préparation (Compte Admin)

1. Connectez-vous avec votre compte **ADMIN** principal.
2. Rendez-vous dans **Gestion des Utilisateurs**.
3. Créez un nouvel utilisateur test :
   - **Nom** : "Vendeur Test"
   - **Rôle** : `Vendeur` (SELLER)
   - **Boutique** : Sélectionnez une boutique spécifique.

---

## Étape 2 : Test du Rôle "Vendeur" (Filtrage UI)

1. Déconnectez-vous et reconnectez-vous avec le compte **Vendeur Test**.
2. **Vérification de la Sidebar** :
   - ✅ Vous devriez voir : Tableau de bord, Produits, Ventes, Clients, Caisses.
   - ❌ Vous NE devriez PAS voir : Personnel, Utilisateurs, Paramètres, Comptabilité.
3. **Vérification des Actions** :
   - Allez dans **Ventes** : Vous devriez pouvoir créer une vente.
   - Allez dans **Produits** : Vous devriez voir la liste, mais le bouton "Ajouter" ou "Supprimer" devrait être masqué ou désactivé.

---

## Étape 3 : Test de la Sécurité (Middleware)

1. Toujours avec le compte **Vendeur Test**, essayez de forcer l'accès par l'URL.
2. Tapez manuellement dans votre navigateur : `http://localhost:3000/organisation` ou `http://localhost:3000/utilisateur`.
3. **Résultat attendu** : Vous devriez être automatiquement redirigé vers l'accueil ou voir un message "Accès refusé".

---

## Étape 4 : Test du "Gérant de Boutique" (Multi-Boutiques)

1. Reconnectez-vous en **ADMIN**.
2. Créez un utilisateur "Gérant A" :
   - **Rôle** : `Gérant de Boutique` (STORE_MANAGER).
   - **Boutiques gérées** : Affectez-le uniquement à la "Boutique A".
3. Connectez-vous en tant que **Gérant A**.
4. Allez dans le sélecteur de boutique (en haut à droite ou dans les filtres) :
   - ✅ Vous ne devriez pouvoir sélectionner et voir que les données de la **Boutique A**.

---

## Étape 5 : Test des Permissions Personnalisées (ACL)

1. Reconnectez-vous en **ADMIN**.
2. Modifiez le compte du **Vendeur Test**.
3. Dans la grille des permissions, cochez exceptionnellement le droit : **"Personnel : Voir"**.
4. Enregistrez et reconnectez-vous en **Vendeur Test**.
5. **Résultat attendu** : Bien que son rôle soit "Vendeur", l'onglet **Personnel** devrait maintenant apparaitre dans sa Sidebar grâce à la permission personnalisée.

---

## Résumé des points de contrôle

- [ ] La Sidebar s'adapte-t-elle au rôle ?
- [ ] L'accès direct par URL est-il bloqué pour les pages interdites ?
- [ ] Les données sont-elles filtrées par boutique pour les gérants ?
- [ ] Les permissions "Custom" surchargent-elles bien le rôle de base ?
