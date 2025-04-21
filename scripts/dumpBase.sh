#!/bin/sh

set -e

source .env

SERVICE_NAME=database
DUMP_FILE=dumps/dump-local.sql

touch $DUMP_FILE

echo Starting container...

docker-compose up --detach $SERVICE_NAME 

echo Creating dump...

docker-compose exec $SERVICE_NAME pg_dump --dbname=postgresql://$DATABASE_USERNAME:$DATABASE_PASSWORD@localhost/$DATABASE_NAME --format=p --clean --verbose --if-exists --schema=public > $DUMP_FILE 

echo Dump created

echo Profit!