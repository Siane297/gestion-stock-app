# 📊 Logique de Calcul des Bilans de Présence - Guide Simplifié

## 🎯 Introduction

Ce document explique comment le système calcule automatiquement les bilans de présence des employés : détection des retards, calcul du temps de travail effectif, et gestion des différents cas particuliers.

---

## 📋 Configuration de Base

Chaque organisation définit ses horaires de travail avec :

- **Heure de début** : Quand la journée de travail commence (exemple : 8h00)
- **Heure de fin** : Quand la journée de travail se termine (exemple : 17h00)
- **Pause** : Période de pause non travaillée (exemple : 12h00 à 14h00)
- **Tolérance de retard** : Nombre de minutes acceptées après l'heure de début sans être considéré en retard (exemple : 30 minutes)

---

## 🌍 Gestion des Fuseaux Horaires

### Principe de Base

Tous les pointages sont enregistrés en temps universel (UTC) dans la base de données, mais les calculs se font toujours dans l'heure locale du **pays de l'organisation**. Le système détermine automatiquement le bon fuseau horaire selon le pays sélectionné lors de la création de l'organisation.

### Comment le Système Détermine le Fuseau ?

1. **À la création de l'organisation** : L'administrateur sélectionne le pays
2. **Mapping automatique** : Le système associe le pays à son fuseau horaire IANA
3. **Application transparente** : Tous les calculs utilisent ce fuseau automatiquement

### Exemples Concrets

**Organisation aux Comoros :**
- **Pays sélectionné** : "Comoros"
- **Fuseau automatique** : Indian/Comoro (UTC+3)
- **Pointage à 14h48 UTC** → **Calculs avec 17h48 heure comorienne**

**Organisation en France :**
- **Pays sélectionné** : "France" 
- **Fuseau automatique** : Europe/Paris (UTC+1)
- **Pointage à 14h48 UTC** → **Calculs avec 15h48 heure française**

### Pourquoi c'est Révolutionnaire ?

Même si votre serveur est hébergé en France et votre organisation aux Comoros, le système calcule automatiquement tout dans l'heure comorienne ! Plus besoin de configuration manuelle.

---

## ⏰ Comment le Retard est Calculé

### Les Trois Zones de Pointage

Le système divise la période d'arrivée en trois zones :

1. **Zone verte (À l'heure)** : Arrivée avant l'heure de début
   - Exemple : Heure de début à 8h00, arrivée à 7h50
   - Résultat : PRÉSENT, 0 minute de retard

2. **Zone orange (Tolérance)** : Arrivée après l'heure de début mais dans la tolérance
   - Exemple : Heure de début à 8h00, tolérance 30 min, arrivée à 8h15
   - Résultat : PRÉSENT, 0 minute de retard (dans la tolérance)

3. **Zone rouge (Retard)** : Arrivée après la limite de tolérance
   - Exemple : Heure de début à 8h00, tolérance 30 min, arrivée à 8h50
   - Résultat : EN RETARD, 20 minutes de retard

### Calcul de la Limite de Tolérance

La limite de tolérance est simplement l'heure de début plus la tolérance configurée.

**Exemple :**
- Heure de début : 8h00
- Tolérance : 30 minutes
- Limite de tolérance : 8h30

Si l'employé arrive à 8h50, le retard est calculé comme la différence entre son heure d'arrivée et la limite de tolérance : 8h50 - 8h30 = 20 minutes de retard.

### Point Important

Le retard est enregistré uniquement à titre informatif. Il n'est **jamais soustrait** du temps de travail effectif. Un employé en retard de 20 minutes qui travaille ensuite 8 heures aura bien 8 heures de travail comptabilisées.

---

## 🕐 Calcul de la Durée de Travail

### Principe Fondamental

La journée de travail est divisée en **deux périodes distinctes** :

1. **Période du matin** : Du début de journée jusqu'au début de la pause
2. **Période de l'après-midi** : De la fin de la pause jusqu'à la fin de journée

La pause n'est **jamais** comptée comme du temps de travail, même si l'employé est présent sur site.

### Comment ça Marche ?

#### Période du Matin

Le système calcule le temps travaillé le matin en prenant :
- **Début** : Le plus tard entre l'heure d'arrivée de l'employé et l'heure de début officielle
- **Fin** : Le plus tôt entre l'heure de sortie de l'employé et le début de la pause

Si l'employé arrive en retard, on compte à partir de son arrivée réelle. S'il part avant la pause, on s'arrête à son heure de départ.

#### Période de l'Après-midi

Le système calcule le temps travaillé l'après-midi en prenant :
- **Début** : Le plus tard entre l'heure d'arrivée de l'employé et la fin de la pause
- **Fin** : Le plus tôt entre l'heure de sortie de l'employé et l'heure de fin officielle

Si l'employé arrive pendant ou après la pause, on compte à partir de la fin de la pause. S'il part avant la fin de journée, on s'arrête à son heure de départ.

#### Durée Totale

La durée totale de travail est simplement la somme du temps travaillé le matin et l'après-midi.

---

## 📚 Exemples Détaillés

### Exemple 1 : Journée Complète avec Retard

**Configuration :**
- Travail : 8h00 à 17h00
- Pause : 12h00 à 14h00
- Tolérance : 20 minutes

**Pointages de l'employé :**
- Arrivée : 8h40
- Sortie : 17h00

**Analyse :**

**Retard :**
- Limite de tolérance : 8h00 + 20 min = 8h20
- Arrivée à 8h40 : dépasse la limite de 20 minutes
- Retard enregistré : 20 minutes
- Statut : EN RETARD

**Temps de travail matin :**
- Commence à 8h40 (son arrivée réelle)
- Se termine à 12h00 (début de la pause)
- Durée : 3 heures 20 minutes

**Temps de travail après-midi :**
- Commence à 14h00 (fin de la pause)
- Se termine à 17h00 (fin de journée)
- Durée : 3 heures

**Total :** 6 heures 20 minutes de travail effectif

---

### Exemple 2 : Départ Avant la Pause

**Configuration :**
- Travail : 8h00 à 17h00
- Pause : 12h00 à 14h00

**Pointages de l'employé :**
- Arrivée : 8h00
- Sortie : 11h30

**Analyse :**

**Retard :**
- Arrivée à l'heure : 0 minute de retard
- Statut : PRÉSENT

**Temps de travail matin :**
- Commence à 8h00
- Se termine à 11h30 (son départ, avant la pause)
- Durée : 3 heures 30 minutes

**Temps de travail après-midi :**
- Aucun (parti avant la pause)
- Durée : 0 minute

**Total :** 3 heures 30 minutes de travail effectif

---

### Exemple 3 : Arrivée Pendant la Pause

**Configuration :**
- Travail : 8h00 à 17h00
- Pause : 12h00 à 14h00

**Pointages de l'employé :**
- Arrivée : 13h00
- Sortie : 17h00

**Analyse :**

**Retard :**
- Arrivée très tardive : considéré en retard
- Statut : EN RETARD

**Temps de travail matin :**
- Aucun (arrivé après le début de la pause)
- Durée : 0 minute

**Temps de travail après-midi :**
- Commence à 14h00 (fin de la pause, même s'il est arrivé à 13h00)
- Se termine à 17h00
- Durée : 3 heures

**Total :** 3 heures de travail effectif

**Note importante :** Le temps entre 13h00 et 14h00 n'est pas compté car c'est pendant la pause.

---

### Exemple 4 : Départ Pendant la Pause

**Configuration :**
- Travail : 8h00 à 17h00
- Pause : 12h00 à 14h00

**Pointages de l'employé :**
- Arrivée : 8h00
- Sortie : 13h00

**Analyse :**

**Retard :**
- Arrivée à l'heure : 0 minute de retard
- Statut : PRÉSENT (mais journée incomplète)

**Temps de travail matin :**
- Commence à 8h00
- Se termine à 12h00 (début de la pause)
- Durée : 4 heures

**Temps de travail après-midi :**
- Aucun (parti pendant la pause, avant 14h00)
- Durée : 0 minute

**Total :** 4 heures de travail effectif

**Note importante :** Le temps entre 12h00 et 13h00 n'est pas compté car c'est la pause.

---

## 🌙 Horaires de Nuit (Traversant Minuit)

### Qu'est-ce qu'un Horaire de Nuit ?

Un horaire de nuit est un horaire où l'heure de fin est inférieure à l'heure de début, ce qui signifie que le travail traverse minuit.

**Exemples :**
- 22h00 à 6h00 (travail de nuit classique)
- 20h00 à 4h00
- 23h00 à 7h00

### Comment le Système Gère ces Horaires ?

Pour éviter les confusions, le système "ajoute 24 heures" aux heures qui sont après minuit. Cela permet de faire des calculs cohérents.

### Exemple Concret

**Configuration :**
- Travail : 22h00 à 6h00
- Pause : 0h00 à 2h00

**Conversion mentale du système :**
- Début : 22h00 (reste 22h00)
- Fin : 6h00 devient 30h00 (6h00 + 24h)
- Pause début : 0h00 devient 24h00 (0h00 + 24h)
- Pause fin : 2h00 devient 26h00 (2h00 + 24h)

**Pointages de l'employé :**
- Arrivée : 23h00 (reste 23h00, avant minuit)
- Sortie : 5h00 devient 29h00 (5h00 + 24h, après minuit)

**Calcul de la durée :**
- Matin : 23h00 à 24h00 (minuit) = 1 heure
- Pause : 24h00 à 26h00 (non comptée)
- Après-midi : 26h00 à 29h00 = 3 heures
- **Total : 4 heures**

Cette technique permet au système de calculer correctement sans se soucier du passage de minuit.

---

## 🎯 Règles Importantes à Retenir

### ✅ Ce qui est Toujours Vrai

1. **Le retard n'affecte jamais la durée de travail**
   - Un employé en retard qui travaille 8h aura 8h comptabilisées
   - Le retard est noté séparément pour information

2. **La pause n'est jamais du temps de travail**
   - Même si l'employé reste sur place pendant la pause
   - Même si l'employé arrive ou part pendant la pause

3. **Les calculs se font en heure locale**
   - Peu importe où sont stockées les données
   - Les comparaisons utilisent toujours l'heure du pays

4. **Deux périodes de travail distinctes**
   - Matin : avant la pause
   - Après-midi : après la pause
   - Jamais de chevauchement avec la pause

### ❌ Erreurs de Compréhension Courantes

1. **"Le retard doit être déduit du temps de travail"**
   - FAUX : Le retard est informatif uniquement
   - Le temps de travail compte à partir de l'arrivée réelle

2. **"Si je reste pendant la pause, ça compte"**
   - FAUX : La pause n'est jamais comptée
   - Peu importe où est l'employé pendant cette période

3. **"Les heures sont en UTC dans les calculs"**
   - FAUX : Les calculs utilisent l'heure locale du pays de l'organisation
   - UTC est uniquement pour le stockage, tout le reste est automatiquement converti

4. **"Un horaire de nuit ne peut pas être calculé"**
   - FAUX : Le système gère automatiquement
   - Ajustement transparent des heures

---

## 📊 Statuts Possibles

Le système attribue automatiquement un statut à chaque journée :

| Statut | Signification | Conditions |
|--------|---------------|------------|
| **PRÉSENT** | Journée normale | Arrivée à l'heure ou dans la tolérance |
| **EN_RETARD** | Retard constaté | Arrivée après la limite de tolérance |
| **ABSENT** | Pas de pointage | Aucun pointage d'entrée enregistré |
| **INCOMPLET** | Journée partielle | Pointage d'entrée mais pas de sortie, ou sortie très anticipée |

---

## 🔍 Cas Pratique Complet

### Situation Réelle

**Organisation au Kenya (UTC+3)**

**Configuration :**
- Horaires : 15h44 à 23h42
- Pause : 18h00 à 21h42
- Tolérance : 30 minutes

**Employé Wendy Schwartz :**
- Pointage entrée : 17h48 (heure locale)
- Pointage sortie : 20h03 (heure locale)

### Analyse Complète

**1. Vérification du retard :**
- Heure de début : 15h44
- Limite de tolérance : 15h44 + 30 min = 16h14
- Arrivée : 17h48
- Dépassement : 17h48 - 16h14 = 1h34 = 94 minutes
- **Résultat : EN RETARD de 94 minutes**

**2. Calcul du temps de travail matin :**
- Début : 17h48 (son arrivée)
- Fin : 18h00 (début de la pause)
- Durée : 12 minutes

**3. Calcul du temps de travail après-midi :**
- Début théorique : 21h42 (fin de la pause)
- Sortie réelle : 20h03
- L'employé est parti **pendant** la pause (avant 21h42)
- Durée : 0 minute

**4. Résultat final :**
- Statut : EN RETARD
- Retard : 94 minutes (1h34)
- Temps de travail : 12 minutes
- Notes : "Retard: 1h34"

**Explication :** L'employé est arrivé très en retard et est parti pendant la pause. Seules les 12 minutes travaillées avant le début de la pause sont comptabilisées.

---

## 📝 Notes Finales

### Pourquoi cette Logique ?

Cette logique a été conçue pour :
- **Être juste** : Compter uniquement le temps réellement travaillé
- **Être claire** : Règles simples et prévisibles
- **Être flexible** : Gérer tous les cas de figure (nuit, pause, retard)
- **Être précise** : Calculs à la minute près

### Transparence

Tous les calculs sont enregistrés avec des notes explicatives pour que l'employé et l'employeur puissent comprendre comment le bilan a été établi.

---

## 🎯 Points Clés à Retenir

### ✅ Votre Système Maintenant
1. **Fuseau horaire automatique** : Basé sur le pays de votre organisation
2. **Serveur n'importe où** : Fonctionne même si le serveur est dans un autre pays  
3. **Calculs précis** : Toujours dans l'heure locale de votre organisation
4. **Multi-tenant intelligent** : Chaque organisation utilise son propre fuseau
5. **Stats du dashboard** : Mises à jour selon votre heure locale
6. **Marquage automatique des absents** : Déclenché à la bonne heure

### 📱 En Pratique
- **Vous aux Comoros** → Système utilise l'heure comorienne (UTC+3)
- **Organisation en France** → Système utilise l'heure française (UTC+1)  
- **Serveur aux USA** → N'affecte pas les calculs, tout reste local à votre pays

---

*Ce document explique la logique de calcul telle qu'implémentée dans le système de gestion de présence avec gestion automatique des fuseaux horaires.*

*Dernière mise à jour : 2025-11-14*
