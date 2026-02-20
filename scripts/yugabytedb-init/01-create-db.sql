-- Create ilhrf_data_collection database if it does not exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ilhrf_data_collection') THEN
    CREATE DATABASE ilhrf_data_collection;
  END IF;
END
$$;
