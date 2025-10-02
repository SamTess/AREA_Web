#!/bin/bash

# Quick environment setup script

echo "🚀 Setting up AREA Frontend environment"
echo "=================================================="

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  The .env.local file already exists."
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Ask for API URL
echo
echo "API configuration:"
read -p "Backend API URL (default: http://localhost:8080): " api_url
api_url=${api_url:-http://localhost:8080}

# Ask for mock mode
echo
echo "Development mode:"
echo "1) Use real API (recommended)"
echo "2) Use mocked data (frontend development only)"
read -p "Choose an option (1-2, default: 1): " mock_choice
mock_choice=${mock_choice:-1}

if [ "$mock_choice" = "2" ]; then
    use_mock="true"
else
    use_mock="false"
fi

# Ask for environment
echo
echo "Environment:"
echo "1) development"
echo "2) staging"  
echo "3) production"
read -p "Choose an environment (1-3, default: 1): " env_choice
env_choice=${env_choice:-1}

case $env_choice in
    2) environment="staging";;
    3) environment="production";;
    *) environment="development";;
esac

# Create .env.local file
cat > .env.local << EOF
# Configuration automatically generated on $(date)
NEXT_PUBLIC_API_BASE_URL=$api_url
NEXT_PUBLIC_USE_MOCK_DATA=$use_mock
NEXT_PUBLIC_ENVIRONMENT=$environment

# OAuth configuration (edit as needed)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
# NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
# NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
EOF

echo
echo "✅ Setup complete!"
echo "📁 File created: .env.local"
echo
echo "Current configuration:"
echo "  API URL: $api_url"
echo "  Mock Mode: $use_mock"
echo "  Environment: $environment"
echo
echo "💡 Tips:"
echo "  - Edit .env.local to adjust configuration"
echo "  - See docs/API_CONFIGURATION.md for more information"
echo "  - Uncomment OAuth variables if needed"
echo
echo "🚀 You can now start the application with:"
echo "  npm run dev"