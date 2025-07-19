# Guide de Déploiement Vercel - Configuration Complète

## 🚀 Étapes de Déploiement

### 1. Variables d'Environnement Vercel

Dans votre dashboard Vercel, allez dans **Settings** > **Environment Variables** et configurez :

#### Variables API (OBLIGATOIRES)
```env
NEXT_PUBLIC_API_BASE_URL=https://votre-api.onrender.com/api/v1
NEXT_PUBLIC_REAL_API_BASE_URL=https://votre-api.onrender.com
NEXT_PUBLIC_API_HOSTNAME=votre-api.onrender.com
```

#### Variables de Configuration (OBLIGATOIRES)
```env
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_MEDIA_PATH=/media
```

#### Variables Optionnelles (selon vos besoins)
```env
NODE_ENV=production
NEXT_PUBLIC_DISCORD_CLIENT_ID=votre_discord_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre_google_client_id
```

### 2. Remplacer les URLs dans les Variables

**Remplacez `votre-api.onrender.com` par votre vraie URL Render !**

Exemple avec une vraie URL :
```env
NEXT_PUBLIC_API_BASE_URL=https://stl-forge-api.onrender.com/api/v1
NEXT_PUBLIC_REAL_API_BASE_URL=https://stl-forge-api.onrender.com
NEXT_PUBLIC_API_HOSTNAME=stl-forge-api.onrender.com
```

### 3. Configuration des Domaines d'Images

Avec les nouvelles variables, Next.js configurera automatiquement :

✅ **En développement :**
- `http://127.0.0.1:8000/media/**` (localhost)

✅ **En production :**
- `https://votre-api.onrender.com/media/**` (votre API)

### 4. Vérification Post-Déploiement

Après le déploiement, vérifiez dans la console du navigateur :

#### ✅ Ce que vous devriez voir :
```
✅ API calls vers: https://votre-api.onrender.com/api/v1/...
✅ Images chargées depuis: https://votre-api.onrender.com/media/...
✅ Pas d'erreurs Mixed Content
```

#### ❌ Ce que vous ne devriez PLUS voir :
```
❌ POST http://127.0.0.1:8000/api/v1/...
❌ Mixed Content errors
❌ 404 sur /trending, /featured, etc.
```

## 🔧 Résolution des Problèmes

### Problème : Encore des erreurs localhost
**Solution :** Vérifiez que `NEXT_PUBLIC_API_HOSTNAME` est bien défini sur Vercel

### Problème : Images ne se chargent pas
**Solution :** Vérifiez que `NEXT_PUBLIC_MEDIA_PATH` correspond au chemin de votre API

### Problème : Mixed Content
**Solution :** Assurez-vous que votre API Render utilise HTTPS

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement configurées sur Vercel
- [ ] URLs remplacées par vos vraies URLs Render
- [ ] `NEXT_PUBLIC_USE_REAL_API=true` défini
- [ ] Redéploiement déclenché
- [ ] Test de l'authentification
- [ ] Test du chargement des images
- [ ] Vérification de la console pour les erreurs

## 🎯 Résultat Attendu

Après cette configuration :
- ✅ Plus d'erreurs `127.0.0.1:8000`
- ✅ API calls vers votre Render
- ✅ Images chargées correctement
- ✅ Authentification fonctionnelle
- ✅ Site entièrement fonctionnel en production

---

*Guide créé le 20/01/2025 - Basé sur la nouvelle configuration avec variables d'environnement*
