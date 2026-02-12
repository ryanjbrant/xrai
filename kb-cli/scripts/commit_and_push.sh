#!/bin/bash

# Navigate to the repository root
cd "$(dirname "$0")/.."

# Get the current date for the commit message
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Add all changes to git
echo "📝 Staging changes..."
git add .

# Create a commit with a descriptive message
echo "💾 Creating commit..."
git commit -m "🔧 Update KB-CLI: Add smart suggestions and performance monitoring [$CURRENT_DATE]"

# Push changes to the remote repository
echo "🚀 Pushing changes to remote repository..."
git push

echo "✅ Successfully updated knowledge base!"
