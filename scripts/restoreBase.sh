#!/bin/sh

set -e

source .env

SERVICE_NAME=database
DUMP_FILE=dumps/prod.sql

echo Starting container...

docker-compose up --detach $SERVICE_NAME 

echo Creating dump...

echo Restoring dump to local base...

PGPASSWORD=$DATABASE_PASSWORD docker-compose exec -T $SERVICE_NAME psql -v ON_ERROR_STOP=1 --single-transaction --username=$DATABASE_USER --dbname=$DATABASE_NAME < $DUMP_FILE

echo Profit!