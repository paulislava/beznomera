#!/bin/sh

set -e

source .env

SERVICE_NAME=database
DUMP_FILE=dumps/prod.sql

echo Starting container...

docker-compose up --detach $SERVICE_NAME 

echo "Dropping public schema..."

PGPASSWORD=$DATABASE_PASSWORD docker-compose exec -T $SERVICE_NAME psql -v ON_ERROR_STOP=1 --username=$DATABASE_USER --dbname=$DATABASE_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Restoring dump to local base..."

PGPASSWORD=$DATABASE_PASSWORD docker-compose exec -T $SERVICE_NAME psql -v ON_ERROR_STOP=1 --single-transaction --username=$DATABASE_USER --dbname=$DATABASE_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

PGPASSWORD=$DATABASE_PASSWORD docker-compose exec -T $SERVICE_NAME psql -v ON_ERROR_STOP=1 --single-transaction --username=$DATABASE_USER --dbname=$DATABASE_NAME < $DUMP_FILE

# docker-compose exec -T $SERVICE_NAME pg_restore --dbname=postgresql://$DATABASE_USERNAME:$DATABASE_PASSWORD@localhost/$DATABASE_NAME < $DUMP_FILE

echo Profit!