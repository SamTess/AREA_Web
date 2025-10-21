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
| `NEXT_PUBLIC_API_URL` | URL de base de l'API backend | `http://localhost:8080` | `https://api.example.com`, `http://192.168.1.100:8080` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Utiliser les données mockées | `false` | `true` pour le développement sans backend |
| `NEXT_PUBLIC_ENVIRONMENT` | Environnement d'exécution | `development` | `development`, `staging`, `production` |

### Configuration OAuth (optionnel)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```
## API configuration & environment

This document explains the environment variables, API endpoints and client configuration used by the AREA Web frontend.

Quick summary:

- Use `.env.local` for local environment variables.
- The client supports a mock-data mode (frontend-only) and a mode that calls a backend API.
- API endpoints are configured in `src/config/api.ts`. Axios behavior is centralized in `src/config/axios.ts`.

Environment variables
---------------------

Create `.env.local` from a template (if present):

```bash
cp .env.example .env.local
```

Important variables
-------------------

| Variable | Description | Default / Example |
|---|---:|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Enable frontend mock data (no backend calls) | `false` (set `true` for offline frontend dev) |
| `NEXT_PUBLIC_ENVIRONMENT` | Runtime environment | `development`, `staging`, `production` |

Optional OAuth client IDs (if you integrate social login providers):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

API endpoints
-------------

All endpoints are listed in `src/config/api.ts`. Primary groups include:

- Authentication: login, register, logout, refresh, me, status
- User: profile, avatar upload, get user info
- Areas & Services: list/create/update areas, list services, action definitions

Axios configuration
-------------------

The Axios instance in `src/config/axios.ts` centralizes HTTP behavior. Key features:

- Sends credentials/cookies when needed
- Automatically attempts token refresh on 401 responses (if implemented)
- Logs requests/responses in development
- Centralized error handling and user-friendly error messages

Development modes
-----------------

Mock mode (frontend-only):

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

In this mode API calls are intercepted and resolved with mock responses from `src/mocks/` or `cypress/fixtures/`.

API mode (backend calls):

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Deployment environments
-----------------------

Examples for environment variable values per environment:

- Development: `NEXT_PUBLIC_API_URL=http://localhost:8080`, `NEXT_PUBLIC_ENVIRONMENT=development`
- Staging: `NEXT_PUBLIC_API_URL=https://api-staging.example.com`, `NEXT_PUBLIC_ENVIRONMENT=staging`
- Production: `NEXT_PUBLIC_API_URL=https://api.example.com`, `NEXT_PUBLIC_ENVIRONMENT=production`

Security notes
--------------

- Variables prefixed with `NEXT_PUBLIC_` are exposed to client-side code — never store secrets there.
- Use HTTPS in staging/production.
- Configure CORS on the backend so the frontend origin is allowed.

Troubleshooting tips
--------------------

Common issues and quick checks:

- CORS errors: verify backend CORS configuration.
- 401 Unauthorized: check cookies and token flow; verify `NEXT_PUBLIC_USE_MOCK_DATA` if you expected mocks.
- Network errors: verify `NEXT_PUBLIC_API_URL` and that the backend is running.

Quick connectivity test:

```bash
# Start dev server and then check login status endpoint
yarn dev
curl $NEXT_PUBLIC_API_URL/api/auth/status
```
