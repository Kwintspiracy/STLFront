# Guide de Configuration des Médias

Ce guide explique comment configurer et utiliser le système de gestion des médias pour supporter à la fois les environnements de développement et de production avec Google Cloud Storage.

## 🔧 Configuration

### Variables d'Environnement

Ajoutez ces variables dans votre `.env.local` :

```env
# Chemin local pour les médias (développement)
NEXT_PUBLIC_MEDIA_PATH=/media

# Chemin de production pour Google Cloud Storage
NEXT_PUBLIC_MEDIA_PATH_PROD=https://storage.googleapis.com/theforge
```

### Configuration Next.js

Le fichier `next.config.ts` est automatiquement configuré pour :
- ✅ Autoriser `storage.googleapis.com` en production
- ✅ Autoriser localhost en développement
- ✅ Gérer les domaines dynamiquement selon l'environnement

## 📚 Utilisation

### Fonction Utilitaire

Utilisez `processImageUrl()` pour traiter toutes les URLs d'images :

```typescript
import { processImageUrl } from '@/lib/utils/mediaUtils';

// Dans vos composants
const imageUrl = processImageUrl(rawImageUrl);

// Avec Next.js Image
<Image src={processImageUrl(product.image)} alt="Product" />
```

### Fonctions Disponibles

#### `processImageUrl(imageUrl: string): string`
Traite une URL d'image du backend :
- Si c'est déjà une URL complète → utilise telle quelle
- Si c'est un chemin relatif → ajoute le bon préfixe selon l'environnement

#### `getMediaUrl(path: string): string`
Génère une URL complète à partir d'un chemin :
- Développement : `/media/path/to/image.jpg`
- Production : `https://storage.googleapis.com/theforge/path/to/image.jpg`

#### `isExternalUrl(url: string): boolean`
Vérifie si une URL est externe (commence par http/https)

#### `getMediaHostname(url: string): string | null`
Extrait le hostname d'une URL pour la configuration Next.js

## 🌍 Environnements

### Développement Local
- **Images servies depuis** : `/media/*` (proxy vers backend local)
- **Configuration** : `NEXT_PUBLIC_MEDIA_PATH=/media`
- **Domaines autorisés** : `127.0.0.1:8000`

### Production (Vercel/Fly.io)
- **Images servies depuis** : Google Cloud Storage
- **Configuration** : `NEXT_PUBLIC_MEDIA_PATH_PROD=https://storage.googleapis.com/theforge`
- **Domaines autorisés** : `storage.googleapis.com`

## 🔄 Migration des Composants

### Avant
```typescript
<Image src={product.image} alt="Product" />
```

### Après
```typescript
import { processImageUrl } from '@/lib/utils/mediaUtils';

<Image src={processImageUrl(product.image)} alt="Product" />
```

## 🚀 Déploiement

### Variables Vercel
Configurez ces variables dans Vercel :
```env
NEXT_PUBLIC_MEDIA_PATH=/media
NEXT_PUBLIC_MEDIA_PATH_PROD=https://storage.googleapis.com/theforge
```

### Variables Fly.io
Configurez ces variables dans votre backend Fly.io :
```env
NEXT_PUBLIC_MEDIA_PATH=/media
NEXT_PUBLIC_MEDIA_PATH_PROD=https://storage.googleapis.com/theforge
```

## 🛡️ Sécurité

### Domaines Autorisés
Next.js autorise uniquement les domaines configurés :
- ✅ `storage.googleapis.com` (votre Google Cloud Storage)
- ✅ `127.0.0.1` (développement local)
- ✅ Autres domaines spécifiés dans `next.config.ts`

### Validation
- Les URLs sont validées avant traitement
- Les erreurs d'URL invalides sont gérées gracieusement
- Fallback vers images par défaut en cas d'erreur

## 📊 Performance

### Optimisations Next.js Image
- ✅ **WebP automatique** : Conversion de format optimisée
- ✅ **Lazy loading** : Chargement différé des images
- ✅ **Responsive sizing** : Tailles adaptatives selon l'écran
- ✅ **Priority loading** : Images critiques chargées en priorité

### Exemple d'Utilisation Optimisée
```typescript
<Image
  src={processImageUrl(product.image)}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  priority={isCritical}
/>
```

## 🔧 Dépannage

### Erreur "hostname not configured"
- Vérifiez que `NEXT_PUBLIC_MEDIA_PATH_PROD` est correctement définie
- Redémarrez le serveur de développement après modification
- Vérifiez que le domaine est dans `next.config.ts`

### Images ne se chargent pas
- Vérifiez les URLs dans les outils de développement
- Testez `processImageUrl()` avec vos données
- Vérifiez les CORS si nécessaire

### Performance lente
- Utilisez `priority` pour les images critiques
- Optimisez les `sizes` selon vos breakpoints
- Vérifiez la configuration de votre CDN

## 📝 Exemples

### ProductCard (Implémenté)
```typescript
const mainImage = rawImageUrl ? processImageUrl(rawImageUrl) : null;
const badgeImage = processImageUrl(product.creator.badge);
```

### StudioProfile (Implémenté)
```typescript
<Image src={processImageUrl(studio.banner)} alt="Banner" />
<Image src={processImageUrl(studio.badge)} alt="Logo" />
```

Cette configuration garantit une gestion flexible et performante des médias dans tous les environnements.
