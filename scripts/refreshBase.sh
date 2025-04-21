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

npm run db:restore
# docker-compose exec -T $SERVICE_NAME pg_restore --dbname=postgresql://$DATABASE_USERNAME:$DATABASE_PASSWORD@localhost/$DATABASE_NAME < $DUMP_FILE

echo Profit!