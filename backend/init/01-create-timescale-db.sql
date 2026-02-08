-- Create the 'timescale' database if it doesn't exist
-- This is needed for TimescaleDB internal processes that expect a database
-- with the same name as the user
DO $$ BEGIN IF NOT EXISTS (
    SELECT
    FROM pg_database
    WHERE datname = 'timescale'
) THEN CREATE DATABASE timescale;
END IF;
END $$;
-- Grant privileges to the timescale user
GRANT ALL PRIVILEGES ON DATABASE timescale TO timescale;