#!/bin/bash

echo "🚀 MCP Vertx Backend Tester Frontend"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if backend is running
echo "🔍 Checking backend server status..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Backend server is running on http://localhost:8080"
else
    echo "⚠️  Backend server is not running on http://localhost:8080"
    echo "   Please start your backend server first:"
    echo "   cd .. && ./gradlew run"
    echo ""
    echo "   You can still start the frontend, but some features won't work."
fi

echo ""
echo "🌐 Starting frontend server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start 