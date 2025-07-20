#!/bin/bash

# Скрипт для отслеживания пайплайна GitHub Actions
# Использование: ./scripts/pipeline-monitor.sh [owner] [repo] [workflow_id]

set -e

# Параметры по умолчанию
OWNER=${1:-"paulislava"}
REPO=${2:-"beznomera"}
WORKFLOW_ID=${3:-"dev.yml"}

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для озвучивания сообщений
say_message() {
    local message="$1"
    echo -e "${BLUE}🔊 $message${NC}"
    say "$message" 2>/dev/null || echo "say command not available"
}

# Функция для получения статуса workflow run
get_workflow_status() {
    local run_id="$1"
    gh api repos/$OWNER/$REPO/actions/runs/$run_id --jq '.status'
}

# Функция для получения результата workflow run
get_workflow_conclusion() {
    local run_id="$1"
    gh api repos/$OWNER/$REPO/actions/runs/$run_id --jq '.conclusion'
}

# Функция для получения списка джобов
get_jobs() {
    local run_id="$1"
    gh api repos/$OWNER/$REPO/actions/runs/$run_id/jobs --jq '.jobs[] | {id: .id, name: .name, status: .status, conclusion: .conclusion}'
}

# Функция для отслеживания джобы
monitor_job() {
    local run_id="$1"
    local job_id="$2"
    local job_name="$3"
    
    while true; do
        local job_status=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id/jobs/$job_id --jq '.status')
        local job_conclusion=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id/jobs/$job_id --jq '.conclusion')
        
        if [[ "$job_status" == "completed" ]]; then
            if [[ "$job_conclusion" == "success" ]]; then
                echo -e "${GREEN}✅ $job_name успешно завершена${NC}"
                say_message "$job_name успешно завершена"
                break
            else
                echo -e "${RED}❌ $job_name завершена с ошибкой${NC}"
                say_message "$job_name завершена с ошибкой"
                break
            fi
        elif [[ "$job_status" == "in_progress" ]]; then
            echo -e "${YELLOW}⏳ $job_name выполняется...${NC}"
        elif [[ "$job_status" == "queued" ]]; then
            echo -e "${BLUE}⏸️  $job_name в очереди...${NC}"
        fi
        
        sleep 10
    done
}

# Основная функция мониторинга
monitor_pipeline() {
    echo -e "${BLUE}🚀 Начинаем отслеживание пайплайна...${NC}"
    say_message "Отслеживание пайплайна начато"
    
    # Получаем последний workflow run
    local latest_run=$(gh api repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_ID/runs --jq '.workflow_runs[0].id')
    
    if [[ -z "$latest_run" ]]; then
        echo -e "${RED}❌ Не удалось найти последний workflow run${NC}"
        say_message "Не удалось найти последний workflow run"
        exit 1
    fi
    
    echo -e "${BLUE}📊 Отслеживаем workflow run: $latest_run${NC}"
    
    # Отслеживаем статус workflow
    while true; do
        local workflow_status=$(get_workflow_status "$latest_run")
        local workflow_conclusion=$(get_workflow_conclusion "$latest_run")
        
        if [[ "$workflow_status" == "completed" ]]; then
            if [[ "$workflow_conclusion" == "success" ]]; then
                echo -e "${GREEN}🎉 Весь пайплайн успешно завершен!${NC}"
                say_message "Весь пайплайн успешно завершен"
                break
            else
                echo -e "${RED}💥 Пайплайн завершен с ошибками${NC}"
                say_message "Пайплайн завершен с ошибками"
                break
            fi
        elif [[ "$workflow_status" == "in_progress" ]]; then
            echo -e "${YELLOW}⏳ Пайплайн выполняется...${NC}"
        elif [[ "$workflow_status" == "queued" ]]; then
            echo -e "${BLUE}⏸️  Пайплайн в очереди...${NC}"
        fi
        
        sleep 15
    done
    
    # Отслеживаем отдельные джобы
    echo -e "${BLUE}📋 Отслеживаем отдельные джобы...${NC}"
    
    local jobs=$(get_jobs "$latest_run")
    local job_ids=()
    local job_names=()
    
    # Парсим джобы
    while IFS= read -r job; do
        local job_id=$(echo "$job" | jq -r '.id')
        local job_name=$(echo "$job" | jq -r '.name')
        
        job_ids+=("$job_id")
        job_names+=("$job_name")
        
        echo -e "${BLUE}📝 Джоба: $job_name (ID: $job_id)${NC}"
    done <<< "$jobs"
    
    # Запускаем мониторинг каждой джобы в фоне
    local pids=()
    for i in "${!job_ids[@]}"; do
        monitor_job "$latest_run" "${job_ids[$i]}" "${job_names[$i]}" &
        pids+=($!)
    done
    
    # Ждем завершения всех процессов мониторинга
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
    
    echo -e "${GREEN}✅ Мониторинг пайплайна завершен${NC}"
}

# Проверяем наличие gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) не установлен${NC}"
    echo "Установите GitHub CLI: https://cli.github.com/"
    exit 1
fi

# Проверяем аутентификацию
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в GitHub CLI${NC}"
    echo "Выполните: gh auth login"
    exit 1
fi

# Запускаем мониторинг
monitor_pipeline 