#!/usr/bin/env node

/**
 * MoodOverMuscle Database Connection Test
 * Tests the PostgreSQL database connection and basic functionality
 */

const { PrismaClient } = require('../lib/generated/prisma');

async function testDatabaseConnection() {
    console.log('🔗 Testing database connection...\n');

    const prisma = new PrismaClient({
        log: ['error', 'warn'],
    });

    try {
        // Test basic connection
        console.log('1. Testing basic connection...');
        await prisma.$connect();
        console.log('   ✅ Connected to database successfully\n');

        // Test database query
        console.log('2. Testing database query...');
        const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as postgres_version`;
        console.log(`   ✅ Query successful`);
        console.log(`   📅 Current time: ${result[0].current_time}`);
        console.log(`   🐘 PostgreSQL version: ${result[0].postgres_version.split(' ')[0]}\n`);

        // Test table existence (if schema is deployed)
        console.log('3. Testing schema tables...');
        try {
            const tables = await prisma.$queryRaw`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            `;
            
            if (tables.length > 0) {
                console.log('   ✅ Schema tables found:');
                tables.forEach(table => {
                    console.log(`   📋 ${table.table_name}`);
                });
            } else {
                console.log('   ⚠️  No schema tables found - run "npm run db:setup" to initialize');
            }
        } catch (error) {
            console.log('   ⚠️  Could not check schema tables - this is normal for a fresh setup');
        }

        console.log('\n4. Testing Prisma client...');
        
        // Test if we can get a count from User table (if it exists)
        try {
            const userCount = await prisma.user.count();
            console.log(`   ✅ User table accessible (${userCount} users)`);
        } catch (error) {
            console.log('   ⚠️  User table not accessible - schema may need to be deployed');
        }

        // Test if we can get a count from Booking table (if it exists)  
        try {
            const bookingCount = await prisma.booking.count();
            console.log(`   ✅ Booking table accessible (${bookingCount} bookings)`);
        } catch (error) {
            console.log('   ⚠️  Booking table not accessible - schema may need to be deployed');
        }

        console.log('\n🎉 Database connection test completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   • If schema tables are missing, run: npm run db:setup');
        console.log('   • Start development server: npm run dev');
        console.log('   • Access Prisma Studio: npx prisma studio');

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`   Error: ${error.message}`);
        console.error('\n🔧 Troubleshooting steps:');
        console.error('   1. Check if PostgreSQL container is running: docker-compose ps');
        console.error('   2. Start the database: docker-compose up -d');
        console.error('   3. Check container logs: docker-compose logs postgres');
        console.error('   4. Verify DATABASE_URL in .env.local');
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
    process.exit(1);
});

// Run the test
testDatabaseConnection();