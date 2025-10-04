-- PostgreSQL initialization script for MoodOverMuscle development database
-- This script runs automatically when the container starts for the first time

-- Create development database if it doesn't exist
SELECT 'CREATE DATABASE moodovermuscle_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moodovermuscle_dev')\gexec

-- Grant all privileges to the moodovermuscle user
GRANT ALL PRIVILEGES ON DATABASE moodovermuscle_dev TO moodovermuscle;

-- Connect to the development database
\c moodovermuscle_dev;

-- Enable pg_stat_statements extension for performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create a function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Connection Test'::TEXT,
        'OK'::TEXT,
        'Database is accessible'::TEXT
    UNION ALL
    SELECT 
        'Extensions'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN 'OK'::TEXT ELSE 'WARNING'::TEXT END,
        'pg_stat_statements: ' || CASE WHEN COUNT(*) > 0 THEN 'enabled' ELSE 'disabled' END
    FROM pg_extension WHERE extname = 'pg_stat_statements';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the health check function
GRANT EXECUTE ON FUNCTION check_database_health() TO moodovermuscle;

-- Create a development-only table for testing (will be removed by Prisma migrations)
CREATE TABLE IF NOT EXISTS _dev_setup_check (
    id SERIAL PRIMARY KEY,
    setup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT DEFAULT 'Database initialization successful'
);

INSERT INTO _dev_setup_check (message) VALUES ('PostgreSQL setup completed successfully');