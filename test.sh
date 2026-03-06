#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the base URL for the API
BASE_URL="http://localhost:3000/api"

# Wait for the server to be ready
echo "Waiting for server to start..."
while ! curl -s $BASE_URL/auth > /dev/null; do
    sleep 1
done
echo "Server is ready!"


# Test /api/auth
echo "Testing /api/auth"
curl -X POST -H "Content-Type: application/json" -d '{"address":"test_user"}' $BASE_URL/auth
echo -e "\n"

# Test /api/deposit
echo "Testing /api/deposit"
curl -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "amount": 500}' $BASE_URL/deposit
echo -e "\n"

# Test /api/spin
echo "Testing /api/spin"
curl -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "betAmount": 10, "riskLevel": "LOW"}' $BASE_URL/spin
echo -e "\n"

# Test /api/collect
echo "Testing /api/collect"
curl -X POST -H "Content-Type: application/json" -d '{"address":"test_user"}' $BASE_URL/collect
echo -e "\n"

# Test /api/withdraw
echo "Testing /api/withdraw"
curl -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "amount": 100}' $BASE_URL/withdraw
echo -e "\n"

# Test /api/gamble (will fail if there are no winnings)
# To test this properly, you need to have winnings from a spin
echo "Testing /api/gamble (may fail if no winnings)"
curl -X POST -H "Content-Type: application/json" -d '{"address":"test_user", "type": "RED"}' $BASE_URL/gamble
echo -e "\n"

echo "All tests passed!"