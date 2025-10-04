#!/bin/bash

# MoodOverMuscle Database Backup Script
# Creates timestamped backups of the development database

set -e

# Configuration
CONTAINER_NAME="moodovermuscle_postgres"
DB_NAME="moodovermuscle_dev"
DB_USER="moodovermuscle"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="moodovermuscle_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🗄️  Creating database backup..."
echo "Database: $DB_NAME"
echo "Timestamp: $TIMESTAMP"
echo "Output: $BACKUP_DIR/$BACKUP_FILE"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: PostgreSQL container '$CONTAINER_NAME' is not running"
    echo "Start it with: docker-compose up -d"
    exit 1
fi

# Create backup
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --verbose > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Display backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
    
    # List recent backups
    echo ""
    echo "📋 Recent backups:"
    ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | tail -5 || echo "No previous backups found"
    
else
    echo "❌ Backup failed"
    exit 1
fi