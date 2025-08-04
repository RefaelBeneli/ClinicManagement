#!/bin/bash

# JWT Secret Generator for Clinic Management System
# This script generates a secure JWT secret for production use

echo "🔒 JWT Secret Generator for Clinic Management System"
echo "=================================================="
echo ""

# Check if openssl is available
if command -v openssl &> /dev/null; then
    echo "✅ Using OpenSSL to generate secure JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT Secret:"
    echo "$JWT_SECRET"
    echo ""
    echo "🔧 To use this secret, set the environment variable:"
    echo "export JWT_SECRET=\"$JWT_SECRET\""
    echo ""
    echo "📝 Or add it to your .env file:"
    echo "JWT_SECRET=$JWT_SECRET"
else
    echo "⚠️  OpenSSL not found. Using alternative method..."
    # Alternative method using /dev/urandom
    JWT_SECRET=$(head -c 32 /dev/urandom | base64)
    echo "Generated JWT Secret:"
    echo "$JWT_SECRET"
    echo ""
    echo "🔧 To use this secret, set the environment variable:"
    echo "export JWT_SECRET=\"$JWT_SECRET\""
    echo ""
    echo "📝 Or add it to your .env file:"
    echo "JWT_SECRET=$JWT_SECRET"
fi

echo ""
echo "🚨 SECURITY REMINDERS:"
echo "1. Never commit this secret to version control"
echo "2. Use different secrets for different environments"
echo "3. Rotate secrets periodically"
echo "4. Store secrets securely (use environment variables or secret management)"
echo ""
echo "✅ Your application is now ready for secure deployment!" 