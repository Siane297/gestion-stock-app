# 🔔 Guide d'Intégration du Système de Notifications Multi-Tenant

Ce document détaille l'implémentation d'un système de notifications temps réel, multi-tenant et persistant, conçu pour une architecture Backend Node.js/Express (Prisma) et Frontend Nuxt.js/Vue (Pinia).

---

## 🛠️ Dépendances

### Backend

Installation des dépendances nécessaires pour le temps réel et la gestion des dates :

```bash
# Dans le dossier backend
pnpm add socket.io jsonwebtoken
pnpm add -D @types/socket.io
```

### Frontend

Installation des outils pour la communication WebSocket et le formatage :

```bash
# Dans le dossier frontend
pnpm add socket.io-client date-fns
```

---

## 🏗️ Architecture Backend

### 1. Schéma de Base de Données (Prisma)

Le système utilise un schéma dédié dans PostgreSQL (multi-tenant).

**Fichier :** `backend/prisma/models/tenant/notification.prisma`

```prisma
enum TypeNotification {
  VENTE_NOUVELLE
  ACHAT_NOUVELLE_COMMANDE
  ACHAT_RECEPTION_PARTIELLE
  ACHAT_RECEPTION_COMPLETE
  STOCK_FAIBLE
  STOCK_RUPTURE
  INVENTAIRE_NOUVEAU
  INVENTAIRE_VALIDE
  SYSTEME
}

model Notification {
  id             String           @id @default(uuid())
  type           TypeNotification
  titre          String
  message        String
  reference_type String?          // ex: "vente", "achat"
  reference_id   String?          // UUID de la ressource
  metadata       Json?            // Données flexibles additionnelles

  est_lue        Boolean          @default(false)
  date_lecture   DateTime?
  date_creation  DateTime         @default(now())

  // Relations
  destinataire_id String
  destinataire    TenantUser     @relation("ReceivedNotifications", fields: [destinataire_id], references: [id])
  emetteur_id    String?
  emetteur       TenantUser?    @relation("SentNotifications", fields: [emetteur_id], references: [id])

  @@index([destinataire_id])
  @@map("notifications")
}
```

### 2. Le Moteur Temps Réel (SocketService)

Gère l'authentification JWT et les "salons" (rooms) par tenant.

- **Room Organisation :** `tenant:{schemaName}`
- **Room Individuelle :** `user:{userId}`

**Extrait :** `backend/src/services/socketService.ts`

```typescript
// Émission à tout un tenant sauf l'auteur de l'action
emitToTenantExceptUser(tenantId: string, excludeUserId: string, event: string, data: any) {
  if (!this.io) return;
  this.io.to(`tenant:${tenantId}`).except(`user:${excludeUserId}`).emit(event, data);
}
```

### 3. Logique Métier (NotificationService)

Gère la persistance et la logique d'envoi groupé.

**Méthode Clé :** `createNotificationForAllExceptEmitter`
Cette fonction crée X entrées en base de données et prépare l'envoi temps réel. Elle gère aussi la récupération dynamique des devises.

---

## 💻 Implémentation Frontend

### 1. Store Global (Pinia)

Gère l'état des notifications (liste, compteur de non-lues, chargement).

**Fichier :** `frontend/stores/notifications.ts`

- `fetchInitialData()` : Récupère les notifications et le compteur au démarrage.
- `addNotification()` : Injecte une nouvelle notification reçue via WebSocket en haut de la liste.

### 2. Composable de Connexion (useNotifications.ts)

Gère le cycle de vie de la connexion Socket.io.

```typescript
export const useNotifications = () => {
  const socket = ref<Socket | null>(null);

  const connect = () => {
    const token = accessToken.value;
    socket.value = io(uri, { auth: { token } });

    // Écoute de l'événement central
    socket.value.on("notification:new", (notif) => {
      notificationStore.addNotification(notif);
      // Optionnel : Afficher un Toast UI ou jouer un son
    });
  };

  return { connect, disconnect };
};
```

---

## 🚀 Comment déclencher une notification

### Exemple : Dans un service de vente

```typescript
// 1. Récupérer la devise (optionnel si message dynamique)
const dev = await this.notificationService.getCurrencySymbol(this.tenantId);

// 2. Enregistrer en base pour les autres
const notifications =
  await this.notificationService.createNotificationForAllExceptEmitter(
    authorId,
    {
      type: TypeNotification.VENTE_NOUVELLE,
      titre: "Nouvelle Vente",
      message: `${emetteurNom} a vendu pour ${montant} ${dev}`,
      reference_type: "vente",
      reference_id: vente.id,
    }
  );

// 3. Envoyer en temps réel via WebSocket
if (notifications.length > 0 && this.tenantId) {
  socketService.emitToTenantExceptUser(
    this.tenantId,
    authorId,
    "notification:new",
    {
      type: TypeNotification.VENTE_NOUVELLE,
      titre: "Nouvelle Vente",
      message: "...",
      reference_type: "vente",
      reference_id: vente.id,
    }
  );
}
```

---

## 📂 Liste des fichiers du module

| Fichier                                                  | Rôle                                   |
| :------------------------------------------------------- | :------------------------------------- |
| `backend/prisma/models/tenant/notification.prisma`       | Définition des tables et Enums         |
| `backend/src/services/socketService.ts`                  | WebSocket, Rooms, Authentification JWT |
| `backend/src/services/NotificationService.ts`            | CRUD Notifications, Devises dynamiques |
| `backend/src/controllers/notificationController.ts`      | Endpoints REST (Lecture, Suppression)  |
| `backend/src/routes/notificationRoutes.ts`               | Déclaration des routes API             |
| `frontend/stores/notifications.ts`                       | État Pinia centralisé                  |
| `frontend/composables/useNotifications.ts`               | Gestionnaire de client Socket.io       |
| `frontend/composables/api/useNotificationsApi.ts`        | Appels API sécurisés                   |
| `frontend/components/notifications/NotificationBell.vue` | Cloche avec badge et dropdown          |

---

## 💡 Points d'attention

1. **Authentification** : Le `tenantId` (schemaName) doit être présent dans le Payload du JWT pour que le socket rejoigne la bonne room.
2. **Multi-onglet** : Socket.io gère cela nativement, mais veillez à ce que le compteur Pinia soit synchronisé visuellement.
3. **Performance** : Les notifications sont créées par destinataire. Pour 1000 utilisateurs, préférez une file d'attente (Redis/BullMQ) si le volume est critique.
4. **Devise** : Le système utilise `prismaPublic` pour aller chercher la devise de l'organisation à partir du `schemaName`.
