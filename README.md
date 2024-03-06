
# Сборка бэкенда
docker build --target backend -t beznomera:backend .

# Запуск контейнера бэкенда
docker run -it --add-host database:host-gateway -p 3000:3000 -e EXPO_PUBLIC_BACKEND_URL=/ap
i -v /Users/20643553/Desktop/beznomera/packages/backend/config.yaml:/config.yaml beznomera:backend

# Сборка фронтенда
frontend_backend_url=http://127.0.0.1:3000 telegram_bot_name=beznomera_bot docker build --target frontend -t beznomera:frontend .

# Запуск контейнера фронтенда
docker run -it -p 80:80 beznomera:frontend

