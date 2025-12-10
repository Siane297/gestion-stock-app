# Documentation API - Endpoints

## 🌐 Base URL

- **Développement** : `http://localhost:3001`
- **Production** : À configurer

## 🔐 Authentification

La plupart des endpoints nécessitent un token JWT dans le header :

```http
Authorization: Bearer <token>
```

---

## 📍 Endpoints Utilitaires

### GET / - Informations API
**Accès** : Public

**Description** : Retourne les informations générales de l'API

**Réponse** :
```json
{
  "success": true,
  "message": "API de Gestion de Présence - Backend",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "employees": "/api/employees",
    "attendance": "/api/attendance",
    "stats": "/api/stats",
    "health": "/health"
  }
}
```

### GET /health - Health Check
**Accès** : Public

**Description** : Vérifie l'état du serveur

**Réponse** :
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-03T14:55:07.557Z"
}
```

---

## 👥 Employés - /api/employees

### GET /api/employees - Liste des employés
**Accès** : Authentifié

**Query Parameters** :
- `page` (number, default: 1) - Numéro de page
- `limit` (number, default: 10) - Résultats par page
- `search` (string) - Recherche par nom/matricule/email
- `department` (string) - Filtrer par département
- `isActive` (boolean, default: true) - Employés actifs/inactifs

**Exemple** :
```http
GET /api/employees?page=1&limit=10&search=Jean&department=IT
```

**Réponse** :
```json
{
  "success": true,
  "message": "Employés récupérés avec succès",
  "data": {
    "employees": [
      {
        "id": "uuid",
        "matricule": "EMP001",
        "fullName": "Jean Dupont",
        "email": "jean@example.com",
        "position": "Développeur",
        "department": "IT",
        "phoneNumber": "+33612345678",
        "qrCode": "uuid-qr-code",
        "isActive": true,
        "createdAt": "2025-11-03T10:00:00.000Z",
        "attendances": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### GET /api/employees/:id - Détails d'un employé
**Accès** : Authentifié

**Paramètres** :
- `id` (UUID) - ID de l'employé

**Réponse** :
```json
{
  "success": true,
  "message": "Employé récupéré avec succès",
  "data": {
    "id": "uuid",
    "matricule": "EMP001",
    "fullName": "Jean Dupont",
    "email": "jean@example.com",
    "position": "Développeur",
    "department": "IT",
    "phoneNumber": "+33612345678",
    "qrCode": "uuid-qr-code",
    "isActive": true,
    "hireDate": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-11-03T10:00:00.000Z",
    "attendances": [
      {
        "id": "uuid",
        "type": "ENTRY",
        "timestamp": "2025-11-03T08:00:00.000Z"
      }
    ]
  }
}
```

**Erreurs** :
- `404` : Employé non trouvé

### GET /api/employees/qr/:qrCode - Recherche par QR code
**Accès** : Public (pour le scan)

**Paramètres** :
- `qrCode` (string) - Code QR de l'employé

**Exemple** :
```http
GET /api/employees/qr/550e8400-e29b-41d4-a716-446655440000
```

**Réponse** :
```json
{
  "success": true,
  "message": "Employé trouvé",
  "data": {
    "id": "uuid",
    "matricule": "EMP001",
    "fullName": "Jean Dupont",
    "position": "Développeur",
    "department": "IT",
    "qrCode": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": true
  }
}
```

**Erreurs** :
- `404` : QR code invalide ou employé non trouvé
- `400` : Employé inactif

### POST /api/employees - Créer un employé
**Accès** : ADMIN ou MANAGER

**Body** :
```json
{
  "matricule": "EMP001",
  "fullName": "Jean Dupont",
  "email": "jean@example.com",
  "position": "Développeur",
  "department": "IT",
  "phoneNumber": "+33612345678",
  "address": "123 Rue Example, Paris"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Employé créé avec succès",
  "data": {
    "id": "uuid",
    "matricule": "EMP001",
    "fullName": "Jean Dupont",
    "qrCode": "uuid-generated",
    "isActive": true,
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

**Erreurs** :
- `400` : Matricule ou email déjà existant
- `401` : Non authentifié
- `403` : Permissions insuffisantes

### PUT /api/employees/:id - Modifier un employé
**Accès** : ADMIN ou MANAGER

**Body** (tous les champs optionnels) :
```json
{
  "fullName": "Jean Dupont",
  "email": "nouveau@example.com",
  "position": "Senior Développeur",
  "department": "IT",
  "phoneNumber": "+33612345678",
  "address": "Nouvelle adresse",
  "isActive": true
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Employé mis à jour avec succès",
  "data": {
    "id": "uuid",
    "matricule": "EMP001",
    "fullName": "Jean Dupont",
    "updatedAt": "2025-11-03T11:00:00.000Z"
  }
}
```

**Erreurs** :
- `404` : Employé non trouvé
- `400` : Email déjà utilisé
- `403` : Permissions insuffisantes

### DELETE /api/employees/:id - Supprimer un employé
**Accès** : ADMIN uniquement

**Description** : Soft delete (marque comme inactif)

**Réponse** :
```json
{
  "success": true,
  "message": "Employé supprimé avec succès"
}
```

**Erreurs** :
- `404` : Employé non trouvé
- `403` : Permissions insuffisantes (non ADMIN)

---

## ⏰ Pointages - /api/attendance

### POST /api/attendance/scan - Pointage via QR code
**Accès** : Public (pour les terminaux de scan)

**Body** :
```json
{
  "qrCode": "uuid-qr-code",
  "type": "ENTRY",
  "location": "Bureau Principal",
  "notes": "Arrivée normale"
}
```

**Champs** :
- `qrCode` (string, required) - Code QR scanné
- `type` (enum, required) - "ENTRY" ou "EXIT"
- `location` (string, optional) - Lieu du pointage
- `notes` (string, optional) - Notes additionnelles

**Réponse** :
```json
{
  "success": true,
  "message": "Pointage enregistré avec succès",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "type": "ENTRY",
    "timestamp": "2025-11-03T08:00:00.000Z",
    "location": "Bureau Principal",
    "employee": {
      "fullName": "Jean Dupont",
      "matricule": "EMP001",
      "department": "IT"
    }
  }
}
```

**Erreurs** :
- `404` : QR code invalide
- `400` : Employé inactif

### GET /api/attendance - Liste des pointages
**Accès** : Authentifié

**Query Parameters** :
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `employeeId` (UUID) - Filtrer par employé
- `startDate` (ISO date) - Date début
- `endDate` (ISO date) - Date fin
- `type` (enum) - "ENTRY" ou "EXIT"

**Exemple** :
```http
GET /api/attendance?employeeId=uuid&startDate=2025-11-01&endDate=2025-11-30&type=ENTRY
```

**Réponse** :
```json
{
  "success": true,
  "message": "Pointages récupérés avec succès",
  "data": {
    "attendances": [
      {
        "id": "uuid",
        "type": "ENTRY",
        "timestamp": "2025-11-03T08:00:00.000Z",
        "location": "Bureau Principal",
        "employee": {
          "fullName": "Jean Dupont",
          "matricule": "EMP001"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### POST /api/attendance - Créer un pointage manuel
**Accès** : Authentifié

**Body** :
```json
{
  "employeeId": "uuid",
  "type": "ENTRY",
  "location": "Bureau Principal",
  "notes": "Pointage manuel"
}
```

**Réponse** : Identique à `/scan`

**Erreurs** :
- `404` : Employé non trouvé
- `400` : Employé inactif

### GET /api/attendance/employee/:employeeId/date/:date - Pointages d'un jour
**Accès** : Authentifié

**Paramètres** :
- `employeeId` (UUID) - ID de l'employé
- `date` (YYYY-MM-DD) - Date à consulter

**Exemple** :
```http
GET /api/attendance/employee/uuid/date/2025-11-03
```

**Réponse** :
```json
{
  "success": true,
  "message": "Pointages de la journée récupérés",
  "data": [
    {
      "id": "uuid",
      "type": "ENTRY",
      "timestamp": "2025-11-03T08:00:00.000Z",
      "location": "Bureau Principal"
    },
    {
      "id": "uuid",
      "type": "EXIT",
      "timestamp": "2025-11-03T17:00:00.000Z",
      "location": "Bureau Principal"
    }
  ]
}
```

---

## 🔑 Authentification - /api/auth

### POST /api/auth/register - Inscription
**Accès** : Public

**Description** : Crée un nouveau compte utilisateur

**Body** :
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jean@example.com",
      "name": "Jean Dupont",
      "role": "USER"
    }
  }
}
```

**Notes** :
- Le mot de passe est hashé avec bcrypt (10 rounds)
- Un cookie `auth_token` est automatiquement défini (httpOnly, 7 jours)
- Le premier utilisateur peut être défini comme ADMIN manuellement

**Erreurs** :
- `400` : Email déjà utilisé
- `400` : Champs manquants

### POST /api/auth/login - Connexion
**Accès** : Public

**Description** : Authentifie un utilisateur et définit un cookie JWT

**Body** :
```json
{
  "email": "jean@example.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jean@example.com",
      "name": "Jean Dupont",
      "role": "USER"
    }
  }
}
```

**Notes** :
- Un cookie `auth_token` est défini automatiquement
- Le cookie est httpOnly (non accessible en JavaScript)
- Durée de validité : 7 jours

**Erreurs** :
- `401` : Email ou mot de passe incorrect
- `400` : Champs manquants

### POST /api/auth/logout - Déconnexion
**Accès** : Public

**Description** : Supprime le cookie d'authentification

**Réponse** :
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### GET /api/auth/me - Utilisateur connecté
**Accès** : Authentifié (cookie JWT requis)

**Description** : Retourne les informations de l'utilisateur connecté

**Réponse** :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "jean@example.com",
      "name": "Jean Dupont",
      "role": "USER",
      "image": null,
      "createdAt": "2025-11-04T10:00:00.000Z"
    }
  }
}
```

**Erreurs** :
- `401` : Non authentifié (cookie manquant ou invalide)
- `404` : Utilisateur non trouvé

**Exemple cURL** :
```bash
# Connexion et sauvegarde du cookie
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"jean@example.com","password":"password123"}'

# Utiliser le cookie pour accéder à /me
curl http://localhost:3001/api/auth/me \
  -b cookies.txt
```

---

## 📊 Statistiques - /api/stats

### GET /api/stats/dashboard - Statistiques tableau de bord
**Accès** : Authentifié

**Status** : À implémenter

**Réponse prévue** :
```json
{
  "success": true,
  "data": {
    "totalEmployees": 50,
    "presentToday": 45,
    "totalEntries": 1500,
    "totalExits": 1450,
    "averageWorkingHours": 8.5
  }
}
```

---

## ❌ Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Permissions insuffisantes |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

## 📝 Format de réponse standard

### Succès
```json
{
  "success": true,
  "message": "Description du succès",
  "data": { ... }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "stack": "..." // En développement seulement
}
```

---

## 🧪 Tests avec cURL

### Créer un employé
```bash
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "matricule": "EMP001",
    "fullName": "Jean Dupont",
    "email": "jean@example.com",
    "position": "Développeur",
    "department": "IT"
  }'
```

### Pointage via QR
```bash
curl -X POST http://localhost:3001/api/attendance/scan \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "uuid-qr-code",
    "type": "ENTRY"
  }'
```

### Liste des employés
```bash
curl http://localhost:3001/api/employees?page=1&limit=10 \
  -H "Authorization: Bearer <token>"
```

---

Cette documentation couvre tous les endpoints actuellement implémentés et prévus pour l'API de gestion de présence.
