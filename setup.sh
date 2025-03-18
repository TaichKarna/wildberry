#!/bin/bash
echo "Setting up Wildberry..."

# Clone repo if not already present
if [ ! -d "wildberry" ]; then
  git clone https://github.com/ProjWildBerry/wildberry.git
fi
cd wildberry

# Copy env examples
cp back-end/.env.example back-end/.env
cp front-end/.env.example front-end/.env

# Start with Docker
docker compose -f docker-compose.dev.yaml up -d

echo "Wildberry is ready!"
echo "Frontend: http://localhost:3001"
echo "API: http://localhost:3000"
echo "pgAdmin: http://localhost:5050"