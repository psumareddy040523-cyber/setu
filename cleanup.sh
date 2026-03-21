#!/bin/bash
# Cleanup script - Run before pushing to GitHub

echo "🧹 Cleaning up for deployment..."

# Frontend cleanup
echo "Cleaning frontend..."
rm -rf frontend/node_modules
rm -rf frontend/dist
rm -f frontend/.env

# Backend cleanup
echo "Cleaning backend..."
find backend/sevasetu -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find backend/sevasetu -type f -name "*.pyc" -delete 2>/dev/null
rm -f backend/sevasetu/db.sqlite3*
rm -f backend/sevasetu/*.log

# Root cleanup
rm -rf .venv/
rm -rf venv/

echo "✅ Cleanup complete!"
echo ""
echo "Files ready to push:"
git status --short
