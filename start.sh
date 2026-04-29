#!/bin/bash
# GolfChain Platform Starter Script

echo "🏌️  GolfChain Platform - Starting Services"
echo ""

# Check if backend exists
if [ ! -d "server" ]; then
    echo "❌ Server directory not found!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd server
npm install

echo ""
echo "✅ Backend ready!"
echo ""
echo "🚀 To run the application:"
echo ""
echo "Terminal 1 - Frontend:"
echo "  cd client/golf-client && npm run dev"
echo ""
echo "Terminal 2 - Backend:"
echo "  cd server && npm start"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
