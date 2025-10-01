#!/bin/bash

# Script de configuration rapide de l'environnement

echo "🚀 Configuration de l'environnement AREA Frontend"
echo "=================================================="

# Vérifier si .env.local existe
if [ -f ".env.local" ]; then
    echo "⚠️  Le fichier .env.local existe déjà."
    read -p "Voulez-vous le remplacer ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuration annulée."
        exit 1
    fi
fi

# Demander l'URL de l'API
echo
echo "Configuration de l'API:"
read -p "URL de l'API backend (default: http://localhost:8080): " api_url
api_url=${api_url:-http://localhost:8080}

# Demander le mode mock
echo
echo "Mode de développement:"
echo "1) Utiliser l'API réelle (recommandé)"
echo "2) Utiliser les données mockées (développement frontend uniquement)"
read -p "Choisissez une option (1-2, default: 1): " mock_choice
mock_choice=${mock_choice:-1}

if [ "$mock_choice" = "2" ]; then
    use_mock="true"
else
    use_mock="false"
fi

# Demander l'environnement
echo
echo "Environnement:"
echo "1) development"
echo "2) staging"  
echo "3) production"
read -p "Choisissez un environnement (1-3, default: 1): " env_choice
env_choice=${env_choice:-1}

case $env_choice in
    2) environment="staging";;
    3) environment="production";;
    *) environment="development";;
esac

# Créer le fichier .env.local
cat > .env.local << EOF
# Configuration générée automatiquement le $(date)
NEXT_PUBLIC_API_BASE_URL=$api_url
NEXT_PUBLIC_USE_MOCK_DATA=$use_mock
NEXT_PUBLIC_ENVIRONMENT=$environment

# Configuration OAuth (à modifier selon vos besoins)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
# NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
# NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
EOF

echo
echo "✅ Configuration terminée !"
echo "📁 Fichier créé: .env.local"
echo
echo "Configuration actuelle:"
echo "  API URL: $api_url"
echo "  Mode Mock: $use_mock"
echo "  Environnement: $environment"
echo
echo "💡 Conseils:"
echo "  - Modifiez .env.local pour ajuster la configuration"
echo "  - Consultez docs/API_CONFIGURATION.md pour plus d'informations"
echo "  - Décommentez les variables OAuth si nécessaire"
echo
echo "🚀 Vous pouvez maintenant démarrer l'application avec:"
echo "  npm run dev"