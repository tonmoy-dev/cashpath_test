#!/bin/bash

# Script to start PostgreSQL database using Docker Compose

set -e

echo "🚀 Starting PostgreSQL database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Start the database
$COMPOSE_CMD up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=30
counter=0
    until $COMPOSE_CMD exec -T postgres pg_isready -U cashpath_test -d cashpath_test > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database failed to start within $timeout seconds"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

echo "✅ PostgreSQL database is ready!"
echo "📊 Connection details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: cashpath_test"
echo "   User: cashpath_test"
echo "   Password: cashpath_test"

