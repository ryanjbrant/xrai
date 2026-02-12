#!/bin/bash

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
find . -type f -name "*.log" -delete
find . -type f -name "*.tmp" -delete
find . -type f -name "*.swp" -delete
find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null
find . -type d -name "dist" -exec rm -rf {} +
find . -type d -name "build" -exec rm -rf {} +

# Remove Python cache files
echo "🐍 Removing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.py[co]" -delete

# Remove npm debug logs
echo "📦 Cleaning npm logs..."
find . -name "npm-debug.log*" -delete

# Remove IDE specific files
echo "💻 Removing IDE files..."
find . -name ".DS_Store" -delete
find . -name "*.sublime-*" -delete
rm -f .idea/
rm -f .vscode/

# Clean up empty directories
echo "🗑️  Removing empty directories..."
find . -type d -empty -delete

echo "✨ Cleanup complete!"
