# MoodOverMuscle Local Development Setup

Complete guide for setting up a production-ready local development environment with persistent PostgreSQL database.

## Quick Start

```bash
# 1. Clone and install dependencies
npm install

# 2. Start PostgreSQL database
docker-compose up -d

# 3. Set up database schema
npm run db:setup

# 4. Start development server
npm run dev
```

## Prerequisites

- **Node.js 18+**: Required for Next.js 14
- **Docker & Docker Compose**: For PostgreSQL database
- **Git**: For version control

## Database Setup

### PostgreSQL with Docker

The project uses Docker Compose for a persistent PostgreSQL 15 database that maintains data between development sessions.

**Key Features**:
- PostgreSQL 15 with persistent volumes
- Automatic database creation
- Health checks and restart policies
- Isolated development environment
- Production-like behavior

### Environment Configuration

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Database connection** (already configured):
   ```env
   DATABASE_URL="postgresql://moodovermuscle:secure_password@localhost:5432/moodovermuscle_dev"
   ```

3. **Admin authentication**:
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password_here
   ```

4. **JWT secret** (generate new):
   ```bash
   openssl rand -base64 32
   ```

## Complete Setup Process

### Step 1: Database Infrastructure

Start the PostgreSQL container:
```bash
docker-compose up -d
```

This creates:
- PostgreSQL 15 container with persistent data volume
- Database: `moodovermuscle_dev`
- User: `moodovermuscle` with full permissions
- Port: 5432 (exposed to localhost)

### Step 2: Schema Initialization

Set up Prisma database schema:
```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### Step 3: Development Server

Start Next.js development server:
```bash
npm run dev
```

Access points:
- **Main site**: http://localhost:3000
- **Admin dashboard**: http://localhost:3000/admin
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

## Daily Development Workflow

### Starting Development
```bash
# Single command startup
npm run dev:start
```

This script:
1. Starts PostgreSQL if not running
2. Runs database migrations
3. Starts development server

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (development only)
npm run db:reset

# Create new migration
npx prisma migrate dev --name feature_name

# View database logs
docker-compose logs postgres
```

### Stopping Development
```bash
# Stop development server: Ctrl+C

# Stop database (data persists)
docker-compose stop

# Stop and remove containers (data persists in volumes)
docker-compose down
```

## Verification & Testing

### Test Database Connection
```bash
# Check container status
docker-compose ps

# Test database connection
npm run db:test-connection
```

### Test Booking Persistence

1. **Create a booking** via the booking form at http://localhost:3000
2. **Verify in admin dashboard** at http://localhost:3000/admin/bookings
3. **Check in Prisma Studio** at http://localhost:5555
4. **Restart containers** and verify data persists

### Example Test Booking
- **Service**: Personal Training Session
- **Date**: August 11th, 2024
- **Time**: 10:00 AM
- **Client**: Test User (test@example.com)

## Data Persistence

### Database Volumes
```yaml
# Docker volume for persistent data
volumes:
  postgres_data:
    driver: local
```

**Location**: Docker manages volume storage automatically
**Persistence**: Data survives container restarts, rebuilds, and system reboots
**Backup**: Use `npm run db:backup` for manual backups

### Backup & Restore

#### Create Backup
```bash
# Create timestamped backup
npm run db:backup

# Manual backup
docker exec moodovermuscle_postgres pg_dump -U moodovermuscle moodovermuscle_dev > backup.sql
```

#### Restore Backup
```bash
# Restore from backup file
npm run db:restore backup.sql

# Manual restore
docker exec -i moodovermuscle_postgres psql -U moodovermuscle -d moodovermuscle_dev < backup.sql
```

## Troubleshooting

### Database Connection Issues

**Problem**: `ECONNREFUSED` error connecting to PostgreSQL
```bash
# Check if container is running
docker-compose ps

# Check container logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**Problem**: Database exists but schema is outdated
```bash
# Apply pending migrations
npx prisma migrate deploy

# Or reset development database
npm run db:reset
```

### Port Conflicts

**Problem**: Port 5432 already in use
```bash
# Find process using port
lsof -i :5432

# Stop existing PostgreSQL service
sudo systemctl stop postgresql

# Or change port in docker-compose.yml
```

### Container Issues

**Problem**: Docker container won't start
```bash
# Remove containers and volumes (CAUTION: destroys data)
docker-compose down -v

# Rebuild containers
docker-compose up -d --build
```

**Problem**: Permission denied errors
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

### Prisma Issues

**Problem**: Prisma client out of sync
```bash
# Regenerate Prisma client
npx prisma generate

# Reset and regenerate
npx prisma migrate reset
```

**Problem**: Migration conflicts
```bash
# View migration status
npx prisma migrate status

# Resolve conflicts manually or reset
npx prisma migrate resolve --applied "migration_name"
```

## Development Scripts Reference

```json
{
  "dev": "next dev",
  "dev:start": "docker-compose up -d && npx prisma migrate deploy && npm run dev",
  "db:setup": "npx prisma generate && npx prisma migrate deploy && npx prisma db seed",
  "db:studio": "npx prisma studio",
  "db:reset": "npx prisma migrate reset --force",
  "db:backup": "scripts/backup-database.sh",
  "db:restore": "scripts/restore-database.sh",
  "db:test-connection": "node scripts/test-db-connection.js"
}
```

## Resource Management

### Docker Resources
- **CPU**: ~0.1 CPU cores for PostgreSQL
- **Memory**: ~128MB RAM for PostgreSQL container
- **Disk**: ~100MB for container, variable for data

### Storage Monitoring
```bash
# View Docker space usage
docker system df

# View specific volume size
docker volume inspect moodovermuscle_postgres_data

# Clean unused Docker resources
docker system prune
```

## Security Considerations

### Development Security
- Database runs on localhost only (not exposed externally)
- Strong password for database user
- JWT secret properly configured
- Admin credentials secured in environment variables

### Production Readiness
- Environment variables properly configured
- Database migrations tested
- Backup procedures documented
- Health checks implemented

## Performance Optimization

### Database Performance
- Connection pooling via Prisma
- Proper indexing on booking date/time fields
- Query optimization for admin dashboard
- Regular VACUUM operations (automatic)

### Development Performance
- Hot reloading enabled
- Prisma query caching
- Docker layer caching
- Efficient watch patterns

## Integration with Existing Tests

The setup works seamlessly with existing test infrastructure:

```bash
# Run tests with development database
npm run test

# Run integration tests
npm run test:integration

# Test specific database functionality
npm run test:db
```

## Conclusion

This setup provides:
- ✅ Zero external connectivity required after initial setup
- ✅ Data persistence between development sessions  
- ✅ Production-like PostgreSQL behavior
- ✅ Easy daily startup: `docker-compose up -d && npm run dev`
- ✅ Complete troubleshooting procedures
- ✅ Resource management and optimization
- ✅ Backup/restore capabilities

The environment is now ready for reliable local development with persistent data storage and production-like database behavior.