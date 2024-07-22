#!/bin/bash

psql --username postgres --no-password <<-EOSQL
    CREATE ROLE lizmap WITH LOGIN CREATEDB PASSWORD 'lizmap1234!';
    CREATE DATABASE lizmap WITH OWNER lizmap;
EOSQL

psql --username postgres --no-password -d lizmap <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL
