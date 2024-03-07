## Локально

# Сборка бэкенда
docker build --target backend -t beznomera:backend .

# Запуск контейнера бэкенда
docker run -it --add-host database:host-gateway -p 3000:3000 -v /Users/20643553/Desktop/beznomera/packages/backend/config.yaml:/config.yaml beznomera:backend

# Сборка фронтенда
frontend_backend_url=http://127.0.0.1:3000 telegram_bot_name=beznomera_bot docker build --target frontend -t beznomera:frontend .

# Запуск контейнера фронтенда
docker run -it -p 80:80 beznomera:frontend

## На сервере


# Сборка бэкенда
sudo docker build --target backend -t beznomera:backend https://github.com/paulislava/beznomera.git

# Запуск контейнера бэкенда
sudo docker run -it --network host -v /home/admin/web/beznomera.paulislava.space/config-backend.yaml:/config.yaml beznomera:backend

# Сборка фронтенда
frontend_backend_url=http://127.0.0.1:3000 telegram_bot_name=beznomera_bot docker build --target frontend -t beznomera:frontend https://github.com/paulislava/beznomera.git

# Запуск контейнера фронтенда
docker run -it -p 80:80 beznomera:frontend:latest

