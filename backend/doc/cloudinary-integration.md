# 📚 Guide d'intégration Cloudinary

Guide complet pour intégrer Cloudinary dans une application Node.js + Nuxt.js afin de résoudre les problèmes de stockage éphémère sur les plateformes cloud (Render, Heroku, Railway, etc.).

---

## 🎯 Pourquoi Cloudinary ?

### Le problème : Stockage éphémère

Les plateformes cloud modernes (Render, Heroku, Railway) utilisent un **système de fichiers éphémère** :

- ❌ Les fichiers uploadés dans `/uploads` sont **perdus à chaque redéploiement**
- ❌ Chaque déploiement crée un nouveau conteneur
- ❌ Les fichiers uploadés en local ne sont pas synchronisés en production

### La solution : Cloudinary

- ✅ Stockage cloud permanent
- ✅ CDN mondial (images rapides)
- ✅ Gratuit jusqu'à 25 GB/mois + 25k transformations
- ✅ Transformations d'images automatiques
- ✅ Dashboard de gestion

---

## 📋 Prérequis

1. Créer un compte Cloudinary : https://cloudinary.com/users/register_free
2. Récupérer vos credentials depuis le dashboard :
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 🚀 Installation Backend (Node.js)

### 1. Installer le package Cloudinary

```bash
npm install cloudinary
```

### 2. Configuration des variables d'environnement

Ajouter dans `.env` :

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

Ajouter dans `.env.example` :

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret_here
```

### 3. Créer le service Cloudinary

Créer `src/services/CloudinaryService.ts` :

````typescript
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";

/**
 * Service pour gérer les uploads d'images vers Cloudinary
 */
export class CloudinaryService {
  private static isConfigured = false;

  /**
   * Configurer Cloudinary avec les credentials
   */
  private static configure() {
    if (this.isConfigured) return;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    this.isConfigured = true;
    console.log("☁️ [Cloudinary] Configuré avec succès");
  }

  /**
   * Uploader une image vers Cloudinary
   * @param filePath - Chemin local du fichier
   * @param folder - Dossier dans Cloudinary (ex: 'logos', 'avatars')
   * @param publicId - ID public optionnel
   */
  static async uploadImage(
    filePath: string,
    folder: string,
    publicId?: string
  ): Promise<UploadApiResponse> {
    this.configure();

    try {
      console.log(`📤 [Cloudinary] Upload vers le dossier: ${folder}`);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `votre-app/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      console.log(`✅ [Cloudinary] Image uploadée: ${result.secure_url}`);
      return result;
    } catch (error) {
      console.error("❌ [Cloudinary] Erreur upload:", error);
      throw new Error("Erreur lors de l'upload vers Cloudinary");
    }
  }

  /**
   * Supprimer une image de Cloudinary
   * @param publicId - ID public de l'image
   */
  static async deleteImage(publicId: string): Promise<void> {
    this.configure();

    try {
      console.log(`🗑️ [Cloudinary] Suppression de: ${publicId}`);

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });

      console.log(`✅ [Cloudinary] Image supprimée`);
    } catch (error) {
      console.error("❌ [Cloudinary] Erreur suppression:", error);
      throw new Error("Erreur lors de la suppression sur Cloudinary");
    }
  }


**Exemple pour `uploadCompanyLogo` :**

```typescript
import { CloudinaryService } from "../services/CloudinaryService.js";

export const uploadCompanyLogo = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Données manquantes",
      });
    }

    const { prismaPublic } = await import("../services/tenantService.js");

    // Récupérer l'ancienne compagnie
    const oldCompany = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { logo: true, name: true },
    });

    // Supprimer l'ancien logo de Cloudinary s'il existe
    if (oldCompany?.logo) {
      try {
        const publicId = CloudinaryService.extractPublicId(oldCompany.logo);
        await CloudinaryService.deleteImage(publicId);
      } catch (error) {
        logger.warn("Impossible de supprimer l'ancien logo:", error);
      }
    }

    // Upload vers Cloudinary
    const companyName = oldCompany?.name || "default";
    const publicId = `${companyName}-logo-${Date.now()}`;

    const result = await CloudinaryService.uploadImage(
      req.file.path,
      "logos",
      publicId
    );

    // Mettre à jour la base de données avec l'URL Cloudinary
    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: { logo: result.secure_url },
    });

    res.json({
      success: true,
      message: "Logo uploadé avec succès",
      data: {
        logo: result.secure_url,
        company: updatedCompany,
      },
    });
  } catch (error) {
    logger.error("Erreur lors de l'upload du logo:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'upload du logo",
    });
  }
};
````

**Et pour `deleteCompanyLogo` :**

```typescript
export const deleteCompanyLogo = async (req: Request, res: Response) => {
  try {
    const tenantId = req.companyId;
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Tenant ID manquant",
      });
    }

    const { prismaPublic } = await import("../services/tenantService.js");

    const company = await prismaPublic.company.findUnique({
      where: { id: tenantId },
      select: { logo: true },
    });

    if (!company?.logo) {
      return res.status(404).json({
        success: false,
        message: "Aucun logo à supprimer",
      });
    }

    // Supprimer de Cloudinary
    const publicId = CloudinaryService.extractPublicId(company.logo);
    await CloudinaryService.deleteImage(publicId);

    // Mettre à jour la base de données
    const updatedCompany = await prismaPublic.company.update({
      where: { id: tenantId },
      data: { logo: null },
    });

    res.json({
      success: true,
      message: "Logo supprimé avec succès",
      data: updatedCompany,
    });
  } catch (error) {
    logger.error("Erreur lors de la suppression du logo:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression du logo",
    });
  }
};
```

### 5. Adapter les services PDF (si applicable)

Si vous utilisez des images dans la génération de PDFs, vous devez gérer les deux types d'URLs (Cloudinary et ancien système).

**Dans chaque service PDF, modifier `convertToBase64` :**

```typescript
const convertToBase64 = async (
  relativePath?: string
): Promise<string | undefined> => {
  if (!relativePath) return undefined;

  try {
    let imageBuffer: Buffer;

    // Vérifier si c'est une URL complète (Cloudinary)
    if (
      relativePath.startsWith("http://") ||
      relativePath.startsWith("https://")
    ) {
      console.log(`🌐 [PDF] Téléchargement depuis Cloudinary: ${relativePath}`);
      const response = await fetch(relativePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      // Chemin relatif - essayer de lire localement puis via API
      const fs = await import("fs/promises");
      let basePath = process.cwd();

      if (basePath.endsWith("/src") || basePath.endsWith("\\src")) {
        basePath = path.dirname(basePath);
      }

      const absolutePath = path.join(basePath, relativePath);

      try {
        imageBuffer = await fs.readFile(absolutePath);
      } catch (fsError) {
        const baseUrl = process.env.API_BASE_URL || "http://localhost:3001";
        const imageUrl = `${baseUrl}/${relativePath}`;
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
    }

    // Déterminer le type MIME et convertir en base64
    const ext = path.extname(relativePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
    };
    const mimeType = mimeTypes[ext] || "image/png";
    const base64 = imageBuffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`⚠️ [PDF] Erreur conversion image (${relativePath}):`, error);
    return undefined;
  }
};
```

---

## 🎨 Intégration Frontend (Nuxt.js / Vue.js)

### 1. Créer une fonction helper pour les URLs

**Dans vos composables ou dans chaque composant :**

```typescript
/**
 * Fonction helper pour construire l'URL de l'image (Cloudinary ou locale)
 */
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "";

  // Si l'URL commence par http:// ou https://, c'est une URL Cloudinary complète
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Sinon, c'est un chemin relatif (ancien système), ajouter apiBase
  const config = useRuntimeConfig();
  return `${config.public.apiBase}/${imagePath}`;
};
```

### 2. Utiliser la fonction dans les composants

**Exemple dans un formulaire d'organisation :**

```vue
<script setup>
const company = ref(null);
const { uploadCompanyLogo } = useCompanyImageApi();

const companyFields = computed(() => [
  {
    name: "logo",
    label: "Logo de l'organisation",
    type: "image",
    value: getImageUrl(company.value?.logo),
    onImageUpload: async (file: File) => {
      try {
        const response = await uploadCompanyLogo(file);
        if (response.success && response.data?.logo) {
          company.value.logo = response.data.logo;
          return getImageUrl(response.data.logo);
        }
        throw new Error("Erreur lors de l'upload");
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
]);
</script>
```

**Exemple dans un composant Badge :**

```vue
<template>
  <div class="badge">
    <img v-if="companyLogo" :src="companyLogo" alt="Logo" />
  </div>
</template>

<script setup>
const { getCurrentCompany } = useCompanyApi();
const companyLogo = ref("");

onMounted(async () => {
  const company = await getCurrentCompany();
  if (company) {
    companyLogo.value = getImageUrl(company.logo);
  }
});
</script>
```

---

## 🔧 Configuration en Production (Render)

### 1. Ajouter les variables d'environnement

Dans le dashboard Render → Environment → Add :

```
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 2. Redéployer l'application

```bash
git add .
git commit -m "feat: Cloudinary integration for permanent image storage"
git push
```

### 3. Re-uploader les images

> [!IMPORTANT]
> Après le premier déploiement avec Cloudinary, les utilisateurs devront **re-uploader leurs images** une seule fois. Les anciennes images locales ne seront pas automatiquement migrées.

---

## ✅ Tests et Vérification

### En développement

1. **Tester l'upload d'une image**

   - Uploader une image via l'interface
   - Vérifier dans Cloudinary Dashboard → Media Library
   - L'image doit apparaître dans le dossier configuré

2. **Tester la suppression**

   - Supprimer l'image via l'interface
   - Vérifier qu'elle disparaît de Cloudinary

3. **Tester l'affichage**
   - L'image doit s'afficher correctement dans l'interface
   - Vérifier l'URL dans la console (doit commencer par `https://res.cloudinary.com/`)

### En production

1. **Upload et redéploiement**

   - Uploader une image en production
   - Faire un redéploiement
   - ✅ L'image doit **toujours être présente** après le redéploiement

2. **Génération de PDFs** (si applicable)
   - Générer un PDF avec l'image
   - L'image doit apparaître correctement dans le PDF

---

## 🐛 Dépannage

### Problème : Images ne s'affichent pas

**Solution :** Vérifier que la fonction `getImageUrl()` est utilisée partout où les URLs d'images sont construites.

### Problème : Erreur "API_SECRET non défini"

**Solution :** Vérifier que les variables d'environnement Cloudinary sont bien configurées dans `.env` (dev) et sur Render (production).

### Problème : Images perdues après redéploiement

**Solution :** Les images locales dans `/uploads` ne migrent pas automatiquement. Re-uploader les images via l'interface pour qu'elles soient stockées sur Cloudinary.

### Problème : Erreur lors de la suppression

**Solution :** Vérifier que la fonction `extractPublicId()` extrait correctement le public_id de l'URL Cloudinary.

---

## 📊 Limites du plan gratuit Cloudinary

- ✅ 25 GB de stockage
- ✅ 25 000 transformations/mois
- ✅ 25 crédits/mois (bandwidth)
- ✅ CDN gratuit

Pour la plupart des applications, le plan gratuit est largement suffisant.

---

## 🔗 Ressources

- [Documentation Cloudinary](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Dashboard Cloudinary](https://console.cloudinary.com)

---

## 📝 Checklist d'intégration

- [ ] Créer un compte Cloudinary
- [ ] Récupérer les credentials (Cloud Name, API Key, API Secret)
- [ ] Installer `cloudinary` npm package
- [ ] Créer `CloudinaryService.ts`
- [ ] Ajouter les variables d'environnement
- [ ] Modifier les contrôleurs d'upload
- [ ] Modifier les contrôleurs de suppression
- [ ] Adapter les services PDF (si applicable)
- [ ] Créer la fonction helper `getImageUrl()` côté frontend
- [ ] Modifier tous les composants qui affichent des images
- [ ] Tester en développement
- [ ] Configurer les variables sur Render
- [ ] Déployer en production
- [ ] Tester en production
- [ ] Demander aux utilisateurs de re-uploader leurs images

---

_Documentation créée le 26/11/2025 - Projet Pointage_
