#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Kill any process that is already running on port 3000
if lsof -t -i:3000; then
  kill $(lsof -t -i:3000)
fi

# Start the server in the background
npm run dev &
# Store the process ID of the server
SERVER_PID=$!

# Wait for the server to start
sleep 5

# Set the base URL for the API
BASE_URL="http://localhost:3000/api"

# Test /api/auth
echo "Testing /api/auth"
curl -f -X POST -H "Content-Type: application/json" -d '{"address":"test_user"}' $BASE_URL/auth
echo -e "\n"

# Test /api/deposit
echo "Testing /api/deposit"
curl -f -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "amount": 100}' $BASE_URL/deposit
echo -e "\n"

# Test /api/spin
echo "Testing /api/spin"
curl -f -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "betAmount": 10, "riskLevel": "MED"}' $BASE_URL/spin
echo -e "\n"

# Test /api/gamble (will fail if there are no winnings)
# To test this properly, you need to have winnings from a spin
echo "Testing /api/gamble (may fail if no winnings)"
curl -f -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "type": "RED"}' $BASE_URL/gamble
echo -e "\n"

# Test /api/collect
echo "Testing /api/collect"
curl -f -X POST -H "Content-Type: application/json" -d '{"address":"test_user"}' $BASE_URL/collect
echo -e "\n"

# Test /api/withdraw
echo "Testing /api/withdraw"
curl -f -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "amount": 100}' $BASE_URL/withdraw
echo -e "\n"

echo "All tests passed!"

# Kill the server process
kill $SERVER_PID
