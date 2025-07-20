## Локально

Запуск: docker-compose up

# Сборка бэкенда
docker build --target backend --rm -t beznomera:backend .

# Запуск контейнера бэкенда
docker run -it --add-host database:host-gateway -p 3000:3000 -v /Users/20643553/Desktop/beznomera/packages/backend/config.yaml:/config.yaml beznomera:backend

# Сборка фронтенда
frontend_backend_url=http://127.0.0.1:3000 telegram_bot_name=beznomera_bot docker build --rm -f frontend.Dockerfile -t beznomera:frontend .

# Запуск контейнера фронтенда
docker run -it -p 80:80 beznomera:frontend

## На сервере


# Сборка бэкенда
sudo docker build --target backend --no-cache --rm -t beznomera:backend https://github.com/paulislava/beznomera.git

# Запуск контейнера бэкенда
sudo docker run -d -it --network host -v /home/user/web/beznomera.paulislava.space/config-backend.yaml:/config.yaml -e ROUTE_PREFIX=/api beznomera:backend

# Сборка фронтенда
sudo frontend_backend_url=/api telegram_bot_name=beznomera_bot docker build --no-cache --rm -f frontend.Dockerfile -t beznomera:frontend https://github.com/paulislava/beznomera.git

# Запуск контейнера фронтенда
sudo docker run -it -d -p 4000:80 beznomera:frontend

# Запуск postgres

docker run -d --name postgres -p 5432:5432 -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=somepassword postgres:16.1

## Мониторинг пайплайна

### Автоматическое отслеживание
После каждого push автоматически запускается мониторинг GitHub Actions пайплайна с озвучиванием уведомлений.

### Ручной запуск мониторинга
```bash
# Быстрый запуск
./scripts/monitor-pipeline.sh

# Полный контроль параметров
./scripts/pipeline-monitor.sh paulislava beznomera dev.yml

# Тестирование уведомлений
./scripts/test-monitor.sh
```

### Уведомления
- "Отслеживание пайплайна начато" - при запуске
- "НАЗВАНИЕ_ДЖОБЫ успешно завершена" - при успехе
- "НАЗВАНИЕ_ДЖОБЫ завершена с ошибкой" - при ошибке
- "Весь пайплайн успешно завершен" - при успешном завершении

### Требования
- GitHub CLI (gh) установлен и авторизован
- Команда `say` доступна (встроена в macOS)
- Права на чтение GitHub Actions API

Подробная документация: [scripts/README.md](scripts/README.md)