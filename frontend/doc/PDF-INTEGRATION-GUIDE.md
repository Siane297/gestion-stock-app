# Guide d'Intégration de Génération PDF (Backend vers Frontend)

Ce guide documente le processus complet pour ajouter une nouvelle fonctionnalité de génération et de téléchargement de PDF dans l'application Pointage.

## 1. Backend (pointage-back)

### Étape 1.1 : Création du Template HTML

Créer un fichier `.html` dans le dossier `templates/`. Ce fichier servira de modèle pour le PDF.

- Utiliser Handlebars (`{{variable}}`) pour les données dynamiques.
- Inclure les styles CSS (généralement `styles.css`).
- Prévoir un header et un footer conditionnels.

**Exemple :** `templates/conge-list.html`

### Étape 1.2 : Création du Service PDF

Créer un service dans `src/services/pdf/` qui étend `BasePdfService`.

- Définir les interfaces pour les données.
- Implémenter une méthode statique (ex: `generateCongeList`).
- Préparer les données pour le template (conversion images en base64, formatage dates).
- Appeler `this.generatePdf()` avec le nom du template.

**Exemple :** `src/services/pdf/CongePdfService.ts`

### Étape 1.3 : Mise à jour du Contrôleur

Ajouter une méthode dans `src/controllers/pdfController.ts`.

- Vérifier le contexte tenant (`req.tenantPrisma`) et l'authentification.
- Récupérer les données via Prisma.
- Récupérer les infos de l'entreprise (`prismaPublic.company`).
- Appeler le service PDF créé à l'étape 1.2.
- Définir les headers de réponse (`Content-Type: application/pdf`, `Content-Disposition: attachment`).
- Envoyer le buffer (`res.send(pdfBuffer)`).

### Étape 1.4 : Ajout de la Route

Ajouter la route dans `src/routes/pdfRoutes.ts`.

- Utiliser `router.post`.
- Appliquer les middlewares : `pdfRateLimit`, `authenticate`, `identifyTenant`, `requireTenant`.
- Lier à la méthode du contrôleur.

---

## 2. Frontend (pointage-front)

### Étape 2.1 : Mise à jour des Types

Ajouter le nouveau type de PDF dans `types/pdf.ts`.

- Ajouter la clé dans `PDF_TYPES`.
- Le type `PdfType` sera automatiquement mis à jour.

```typescript
export const PDF_TYPES = {
  // ...
  conges: "Liste-des-Conges",
} as const;
```

### Étape 2.2 : Mise à jour du Composable

Ajouter une fonction dédiée dans `composables/useSecurePdf.ts`.

- Créer une fonction (ex: `generateCongesPdf`).
- Appeler `generatePdf` avec le type correspondant.
- Exposer la fonction dans le `return`.

```typescript
const generateCongesPdf = async (filename?: string): Promise<void> => {
  await generatePdf({
    type: "conges",
    filename,
  });
};
```

### Étape 2.3 : Mise à jour du Composant Tableau

Modifier le composant de tableau (ex: `TableConges.vue`) pour inclure le bouton de téléchargement.

- Ajouter les props : `pdfLoading` (boolean) et `pdfProgress` (number).
- Ajouter le bouton `AppButton` avec `icon="lucide:file-text"`.
- Émettre un événement (ex: `@action:download-pdf`) au clic.

### Étape 2.4 : Intégration dans la Page

Mettre à jour la page principale (ex: `pages/conge/index.vue`).

- Importer `useSecurePdf`.
- Créer les refs `pdfLoading` et `pdfProgress`.
- Créer le handler `handleDownloadPdf` qui appelle la fonction du composable.
- Passer les props et l'événement au composant tableau.

## Résumé du Flux de Données

1.  **Utilisateur** clique sur "Télécharger PDF" (Frontend).
2.  **Page** appelle `useSecurePdf`.
3.  **Composable** envoie une requête POST sécurisée à l'API (`/api/pdf/conges`).
4.  **Route Backend** vérifie les droits et appelle le contrôleur.
5.  **Contrôleur** récupère les données (Prisma) et le template.
6.  **Service PDF** génère le PDF via Puppeteer/Handlebars.
7.  **Backend** renvoie le flux binaire (Blob).
8.  **Frontend** reçoit le Blob et déclenche le téléchargement fichier.
