# Configuration des Variables d'Environnement

Ce projet utilise des variables d'environnement pour configurer les URLs de l'API selon l'environnement (développement, staging, production).

## Configuration Locale

1. Copiez le fichier `.env.example` vers `.env.local` :
   ```bash
   cp .env.example .env.local
   ```

2. Modifiez `.env.local` selon vos besoins :
   ```env
   # Pour le développement local avec API locale
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
   NEXT_PUBLIC_USE_REAL_API=false
   
   # Pour tester avec l'API de production
   NEXT_PUBLIC_API_BASE_URL=https://votre-api.onrender.com/api/v1
   NEXT_PUBLIC_USE_REAL_API=true
   ```

## Déploiement sur Vercel

### Variables à configurer dans Vercel Dashboard

Allez dans **Settings** > **Environment Variables** et ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://votre-api.onrender.com/api/v1` | URL de votre API sur Render |
| `NEXT_PUBLIC_REAL_API_BASE_URL` | `https://votre-api.onrender.com` | URL de base de l'API |
| `NEXT_PUBLIC_API_HOSTNAME` | `votre-api.onrender.com` | **NOUVEAU** - Hostname pour Next.js config |
| `NEXT_PUBLIC_MEDIA_PATH` | `/media` | **NOUVEAU** - Chemin des médias (configurable) |
| `NEXT_PUBLIC_USE_REAL_API` | `true` | Force l'utilisation de l'API de production |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` | Désactive les données mockées |

### Déploiement automatique

Une fois les variables configurées, chaque push sur la branche principale déclenchera un redéploiement automatique avec les nouvelles variables.

## Variables Disponibles

- **NEXT_PUBLIC_API_BASE_URL** : URL principale de l'API
- **NEXT_PUBLIC_REAL_API_BASE_URL** : URL alternative de l'API
- **NEXT_PUBLIC_USE_REAL_API** : `true` pour utiliser l'API de production, `false` pour l'API locale
- **NEXT_PUBLIC_USE_MOCK_DATA** : `true` pour utiliser des données mockées

## Avantages

✅ **Flexibilité** : Basculement facile entre environnements  
✅ **Sécurité** : Pas d'URLs sensibles dans le code source  
✅ **CI/CD** : Configuration différente par environnement  
✅ **Développement** : Fonctionne sans configuration supplémentaire  

## Dépannage

Si l'application ne trouve pas l'API :
1. Vérifiez que les variables d'environnement sont bien définies
2. Redémarrez le serveur de développement après modification de `.env.local`
3. Vérifiez les URLs dans la console du navigateur
