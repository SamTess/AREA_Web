# Configuration API et Environnement

## Variables d'environnement

### Configuration requise

Copiez le fichier `.env.example` vers `.env.local` et configurez les variables selon votre environnement :

```bash
cp .env.example .env.local
```

### Variables disponibles

| Variable | Description | Valeur par défaut | Exemples |
|----------|-------------|-------------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | URL de base de l'API backend | `http://localhost:8080` | `https://api.example.com`, `http://192.168.1.100:8080` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Utiliser les données mockées | `false` | `true` pour le développement sans backend |
| `NEXT_PUBLIC_ENVIRONMENT` | Environnement d'exécution | `development` | `development`, `staging`, `production` |

### Configuration OAuth (optionnel)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

## Configuration API

### Endpoints disponibles

La configuration des endpoints se trouve dans `src/config/api.ts` :

- **Authentication**
  - `POST /api/auth/login` - Connexion
  - `POST /api/auth/register` - Inscription
  - `POST /api/auth/logout` - Déconnexion
  - `POST /api/auth/refresh` - Refresh token
  - `GET /api/auth/me` - Utilisateur actuel
  - `GET /api/auth/status` - Statut d'authentification

- **User Management**
  - `PUT /api/auth/profile` - Mise à jour du profil
  - `POST /api/user/avatar` - Upload d'avatar
  - `GET /api/user/{email}` - Informations utilisateur

- **Areas & Services**
  - `GET /api/areas` - Liste des areas
  - `POST /api/areas` - Créer une area
  - `GET /api/services` - Liste des services

### Configuration Axios

L'intercepteur Axios (`src/config/axios.ts`) gère automatiquement :

- **Cookies d'authentification** : Inclus automatiquement dans toutes les requêtes
- **Gestion des erreurs 401** : Tentative automatique de refresh token
- **Redirection automatique** : Vers la page de login si l'authentification échoue
- **Logging** : En mode développement pour faciliter le debug
- **Gestion des erreurs réseau** : Messages d'erreur appropriés

## Modes de développement

### Mode Mock (développement sans backend)

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Dans ce mode :
- Toutes les requêtes API retournent des données mockées
- Pas de communication avec le backend
- Utile pour le développement frontend uniquement

### Mode API (développement avec backend)

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Dans ce mode :
- Communication directe avec l'API backend
- Gestion automatique des tokens d'authentification
- Gestion des erreurs et retry automatique

## Déploiement

### Environnements de déploiement

#### Développement local
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Staging
```env
NEXT_PUBLIC_API_BASE_URL=https://api-staging.example.com
NEXT_PUBLIC_ENVIRONMENT=staging
```

#### Production
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Sécurité

- Les variables `NEXT_PUBLIC_*` sont exposées côté client
- Ne jamais mettre de secrets dans ces variables
- Utiliser HTTPS en production
- Configurer CORS correctement sur le backend

## Troubleshooting

### Erreurs courantes

1. **CORS Error** : Vérifier la configuration CORS du backend
2. **401 Unauthorized** : Vérifier que les cookies sont activés
3. **Network Error** : Vérifier l'URL de l'API et que le backend est démarré
4. **Mock Data** : Vérifier la variable `NEXT_PUBLIC_USE_MOCK_DATA`

### Debug

En mode développement, les logs Axios sont activés automatiquement :
- 🚀 pour les requêtes sortantes
- ✅ pour les réponses réussies  
- ❌ pour les erreurs

### Test de configuration

Pour tester votre configuration :

```bash
# Vérifier les variables d'environnement
npm run build

# Démarrer en mode développement
npm run dev

# Vérifier la connectivité API
curl http://localhost:8080/api/auth/status
```