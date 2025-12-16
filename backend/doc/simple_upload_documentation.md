# Documentation: Upload de Fichiers (Stockage Local)

Cette documentation explique la logique technique mise en place pour gérer l'upload d'images (Produits et Conditionnements) sans utiliser de service tiers (comme Google Drive), en stockant les fichiers directement sur le serveur.

## 1. Configuration Multer (`uploadConfig.ts`)

Nous utilisons le middleware **Multer** pour intercepter les fichiers entrants dans les requêtes HTTP `multipart/form-data`.

### Stockage Dynamique

Le stockage est configuré pour organiser les images par **Entreprise (Tenant)**, afin d'éviter les mélanges entre les différents utilisateurs du système.

```typescript
// backend/src/config/uploadConfig.ts

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 1. Récupération du nom de la compagnie (via middleware d'auth ou header)
    const companyName = req.companyName || "default";

    // 2. Construction du chemin dossier
    // Structure: uploads/images/[NOM_COMPAGNIE]/products/
    const uploadPath = path.join(
      __dirname,
      "../../uploads/images",
      companyName,
      "products"
    );

    // 3. Création automatique du dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 4. Renommage sécurisé du fichier
    // On garde l'extension, on nettoie le nom original et on ajoute un timestamp pour l'unicité
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const ext = path.extname(originalName);
    const filename = `product-${Date.now()}-${path.basename(
      originalName,
      ext
    )}${ext}`;
    cb(null, filename);
  },
});
```

### Validation

- **Types acceptés** : `.png`, `.jpg`, `.jpeg`, `.gif`.
- **Taille Max** : 10 Mo.

## 2. Routeur (`produitRoutes.ts`)

Les routes d'ajout et de modification utilisent `uploadProductImage.any()` pour accepter un nombre indéfini de fichiers (image principale + N images de conditionnements).

```typescript
router.post("/", attachCompanyName, uploadProductImage.any(), createProduit);
router.put("/:id", attachCompanyName, uploadProductImage.any(), updateProduit);
```

## 3. Contrôleur (`produitController.ts`)

C'est ici que se fait le lien entre le fichier physique reçu et la donnée en base.

### Logique d'Association

Le frontend envoie les fichiers avec des clés spécifiques dans le `FormData` :

- `image` : Image principale du produit.
- `cond_img_0`, `cond_img_1`, etc. : Images des conditionnements.

Le contrôleur itère sur les fichiers reçus (`req.files`) et les associe aux objets correspondants.

```typescript
// Extrait simplifié de createProduit / updateProduit

// 1. Gestion de l'image principale
if (files) {
  const mainImage = files.find((f) => f.fieldname === "image");
  if (mainImage) {
    productData.image_url = `/uploads/images/${companyName}/products/${mainImage.filename}`;
    productData.image_id = mainImage.filename;
  }
}

// 2. Gestion des images de conditionnements
// Le frontend envoie une propriété temporaire 'image_key' dans l'objet conditionnement (JSON)
// qui correspond au 'fieldname' du fichier envoyé.
if (productData.conditionnements) {
  productData.conditionnements.forEach((cond: any) => {
    if (cond.image_key) {
      // On cherche le fichier qui a ce fieldname (ex: 'cond_img_0')
      const file = files.find((f) => f.fieldname === cond.image_key);
      if (file) {
        // On met à jour l'URL et l'ID dans l'objet à sauvegarder
        cond.image_url = `/uploads/images/${companyName}/products/${file.filename}`;
        cond.image_id = file.filename;

        // On retire la clé temporaire
        delete cond.image_key;
      }
    }
  });
}
```

## 4. Flux de Données Complet

1.  **Frontend** : L'utilisateur sélectionne des images.
2.  **Frontend** : Au submit, construction d'un `FormData`.
    - Les données textuelles (produit + liste conditionnements) sont stringifiées.
    - Les fichiers sont appendés un par un.
3.  **Backend (Multer)** : Reçoit la requête, sauvegarde physiquement les fichiers dans `uploads/images/...`.
4.  **Backend (Controller)** :
    - Parse le JSON.
    - Retrouve les noms de fichiers générés par Multer.
    - Construit les URLs relatives (`/uploads/...`).
5.  **Base de Données** : Sauvegarde le produit avec ces URLs.
6.  **Frontend (Affichage)** : Utilise `getFullImageUrl` pour préfixer l'URL relative avec l'adresse du serveur (API URL) afin d'afficher l'image.

Cette approche est robuste, performante pour les volumes modérés, et garde les données cloisonnées par entreprise.

## 5. Implémentation Frontend (`Vue.js`)

La partie frontend est responsable de la collecte des fichiers et de la structuration de la requête `multipart/form-data`.

### A. Déclaration du Champ Image

Dans la définition des champs (`productFields`), nous utilisons un type `image` spécifique qui est géré par le composant `ImageUploadField`.

```typescript
// frontend/pages/produits/ajouter/index.vue (ou modifier/[id].vue)

const productFields = computed(() => [
  {
    name: "image",
    label: "Image du produit",
    type: "image", // Type spécial traité par FormulaireDynamique
    required: false,
    placeholder: "Ajouter une image",
    acceptedFormats: "image/png,image/jpeg,image/jpg,image/webp",
    maxSize: 5,
  },
  // ... autres champs
]);
```

### B. Gestion de la Soumission (`handleSubmit`)

Lors de la soumission du formulaire, nous devons séparer les données JSON des fichiers binaires pour construire correctement l'objet `FormData`.

**1. Récupération des fichiers**
Le composant `FormulaireDynamique` nous renvoie un objet `data.$files` contenant les fichiers sélectionnés par l'utilisateur.

**2. Gestion des Conditionnements**
Pour les images liées aux conditionnements (sous-liste), nous devons :

1.  Itérer sur chaque conditionnement.
2.  Vérifier s'il a une propriété `image_file` (ajoutée par le composant `ConditionnementField`).
3.  Si oui, créer une clé unique (ex: `cond_img_0`) pour ce fichier.
4.  Créer une référence (`image_key`) dans l'objet JSON du conditionnement pour que le backend puisse faire le lien.

```typescript
// Extrait de handleSubmit

const handleSubmit = async (data: Record<string, any>) => {
  // ... préparation du payload principal (produitPayload) ...

  // Récupération des fichiers bruts
  const files = data.$files as Record<string, File> | undefined;
  const mainImageFile = files?.["image"];

  // Détection des fichiers de conditionnements
  const conditionnementFiles: { file: File; index: number; key: string }[] = [];

  if (produitPayload.conditionnements) {
    produitPayload.conditionnements.forEach((c: any, index: number) => {
      // On récupère l'objet original qui contient le fichier (input)
      const originalItem = data.conditionnements[index];
      if (originalItem && originalItem.image_file) {
        // Création d'une clé unique
        const key = `cond_img_${index}`;

        // Stockage temporaire du fichier à uploader
        conditionnementFiles.push({
          file: originalItem.image_file,
          index: index,
          key: key,
        });

        // Marquage de l'objet JSON pour le backend
        c.image_key = key;
      }
    });
  }

  // Construction du FormData final
  let payloadToSend: any = produitPayload;

  if (mainImageFile || conditionnementFiles.length > 0) {
    const formData = new FormData();

    // Ajout de toutes les propriétés JSON (sauf conditionnements qu'on doit traiter à part parfois,
    // ou ici tout est stringifié si c'est un FormData)
    Object.entries(produitPayload).forEach(([key, value]) => {
      if (key === "conditionnements") {
        formData.append(key, JSON.stringify(value)); // Le tableau est converti en string
      } else {
        formData.append(key, String(value));
      }
    });

    // Ajout de l'image principale
    if (mainImageFile) {
      formData.append("image", mainImageFile);
    }

    // Ajout des images de conditionnements avec leurs clés dynamiques
    conditionnementFiles.forEach((cf) => {
      formData.append(cf.key, cf.file);
    });

    payloadToSend = formData;
  }

  // Envoi à l'API via useProduitApi -> useSecureApi (qui détecte FormData et ajuste les headers)
  await createProduit(payloadToSend);
};
```

### C. Points Clés

- **FormData** : Indispensable pour envoyer des fichiers. Le Browser définit automatiquement le `Content-Type: multipart/form-data; boundary=...`.
- **Stringify JSON** : Dans un `FormData`, on ne peut pas envoyer d'objets ou tableaux imbriqués directement. On les convertit souvent en chaîne JSON (`JSON.stringify(conditionnements)`).
- **Mapping par Clé** : L'astuce `image_key` permet de résoudre le problème d'association "quel fichier va avec quel sous-objet" côté serveur.
