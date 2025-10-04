# Pattern: Local Development Environment Setup

**Complexity**: Medium (3-5 files, 2-8 hours)
**Files Affected**: 8-10 configuration files, scripts, and documentation
**Prerequisites**: Docker, Node.js, npm, understanding of PostgreSQL
**Use Cases**: When setting up persistent local development with Docker PostgreSQL, Prisma ORM, and Next.js application

## Implementation Steps

### 1. Docker Infrastructure Setup

Create `docker-compose.yml` with PostgreSQL 15 configuration:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: moodovermuscle-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: moodovermuscle_dev
      POSTGRES_USER: moodovermuscle
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/postgres-init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U moodovermuscle -d moodovermuscle_dev"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:
```

### 2. Environment Configuration

Update `.env` with local database URL:
```bash
# Local Development Database
DATABASE_URL="postgresql://moodovermuscle:secure_password@localhost:5432/moodovermuscle_dev"
```

Create `.env.local` with complete development environment:
```bash
# Local Development Environment Configuration
DATABASE_URL="postgresql://moodovermuscle:secure_password@localhost:5432/moodovermuscle_dev"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
JWT_SECRET="your-super-secure-jwt-secret-key-for-development-only"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-for-development"
NODE_ENV="development"
```

### 3. Database Initialization Script

Create `scripts/postgres-init.sql`:
```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database health check function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS text AS $$
BEGIN
    RETURN 'PostgreSQL is ready for connections';
END;
$$ LANGUAGE plpgsql;

-- Create development-specific tables for testing
CREATE TABLE IF NOT EXISTS public.dev_setup_verification (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'initialized'
);

INSERT INTO public.dev_setup_verification (status) VALUES ('database_ready');
```

### 4. Database Management Scripts

Create `scripts/backup-database.sh`:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

docker exec moodovermuscle-postgres pg_dump -U moodovermuscle -d moodovermuscle_dev > "backups/${BACKUP_FILE}"
echo "Database backed up to backups/${BACKUP_FILE}"
```

Create `scripts/restore-database.sh`:
```bash
#!/bin/bash
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

docker exec -i moodovermuscle-postgres psql -U moodovermuscle -d moodovermuscle_dev < "$BACKUP_FILE"
echo "Database restored from $BACKUP_FILE"
```

### 5. Connection Testing Script

Update `scripts/test-db-connection.js` for custom Prisma client path:
```javascript
const { PrismaClient } = require('../lib/generated/prisma');

async function testConnection() {
    const prisma = new PrismaClient();
    
    try {
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connection successful');
        
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query test passed:', result);
        
        await prisma.$disconnect();
        console.log('✅ Database disconnection successful');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
```

### 6. Setup Verification Script

Create `scripts/verify-setup.js`:
```javascript
const { PrismaClient } = require('../lib/generated/prisma');
const { exec } = require('child_process');

async function verifySetup() {
    console.log('🔍 Verifying local development setup...\n');
    
    // Test 1: Database Connection
    console.log('Test 1: Database Connection');
    const prisma = new PrismaClient();
    
    try {
        await prisma.$connect();
        console.log('✅ Database connection: PASS');
    } catch (error) {
        console.log('❌ Database connection: FAIL -', error.message);
        return;
    }
    
    // Test 2: Database Schema
    console.log('\nTest 2: Database Schema');
    try {
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('✅ Database schema: PASS -', tables.length, 'tables found');
    } catch (error) {
        console.log('❌ Database schema: FAIL -', error.message);
    }
    
    // Test 3: Prisma Client
    console.log('\nTest 3: Prisma Client');
    try {
        const userCount = await prisma.user.count();
        console.log('✅ Prisma client: PASS - User table accessible, count:', userCount);
    } catch (error) {
        console.log('❌ Prisma client: FAIL -', error.message);
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Setup verification complete!');
}

verifySetup();
```

### 7. NPM Scripts Integration

Add to `package.json`:
```json
{
  "scripts": {
    "dev:start": "npm run db:start && npm run dev",
    "db:start": "docker-compose up -d",
    "db:stop": "docker-compose down",
    "db:setup": "docker-compose up -d && npx prisma migrate deploy && npx prisma generate",
    "db:studio": "npx prisma studio",
    "db:reset": "npx prisma migrate reset --force && npx prisma generate",
    "db:backup": "./scripts/backup-database.sh",
    "db:restore": "./scripts/restore-database.sh",
    "db:test-connection": "node scripts/test-db-connection.js",
    "setup:verify": "node scripts/verify-setup.js"
  }
}
```

### 8. Migration Fix for Development

Fix existing migrations by removing `CONCURRENTLY` from index creation:
```sql
-- Before
CREATE INDEX CONCURRENTLY "Booking_datetime_serviceId_idx" ON "Booking"("datetime", "serviceId");

-- After  
CREATE INDEX "Booking_datetime_serviceId_idx" ON "Booking"("datetime", "serviceId");
```

### 9. Comprehensive Documentation

Create `.docs/local-development-setup.md` with:
- Complete installation procedures
- Daily development workflow
- Troubleshooting common issues  
- Database backup/restore procedures
- Environment configuration guide
- Performance optimization tips

## Testing Strategy

### Connection Testing
```bash
# Test database connectivity
npm run db:test-connection

# Verify complete setup
npm run setup:verify
```

### End-to-End Functionality Testing
1. Start development environment: `npm run dev:start`
2. Navigate to booking form: `http://localhost:3000`
3. Submit test booking with valid data
4. Verify booking appears in admin dashboard
5. Check database persistence with Prisma Studio
6. Test container restart persistence

### Data Persistence Verification
```bash
# Create test booking
# Stop containers
docker-compose down

# Restart containers  
docker-compose up -d

# Verify data still exists
npm run setup:verify
```

## Common Pitfalls

### Environment Variable Precedence
- **Issue**: `.env` file overriding `.env.local` values
- **Solution**: Update `.env` with local database URL or ensure `.env.local` loads first

### Migration Transaction Conflicts
- **Issue**: `CREATE INDEX CONCURRENTLY` fails in migration transactions
- **Solution**: Remove `CONCURRENTLY` keyword for development migrations

### Prisma Client Import Path Issues
- **Issue**: Scripts fail to import Prisma client from custom location
- **Solution**: Update import paths to use `../lib/generated/prisma`

### Docker Permission Issues
- **Issue**: Database initialization files can't be executed
- **Solution**: Ensure proper file permissions on init scripts (`chmod +x`)

### Port Conflicts
- **Issue**: PostgreSQL port 5432 already in use
- **Solution**: Stop existing PostgreSQL services or use different port mapping

## Performance Considerations

- Use persistent Docker volumes for data storage
- Configure PostgreSQL shared_buffers for development workload
- Enable connection pooling in production-like scenarios
- Use indexes appropriate for development vs production data volumes

## Security Implications

- Development credentials should never be used in production
- Use environment-specific JWT secrets
- Implement proper database user permissions even in development
- Regular backup procedures to prevent data loss during development

## Related Patterns

- [Database Operations](./db-connection-pool-pattern.md) - Production database configuration
- [Testing Approaches](./test-integration-pattern.md) - Database testing patterns
- [Environment Configuration](./env-configuration-pattern.md) - Multi-environment setup
- [Docker Workflow](./docker-development-workflow-pattern.md) - Container orchestration patterns

## Success Metrics

- Zero-friction daily development startup (< 30 seconds)
- 100% data persistence across container restarts
- Consistent environment across development team
- Automated verification of setup completeness
- Clear troubleshooting path for common issues

## Dependencies

- Docker and Docker Compose
- Node.js 18+ 
- PostgreSQL client tools (optional, for manual operations)
- Prisma CLI
- Project-specific environment configuration

This pattern ensures reliable, persistent local development environment setup with comprehensive verification, troubleshooting procedures, and automated workflows for daily development tasks.