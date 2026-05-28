#!/bin/bash

echo "🔄 Restarting Admin Backend Server..."
echo ""

# Find and kill existing server process
echo "📍 Looking for existing server process..."
PID=$(lsof -ti:9000)

if [ ! -z "$PID" ]; then
  echo "✅ Found process on port 9000 (PID: $PID)"
  echo "🛑 Stopping existing server..."
  kill -9 $PID
  sleep 1
  echo "✅ Server stopped"
else
  echo "ℹ️  No existing server found on port 9000"
fi

echo ""
echo "🚀 Starting server with updated CORS configuration..."
echo ""
echo "📝 CORS now allows:"
echo "   - localhost:3000, 3001"
echo "   - 10.21.10.248:3000, 3001"
echo "   - Any 10.x.x.x:port"
echo "   - Any 192.168.x.x:port"
echo ""
echo "🔐 Admin Login: admin@gmail.com / admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the server
npm run dev
