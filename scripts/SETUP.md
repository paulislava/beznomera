# Настройка системы мониторинга пайплайна

## Быстрая настройка

### 1. Установка GitHub CLI
```bash
# macOS
brew install gh

# Авторизация
gh auth login
```

### 2. Проверка установки
```bash
# Проверка GitHub CLI
gh auth status

# Тест уведомлений
./scripts/test-monitor.sh
```

### 3. Настройка автоматического запуска
```bash
# Делаем скрипты исполняемыми
chmod +x scripts/*.sh
chmod +x .git/hooks/post-push

# Проверяем Git hook
ls -la .git/hooks/post-push
```

## Проверка работоспособности

### Тест уведомлений
```bash
./scripts/test-monitor.sh
```
Должны прозвучать все уведомления через `say`.

### Тест мониторинга (требует реального workflow)
```bash
./scripts/monitor-pipeline.sh
```

## Автоматический запуск

После настройки мониторинг будет автоматически запускаться после каждого `git push`:

```bash
git add .
git commit -m "feat: add pipeline monitoring"
git push origin master
# Мониторинг запустится автоматически
```

## Устранение проблем

### Ошибка "say command not available"
- Команда `say` доступна только в macOS
- На других системах уведомления будут только в терминале

### Ошибка "GitHub CLI не установлен"
```bash
brew install gh
gh auth login
```

### Ошибка "Не авторизован в GitHub CLI"
```bash
gh auth login
```

### Git hook не работает
```bash
# Проверяем права
ls -la .git/hooks/post-push

# Делаем исполняемым
chmod +x .git/hooks/post-push
```

## Ручной запуск

Если автоматический запуск не работает, используйте ручной запуск:

```bash
# Быстрый запуск
./scripts/monitor-pipeline.sh

# Полный контроль
./scripts/pipeline-monitor.sh paulislava beznomera dev.yml
```

## Логи

Логи мониторинга сохраняются в `/tmp/pipeline-monitor.log` при запуске через Git hook.

## Настройка для других репозиториев

Для использования с другими репозиториями измените параметры в `scripts/monitor-pipeline.sh`:

```bash
OWNER="your-username"
REPO="your-repo"
WORKFLOW_ID="your-workflow.yml"
``` 