#!/usr/bin/env node

/**
 * MoodOverMuscle Complete Setup Verification
 * Verifies that the entire development environment is working correctly
 */

const { PrismaClient } = require('../lib/generated/prisma');

async function verifyCompleteSetup() {
    console.log('🔍 Verifying MoodOverMuscle development setup...\n');

    const prisma = new PrismaClient({
        log: ['error'],
    });

    let allChecks = [];

    try {
        // 1. Database Connection
        console.log('1. ✅ Database Connection');
        await prisma.$connect();
        console.log('   Connected to PostgreSQL successfully\n');
        allChecks.push({ name: 'Database Connection', status: 'PASS' });

        // 2. Schema Verification
        console.log('2. ✅ Database Schema');
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;
        
        const expectedTables = ['Booking'];
        const foundTables = tables.map(t => t.table_name);
        
        console.log('   Expected tables:', expectedTables.join(', '));
        console.log('   Found tables:', foundTables.join(', '));
        
        const hasAllTables = expectedTables.every(table => 
            foundTables.some(found => found.toLowerCase() === table.toLowerCase())
        );
        
        if (hasAllTables) {
            console.log('   ✅ All required tables present\n');
            allChecks.push({ name: 'Database Schema', status: 'PASS' });
        } else {
            console.log('   ⚠️  Some tables missing - run npm run db:setup\n');
            allChecks.push({ name: 'Database Schema', status: 'WARNING' });
        }

        // 3. Prisma Client
        console.log('3. ✅ Prisma Client');
        try {
            const bookingCount = await prisma.booking.count();
            console.log(`   Bookings: ${bookingCount}`);
            console.log('   ✅ Prisma client working correctly\n');
            allChecks.push({ name: 'Prisma Client', status: 'PASS' });
        } catch (error) {
            console.log('   ❌ Prisma client error:', error.message);
            allChecks.push({ name: 'Prisma Client', status: 'FAIL' });
        }

        // 4. Data Persistence Test
        console.log('4. ✅ Data Persistence');
        if (await prisma.booking.count() > 0) {
            const latestBooking = await prisma.booking.findFirst({
                orderBy: { createdAt: 'desc' },
                select: {
                    name: true,
                    email: true,
                    createdAt: true,
                    status: true
                }
            });
            console.log(`   Latest booking: ${latestBooking.name} (${latestBooking.email})`);
            console.log(`   Created: ${latestBooking.createdAt}`);
            console.log(`   Status: ${latestBooking.status}`);
            console.log('   ✅ Booking data persisted successfully\n');
            allChecks.push({ name: 'Data Persistence', status: 'PASS' });
        } else {
            console.log('   ℹ️  No bookings found - create a test booking to verify persistence\n');
            allChecks.push({ name: 'Data Persistence', status: 'INFO' });
        }

        // 5. Environment Configuration  
        console.log('5. ✅ Environment Configuration');
        const requiredEnvVars = ['DATABASE_URL'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length === 0) {
            console.log('   All required environment variables present');
            allChecks.push({ name: 'Environment Configuration', status: 'PASS' });
        } else {
            console.log('   ⚠️  Missing environment variables:', missingVars.join(', '));
            console.log('   Check your .env.local file');
            allChecks.push({ name: 'Environment Configuration', status: 'WARNING' });
        }

    } catch (error) {
        console.error('❌ Setup verification failed:', error.message);
        allChecks.push({ name: 'Overall Setup', status: 'FAIL' });
    } finally {
        await prisma.$disconnect();
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 SETUP VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    
    allChecks.forEach(check => {
        const icon = check.status === 'PASS' ? '✅' : 
                    check.status === 'WARNING' ? '⚠️' : 
                    check.status === 'INFO' ? 'ℹ️' : '❌';
        console.log(`${icon} ${check.name}: ${check.status}`);
    });

    const passCount = allChecks.filter(c => c.status === 'PASS').length;
    const totalCount = allChecks.length;
    
    console.log('\n🎯 Score:', `${passCount}/${totalCount} checks passed`);
    
    if (passCount === totalCount) {
        console.log('🎉 All systems operational! MoodOverMuscle is ready for development.');
        console.log('\n📚 Next steps:');
        console.log('   • Start development: npm run dev');
        console.log('   • Access Prisma Studio: npx prisma studio');
        console.log('   • View admin dashboard: http://localhost:3000/admin');
    } else {
        console.log('⚠️  Some issues need attention. Please review the failed checks above.');
    }
    
    return passCount === totalCount;
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
    process.exit(1);
});

// Run verification
verifyCompleteSetup().then(success => {
    process.exit(success ? 0 : 1);
});