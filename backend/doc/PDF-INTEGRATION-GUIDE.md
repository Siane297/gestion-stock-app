# Guide d'Intégration PDF : Du Backend au Frontend 📄🚀

Ce document explique comment l'application génère, sécurise et affiche des documents PDF (Tickets de caisse, Factures Proforma, Rapports).

---

## 1. Architecture Générale

L'application utilise une approche **HTML-to-PDF** :

1.  **Backend** : Génère du HTML à partir de données réelles via **Handlebars**.
2.  **Moteur de rendu** : Utilise **Puppeteer** (Chrome Sans Tête) pour transformer ce HTML en PDF haute fidélité.
3.  **Frontend** : Récupère le PDF sous forme de **Blob** via une API sécurisée et le propose au téléchargement ou à l'impression.

---

## 2. Structure Backend (`backend/src/services/pdf/`)

### A. Le Service de Base (`BasePdfService.ts`)

C'est le cœur du système. Il gère :

- L'initialisation du navigateur Puppeteer (Singleton optimisé).
- La compilation des templates Handlebars.
- L'injection du CSS global.
- Le calcul de la hauteur dynamique (pour les tickets de caisse).
- La configuration des formats (A4 vs 80mm).

### B. Les Services Spécialisés

Chaque type de document possède son service dédié (ex: `ReceiptPdfService`, `ProformaPdfService`).

- Ils préparent les données (formatage des prix, dates, logos).
- Ils appellent `generatePdf(templateName, data, configType)`.

**Exemple de Service :**

```typescript
export class ExamplePdfService extends BasePdfService {
  public static async generate(data: any, companyInfo: any): Promise<Buffer> {
    const formattedData = {
      title: "Mon Rapport",
      items: data.map((i) => ({ name: i.nom, price: i.prix.toLocaleString() })),
      logo: await this.getLocalLogo("logo-2.png"), // Helper pour Base64
    };
    return this.generatePdf("template-name", formattedData, "portrait-a4");
  }
}
```

### C. Les Templates (`backend/templates/`)

Fichiers `.html` utilisant la syntaxe Handlebars `{{variable}}`.

- Les styles sont définis dans `styles.css`.
- Les images (logos) doivent être converties en **Base64** dans le service avant d'être envoyées au template pour garantir leur affichage sans accès réseau externe.

### D. Le Contrôleur (`pdfController.ts`)

Expose les endpoints API. Il s'assure de :

1. Vérifier l'authentification et le contexte Tenant.
2. Récupérer les données depuis Prisma.
3. Envoyer le buffer PDF avec les headers appropriés :
   - `Content-Type: application/pdf`
   - `Content-Disposition: attachment; filename="nom.pdf"`

**Exemple de Contrôleur :**

```typescript
public static async generateExamplePdf(req: Request, res: Response) {
  const data = await req.tenantPrisma.item.findMany();
  const pdfBuffer = await ExamplePdfService.generate(data, companyInfo);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport.pdf"');
  res.send(pdfBuffer);
}
```

---

## 3. Consommation Frontend (`frontend/composables/useSecurePdf.ts`)

Le frontend utilise un composable dédié pour simplifier l'utilisation.

### Flux de téléchargement :

1. Appel de l'API avec `responseType: 'blob'`.
2. Création d'une URL temporaire : `window.URL.createObjectURL(blob)`.
3. Création d'un lien `<a>` invisible pour déclencher le téléchargement navigateur.
4. Nettoyage de l'URL pour libérer la mémoire.

```typescript
const generateProformaPdf = async (venteId: string) => {
  const response = await fetch(`${apiBase}/api/ventes/${venteId}/proforma`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await response.blob();
  // Téléchargement automatique...
};
```

---

## 4. Comment ajouter un nouveau PDF ?

1.  **Template** : Créer un fichier `.html` dans `backend/templates/`.
2.  **Config** : Ajouter une configuration (format, marges) dans `BasePdfService.ts` si nécessaire.
3.  **Service** : Créer un nouveau service PDF pour formater les données.
4.  **Route** : Ajouter un controller et une route dans le backend.
5.  **Frontend** : Ajouter une méthode dans `useSecurePdf.ts` pour appeler l'API.

---

## 5. Optimisations et Sécurité

- **Vitesse** : Le navigateur Puppeteer est maintenu ouvert (pool) pour éviter le coût de lancement à chaque PDF.
- **Sécurité** : Les requêtes Puppeteer sont interceptées pour interdire tout accès réseau externe lors du rendu (prévention XSS/SSRF).
- **Isolation** : Chaque PDF est généré dans un contexte de page vierge.
- **Poids** : Les polices sont limitées aux polices système standards pour réduire la taille des fichiers.
