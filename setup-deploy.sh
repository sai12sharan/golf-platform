#!/bin/bash

# Golf Platform Deployment Setup Script
# This script helps you prepare for deployment

set -e

echo "🏌️ Golf Platform - Deployment Setup Script"
echo "==========================================="
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Git and Node.js found"
echo "Node version: $(node --version)"
echo "Git version: $(git --version)"
echo ""

# Initialize Git if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git config user.email "deploy@golf-platform.com"
    git config user.name "Golf Platform Deploy"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
if [ -d "server" ]; then
    echo "Installing backend dependencies..."
    cd server
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
fi

# Install frontend dependencies
if [ -d "client/golf-client" ]; then
    echo "Installing frontend dependencies..."
    cd client/golf-client
    npm install
    cd ../..
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "📝 Creating environment files..."

# Create backend .env if not exists
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env (please update with production values)"
else
    echo "⏭️  server/.env already exists"
fi

# Create frontend .env.local if not exists
if [ ! -f "client/golf-client/.env.local" ]; then
    cp client/golf-client/.env.local.example client/golf-client/.env.local
    echo "✅ Created client/golf-client/.env.local"
else
    echo "⏭️  client/golf-client/.env.local already exists"
fi

echo ""
echo "🧪 Running build tests..."

# Test build backend
cd server
npm run build 2>/dev/null || echo "ℹ️  Backend has no build script (that's okay)"
cd ..

# Test build frontend
cd client/golf-client
npm run build 2>/dev/null && echo "✅ Frontend builds successfully" || echo "⚠️  Frontend build has issues - check logs"
cd ../..

echo ""
echo "==========================================="
echo "✅ SETUP COMPLETE!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Update environment files with production URLs"
echo "2. Commit changes: git add . && git commit -m 'Deploy setup'"
echo "3. Push to GitHub"
echo "4. Follow DEPLOYMENT_QUICK_START.md"
echo ""
