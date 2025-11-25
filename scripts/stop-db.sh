#!/bin/bash

# Script to stop PostgreSQL database using Docker Compose

set -e

echo "🛑 Stopping PostgreSQL database..."

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Stop the database
$COMPOSE_CMD stop postgres

echo "✅ PostgreSQL database stopped!"

