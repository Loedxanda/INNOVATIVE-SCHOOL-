-- Initialize the database with PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Create a schema for the school management system
CREATE SCHEMA IF NOT EXISTS school_management;

-- Set the search path to include our schema
ALTER DATABASE innovative_school SET search_path TO school_management, public;

