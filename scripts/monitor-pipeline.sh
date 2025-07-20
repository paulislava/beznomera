#!/bin/bash

# Упрощенный скрипт для мониторинга пайплайна
# Использование: ./scripts/monitor-pipeline.sh

set -e

# Параметры
OWNER="paulislava"
REPO="beznomera"
WORKFLOW_ID="dev.yml"

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функция для озвучивания
say_message() {
    local message="$1"
    echo -e "${BLUE}🔊 $message${NC}"
    say "$message" 2>/dev/null || echo "say command not available"
}

# Запускаем мониторинг
echo -e "${BLUE}🚀 Запускаем мониторинг пайплайна...${NC}"
say_message "Отслеживание пайплайна начато"

# Запускаем основной скрипт мониторинга
if [[ -f "scripts/pipeline-monitor.sh" ]]; then
    chmod +x scripts/pipeline-monitor.sh
    ./scripts/pipeline-monitor.sh "$OWNER" "$REPO" "$WORKFLOW_ID"
else
    echo -e "${RED}❌ Скрипт мониторинга не найден${NC}"
    exit 1
fi 