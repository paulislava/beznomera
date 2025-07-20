#!/bin/bash

# Тестовый скрипт для проверки функциональности мониторинга
# Демонстрирует работу уведомлений без реального API вызова

set -e

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Функция для озвучивания
say_message() {
    local message="$1"
    echo -e "${BLUE}🔊 $message${NC}"
    say "$message" 2>/dev/null || echo "say command not available"
}

echo -e "${BLUE}🧪 Тестируем функциональность мониторинга пайплайна...${NC}"

# Тест 1: Запуск мониторинга
echo -e "${YELLOW}📋 Тест 1: Запуск мониторинга${NC}"
say_message "Отслеживание пайплайна начато"
sleep 2

# Тест 2: Успешные джобы
echo -e "${YELLOW}📋 Тест 2: Успешные джобы${NC}"
say_message "build-backend успешно завершена"
sleep 1
say_message "build-frontend успешно завершена"
sleep 1
say_message "build-web успешно завершена"
sleep 1
say_message "clean успешно завершена"
sleep 2

# Тест 3: Ошибки в джобах
echo -e "${YELLOW}📋 Тест 3: Ошибки в джобах${NC}"
say_message "build-backend завершена с ошибкой"
sleep 1
say_message "build-frontend завершена с ошибкой"
sleep 2

# Тест 4: Завершение пайплайна
echo -e "${YELLOW}📋 Тест 4: Завершение пайплайна${NC}"
say_message "Весь пайплайн успешно завершен"
sleep 1

echo -e "${GREEN}✅ Тестирование завершено!${NC}"
echo -e "${BLUE}📝 Все уведомления должны были прозвучать через say${NC}" 