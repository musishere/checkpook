-- This cleans the database completely
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- These lines are MUST for Supabase
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
