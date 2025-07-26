#!/bin/bash

echo "🔗 GitHub Connection Helper"
echo "=========================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from your project root."
    exit 1
fi

echo "📝 Please provide your GitHub repository details:"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name
read -p "Enter your repository name (e.g., ClinicManagement): " REPO_NAME

# Construct the repository URL
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "🚀 Connecting to: $REPO_URL"
echo ""

# Add remote origin
echo "Adding remote origin..."
git remote add origin $REPO_URL

# Set main branch
echo "Setting main branch..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! Your project is now on GitHub!"
    echo "🌐 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "✅ What you can do now:"
    echo "  - View your code at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "  - Deploy with AWS Amplify using this repository"
    echo "  - Set up automatic deployments"
    echo "  - Collaborate with others"
    echo ""
    echo "📖 Next steps:"
    echo "  - Check out AMPLIFY_DEPLOYMENT.md for easy AWS deployment"
    echo "  - Or follow AWS_DEPLOYMENT_GUIDE.md for manual setup"
else
    echo ""
    echo "❌ Something went wrong. Please check:"
    echo "  1. GitHub repository exists and is empty"
    echo "  2. You have write access to the repository"
    echo "  3. Your GitHub credentials are correct"
    echo ""
    echo "🔧 You can also run these commands manually:"
    echo "  git remote add origin $REPO_URL"
    echo "  git branch -M main"
    echo "  git push -u origin main"
fi 