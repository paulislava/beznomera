#!/bin/sh

set -e

source .env

SERVICE_NAME=database
DUMP_FILE=dumps/prod.sql

touch $DUMP_FILE

echo Starting container...

docker-compose up --detach $SERVICE_NAME 

echo Creating dump...

docker-compose exec $SERVICE_NAME pg_dump --dbname=postgresql://$DATABASE_USER_PROM:$DATABASE_PASSWORD_PROM@$DATABASE_HOST_PROM:$DATABASE_PORT_PROM/$DATABASE_NAME_PROM --format=p --clean --if-exists --verbose --schema=public > $DUMP_FILE 

echo Dump created

echo Restoring dump to local base...

PGPASSWORD=$DATABASE_PASSWORD docker-compose exec -T $SERVICE_NAME psql -v ON_ERROR_STOP=1 --single-transaction --username=$DATABASE_USER --dbname=$DATABASE_NAME < $DUMP_FILE

echo Profit!