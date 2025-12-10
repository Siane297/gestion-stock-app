# AppButton Component

Composant Button personnalisé créé de zéro (sans PrimeVue) avec support complet pour les icônes et les états de chargement.

## Fonctionnalités

✅ Icône à gauche  
✅ Icône à droite  
✅ État de chargement avec spinner animé  
✅ Plusieurs variantes (primary, secondary, outline, danger, success)  
✅ Plusieurs tailles (sm, md, lg)  
✅ Support pleine largeur  
✅ États désactivé et loading  
✅ Utilise les couleurs du thème Tailwind personnalisé  

## Utilisation

### Bouton basique

```vue
<AppButton label="Cliquer ici" />
```

### Bouton avec icône à gauche

```vue
<AppButton 
  label="Se connecter avec Google"
  icon-left="logos:google-icon"
  variant="outline"
/>
```

### Bouton avec icône à droite

```vue
<AppButton 
  label="Suivant"
  icon-right="mdi:arrow-right"
  variant="primary"
/>
```

### Bouton avec état de chargement

```vue
<AppButton 
  label="Enregistrer"
  :loading="isLoading"
  variant="primary"
/>
```

### Bouton outline (avec bordure)

```vue
<AppButton 
  label="Annuler"
  variant="outline"
  icon-left="mdi:close"
/>
```

### Bouton pleine largeur

```vue
<AppButton 
  label="Se connecter"
  variant="primary"
  full-width
/>
```

## Props

| Prop | Type | Valeur par défaut | Description |
|------|------|-------------------|-------------|
| `label` | `string` | `undefined` | Texte du bouton |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type HTML du bouton |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'danger' \| 'success'` | `'primary'` | Style du bouton |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du bouton |
| `iconLeft` | `string` | `undefined` | Nom de l'icône Iconify à afficher à gauche |
| `iconRight` | `string` | `undefined` | Nom de l'icône Iconify à afficher à droite |
| `loading` | `boolean` | `false` | Affiche un spinner et désactive le bouton |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `fullWidth` | `boolean` | `false` | Le bouton prend toute la largeur disponible |

## Événements

| Événement | Description |
|-----------|-------------|
| `@click` | Émis lors du clic (sauf si loading ou disabled) |

## Variantes

### Primary
Bouton principal avec couleur `primary` du thème.

### Secondary
Bouton secondaire avec couleur `gris` du thème.

### Outline
Bouton avec bordure et fond transparent, devient plein au survol.

### Danger
Bouton rouge pour les actions destructives.

### Success
Bouton vert avec couleur `vert` du thème.

## Exemples complets

```vue
<template>
  <div class="space-y-4">
    <!-- Bouton primary avec loading -->
    <AppButton 
      label="Se connecter"
      type="submit"
      :loading="isLoading"
      variant="primary"
      full-width
      @click="handleLogin"
    />

    <!-- Bouton outline avec icône Google -->
    <AppButton 
      label="Se connecter avec Google"
      icon-left="logos:google-icon"
      variant="outline"
      full-width
      @click="handleGoogleLogin"
    />

    <!-- Bouton avec icône à droite -->
    <AppButton 
      label="Suivant"
      icon-right="mdi:arrow-right"
      variant="primary"
      @click="nextStep"
    />

    <!-- Bouton danger -->
    <AppButton 
      label="Supprimer"
      icon-left="mdi:delete"
      variant="danger"
      size="sm"
      @click="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import AppButton from '~/components/button/AppButton.vue';

const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  // Logique de connexion
  isLoading.value = false;
};
</script>
```

## Icônes

Le composant utilise Iconify pour les icônes. Vous pouvez utiliser n'importe quelle icône disponible sur [Iconify](https://icon-sets.iconify.design/).

Exemples d'icônes populaires :
- `logos:google-icon` - Logo Google
- `mdi:arrow-right` - Flèche droite
- `mdi:check` - Coche
- `mdi:close` - Croix
- `mdi:loading` - Chargement (utilisé automatiquement en mode loading)
