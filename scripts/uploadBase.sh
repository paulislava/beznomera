#!/bin/sh

set -e

source .env

SERVICE_NAME=database
DUMP_FILE=dumps/local.sql

touch $DUMP_FILE

echo Starting container...

docker-compose up --detach $SERVICE_NAME 

echo Uploading dump to production base...

docker-compose exec -T $SERVICE_NAME psql --username=$DATABASE_USER --dbname=postgresql://$DATABASE_USER_PROM:$DATABASE_PASSWORD_PROM@$DATABASE_HOST_PROM:$DATABASE_PORT_PROM/$DATABASE_NAME_PROM < $DUMP_FILE

echo Dump uploaded

echo Profit!