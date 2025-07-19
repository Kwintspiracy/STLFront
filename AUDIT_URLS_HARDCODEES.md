# Audit des URLs Hardcodées - Rapport Complet

## 🔍 Résumé de l'audit

J'ai effectué un audit complet de votre codebase pour identifier toutes les URLs hardcodées. Voici les résultats détaillés :

## ✅ URLs Correctement Configurées (Utilisant les Variables d'Environnement)

### 1. Configuration API Principale (`src/lib/api/config.ts`)
- ✅ `API_BASE_URL` utilise `process.env.NEXT_PUBLIC_API_BASE_URL`
- ✅ `REAL_API_BASE_URL` utilise `process.env.NEXT_PUBLIC_REAL_API_BASE_URL`
- ✅ Tous les endpoints utilisent ces variables de base

### 2. Services API
- ✅ `src/lib/api/authService.ts` - Utilise `AUTH_ENDPOINTS` de config
- ✅ `src/lib/api/products.ts` - Utilise `PRODUCT_ENDPOINTS` de config
- ✅ `src/context/AuthContext.tsx` - Utilise `AUTH_ENDPOINTS` de config
- ✅ `src/app/auth/google/callback/page.tsx` - Utilise `AUTH_ENDPOINTS` de config

## ⚠️ URLs Hardcodées Identifiées

### 1. **CRITIQUE - Configuration Next.js (`next.config.ts`)**
```typescript
// PROBLÈME : URLs hardcodées dans la configuration Next.js
{
  protocol: 'http',
  hostname: '127.0.0.1',
  port: '8000',
  pathname: '/media/**',
},
{
  protocol: 'http',
  hostname: 'little-sea-1837.fly.dev',
  pathname: '/**',
},
{
  protocol: 'https',
  hostname: 'little-sea-1837.fly.dev',
  pathname: '/**',
},

// PROBLÈME : Rewrite hardcodé
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:8000/api/:path*',
    },
  ];
},
```

### 2. **URLs d'Authentification Externe (OK)**
```typescript
// Ces URLs sont normales car ce sont des services externes
- Google OAuth: 'https://accounts.google.com/gsi/client'
- Google Auth: 'https://accounts.google.com/o/oauth2/v2/auth'
- Discord OAuth: 'https://discord.com/api/oauth2/authorize'
```

### 3. **URLs de Mock/Test (OK pour le développement)**
```typescript
// Dans les fichiers de données mockées - OK car c'est pour les tests
- Picsum Photos: 'https://picsum.photos/seed/...'
- Images de test dans mock-products.ts, mock-studios.ts, etc.
```

### 4. **URLs SVG/Namespace (OK)**
```typescript
// URLs techniques pour SVG - normales
- xmlns="http://www.w3.org/2000/svg"
```

## 🚨 Problèmes Critiques à Corriger

### 1. **Configuration Next.js**
Le fichier `next.config.ts` contient des URLs hardcodées qui empêchent le bon fonctionnement en production :

**Problème :** Les images et rewrites pointent vers localhost même en production.

**Solution :** Utiliser des variables d'environnement dans `next.config.ts`

### 2. **Configuration d'Images**
Les `remotePatterns` pour les images doivent être dynamiques selon l'environnement.

## 📋 Actions Recommandées

### 1. **URGENT - Corriger next.config.ts**
- Remplacer les URLs hardcodées par des variables d'environnement
- Configurer les `remotePatterns` dynamiquement
- Supprimer ou conditionner les `rewrites` hardcodés

### 2. **Vérifier les Variables Vercel**
- S'assurer que toutes les variables sont définies sur Vercel
- Tester le déploiement après les corrections

### 3. **Configuration des Images**
- Ajouter les domaines Render dans `remotePatterns`
- Configurer HTTPS pour les images en production

## 🎯 URLs à Configurer sur Vercel

```env
NEXT_PUBLIC_API_BASE_URL=https://votre-api.onrender.com/api/v1
NEXT_PUBLIC_REAL_API_BASE_URL=https://votre-api.onrender.com
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## ✅ Conclusion

**Bonne nouvelle :** Votre code applicatif utilise correctement les variables d'environnement !

**Problème principal :** La configuration Next.js (`next.config.ts`) contient des URLs hardcodées qui causent les erreurs en production.

**Priorité :** Corriger `next.config.ts` en premier, puis redéployer sur Vercel.

---

*Audit effectué le 20/01/2025 - Tous les fichiers source analysés*
