#!/bin/bash

# MoodOverMuscle Database Restore Script
# Restores database from backup file

set -e

# Configuration
CONTAINER_NAME="moodovermuscle_postgres"
DB_NAME="moodovermuscle_dev"
DB_USER="moodovermuscle"
BACKUP_DIR="./backups"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide backup file name"
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/*.sql 2>/dev/null || echo "No backup files found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found"
    echo "Checked locations:"
    echo "  - $BACKUP_DIR/$BACKUP_FILE"
    echo "  - $BACKUP_FILE"
    exit 1
fi

# Use full path if file exists in backup directory
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

echo "🔄 Restoring database from backup..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: PostgreSQL container '$CONTAINER_NAME' is not running"
    echo "Start it with: docker-compose up -d"
    exit 1
fi

# Warning about data loss
echo "⚠️  WARNING: This will completely replace the current database!"
echo "All existing data will be lost."
read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Create backup of current database before restore
echo "📦 Creating backup of current database before restore..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CURRENT_BACKUP="moodovermuscle_before_restore_${TIMESTAMP}.sql"
mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges > "$BACKUP_DIR/$CURRENT_BACKUP"

echo "✅ Current database backed up to: $BACKUP_DIR/$CURRENT_BACKUP"

# Restore from backup
echo "🔄 Restoring database..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully from $BACKUP_FILE"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Run 'npx prisma generate' to update Prisma client"
    echo "2. Run 'npx prisma migrate deploy' to apply any pending migrations"
    echo "3. Restart your development server if needed"
else
    echo "❌ Restore failed"
    echo "💡 You can restore the previous state using: $BACKUP_DIR/$CURRENT_BACKUP"
    exit 1
fi