# Guide de Migration - BilanPresence

## 🎯 Objectif
Restructurer l'application pour stocker les bilans de présence dans une table dédiée `bilans_presence` au lieu de calculer dynamiquement à partir de `attendances`.

## 📊 Changements Principaux

### 1. Nouvelle Table `BilanPresence`
- Stocke le résumé journalier de chaque employé
- Statuts: `A_L_HEURE`, `EN_RETARD`, `ABSENT`, `INCOMPLET`
- Calculé automatiquement à chaque pointage

### 2. Table `Attendance` Simplifiée
- Suppression des champs `statut` et `dureeTravailMinutes`
- Stocke uniquement les pointages bruts (ENTREE/SORTIE)
- Type `ABSENCE` supprimé (géré dans BilanPresence)

### 3. Nouveaux Endpoints

#### 📍 `/api/bilans/historique` (GET)
Remplace `/api/historique`
```
Query params:
- page, limit
- startDate, endDate
- employeeId
- statut (A_L_HEURE, EN_RETARD, ABSENT, INCOMPLET)
```

#### 📍 `/api/bilans/marquer-absents` (POST)
Marque les employés sans pointage comme absents

## 🚀 Étapes de Migration

### Backend

```bash
cd backend

# 1. Générer le client Prisma
npx prisma generate

# 2. Créer et appliquer la migration
npx prisma migrate dev --name add_bilan_presence

# 3. Redémarrer le serveur
npm run dev
```

### Frontend

Modifier `/composables/api/useHistoriqueApi.ts`:

```typescript
// AVANT
export const useHistoriqueApi = () => {
  const baseURL = API_CONFIG.baseURL;
  
  const getHistorique = async (params?: { /* ... */ }) => {
    return await $fetch('/api/historique', { /* ... */ });
  };
};

// APRÈS
export const useBilanPresenceApi = () => {
  const baseURL = API_CONFIG.baseURL;
  
  const getHistorique = async (params?: { /* ... */ }) => {
    return await $fetch('/api/bilans/historique', { /* ... */ });
  };
};
```

## 🔄 Flux de Données

### Avant
```
Pointage ENTREE/SORTIE 
  → Stocké dans attendance avec statut/durée
  → Calcul dynamique pour historique
```

### Après
```
Pointage ENTREE/SORTIE
  → Stocké dans attendance (données brutes)
  → Création/MAJ automatique du bilan dans bilan_presence
  → Historique lit directement bilan_presence
```

## ✅ Avantages

1. **Performance**: Pas de calcul à la volée
2. **Simplicité**: Données pré-calculées
3. **Fiabilité**: Un seul bilan par employé/jour
4. **Filtrage**: SQL natif sur les statuts
5. **Historique permanent**: Les bilans ne changent pas

## 🎨 Statuts

- **A_L_HEURE**: Entrée dans les horaires
- **EN_RETARD**: Entrée après tolérance
- **ABSENT**: Aucun pointage
- **INCOMPLET**: Entrée sans sortie

## 📝 Notes

- Les données existantes dans `attendance` resteront (pour historique)
- Les nouveaux pointages créeront automatiquement des bilans
- La page `/historique` utilise maintenant les bilans
- La page `/pointage` utilise toujours attendance (ENTREE/SORTIE uniquement)
