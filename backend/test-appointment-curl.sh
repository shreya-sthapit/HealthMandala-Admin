#!/bin/bash

echo "========================================================================"
echo "🧪 TESTING APPOINTMENT API ENDPOINTS"
echo "========================================================================"
echo ""

# Step 1: Login
echo "1️⃣  Logging in to get admin token..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:9000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test pending appointments
echo "2️⃣  Testing /api/admin/pending-appointments..."
echo ""

PENDING=$(curl -s -X GET http://localhost:9000/api/admin/pending-appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$PENDING" | jq '.' 2>/dev/null || echo "$PENDING"
echo ""

# Step 3: Test approved appointments
echo "3️⃣  Testing /api/admin/approved-appointments..."
echo ""

APPROVED=$(curl -s -X GET http://localhost:9000/api/admin/approved-appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$APPROVED" | jq '.' 2>/dev/null || echo "$APPROVED"
echo ""

# Step 4: Test stats
echo "4️⃣  Testing /api/admin/stats..."
echo ""

STATS=$(curl -s -X GET http://localhost:9000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$STATS" | jq '.' 2>/dev/null || echo "$STATS"
echo ""

echo "========================================================================"
echo "✅ TESTS COMPLETED"
echo "========================================================================"
