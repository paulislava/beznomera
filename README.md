## Локально

# Сборка бэкенда
docker build --target backend --rm -t beznomera:backend .

# Запуск контейнера бэкенда
docker run -it --add-host database:host-gateway -p 3000:3000 -v /Users/20643553/Desktop/beznomera/packages/backend/config.yaml:/config.yaml beznomera:backend

# Сборка фронтенда
frontend_backend_url=http://127.0.0.1:3000 telegram_bot_name=beznomera_bot docker build --rm --target frontend -t beznomera:frontend .

# Запуск контейнера фронтенда
docker run -it -p 80:80 beznomera:frontend

## На сервере


# Сборка бэкенда
sudo docker build --target backend --no-cache --rm -t beznomera:backend https://github.com/paulislava/beznomera.git

# Запуск контейнера бэкенда
sudo docker run -d -it --network host -v /home/admin/web/beznomera.paulislava.space/config-backend.yaml:/config.yaml -e ROUTE_PREFIX=/api beznomera:backend

# Сборка фронтенда
sudo frontend_backend_url=/api telegram_bot_name=beznomera_bot docker build --rm -f frontend.Dockerfile -t beznomera:frontend https://github.com/paulislava/beznomera.git

# Запуск контейнера фронтенда
sudo docker run -it -d -p 4000:80 beznomera:frontend

