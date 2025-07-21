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
    local status=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id --jq '.status' 2>/dev/null || echo "error")
    echo "$status"
}

# Функция для получения результата workflow run
get_workflow_conclusion() {
    local run_id="$1"
    local conclusion=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id --jq '.conclusion' 2>/dev/null || echo "error")
    echo "$conclusion"
}

# Функция для получения списка джобов
get_jobs() {
    local run_id="$1"
    local jobs=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id/jobs --jq '.jobs[] | {id: .id, name: .name, status: .status, conclusion: .conclusion}' 2>/dev/null || echo "")
    echo "$jobs"
}

# Функция для ожидания создания workflow run
wait_for_workflow_run() {
    local temp_file="$1"
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Ожидаем создания workflow run...${NC}"
    
    while [[ $attempt -le $max_attempts ]]; do
        local latest_run=$(gh api repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_ID/runs --jq '.workflow_runs[0].id' 2>/dev/null || echo "")
        
        if [[ -n "$latest_run" && "$latest_run" != "null" ]]; then
            echo -e "${GREEN}✅ Workflow run найден: $latest_run${NC}"
            echo "$latest_run" > "$temp_file"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Попытка $attempt/$max_attempts: workflow run еще не создан...${NC}"
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Не удалось найти workflow run после $max_attempts попыток${NC}"
    return 1
}

# Функция для ожидания появления джоб
wait_for_jobs() {
    local run_id="$1"
    local temp_file="$2"
    local max_attempts=20
    local attempt=1
    
    echo -e "${BLUE}⏳ Ожидаем появления джоб...${NC}"
    
    while [[ $attempt -le $max_attempts ]]; do
        local jobs=$(get_jobs "$run_id")
        
        if [[ -n "$jobs" ]]; then
            echo -e "${GREEN}✅ Джобы найдены${NC}"
            echo "$jobs" > "$temp_file"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Попытка $attempt/$max_attempts: джобы еще не созданы...${NC}"
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}❌ Не удалось найти джобы после $max_attempts попыток${NC}"
    return 1
}

# Функция для отслеживания джобы
monitor_job() {
    local run_id="$1"
    local job_id="$2"
    local job_name="$3"
    
    while true; do
        local job_status=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id/jobs/$job_id --jq '.status' 2>/dev/null || echo "error")
        local job_conclusion=$(gh api repos/$OWNER/$REPO/actions/runs/$run_id/jobs/$job_id --jq '.conclusion' 2>/dev/null || echo "error")
        
        if [[ "$job_status" == "error" ]]; then
            echo -e "${YELLOW}⚠️  Ошибка получения статуса джобы $job_name, повторяем...${NC}"
            sleep 5
            continue
        fi
        
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
    
    # Ожидаем создания workflow run
    local temp_workflow_file=$(mktemp)
    wait_for_workflow_run "$temp_workflow_file"
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Не удалось найти workflow run${NC}"
        say_message "Не удалось найти workflow run"
        rm -f "$temp_workflow_file"
        exit 1
    fi
    
    local latest_run=$(cat "$temp_workflow_file" 2>/dev/null || echo "")
    rm -f "$temp_workflow_file"
    
    if [[ -z "$latest_run" ]]; then
        echo -e "${RED}❌ Не удалось получить ID workflow run${NC}"
        say_message "Не удалось получить ID workflow run"
        exit 1
    fi
    
    echo -e "${BLUE}📊 Отслеживаем workflow run: $latest_run${NC}"
    
    # Ожидаем появления джоб
    local temp_jobs_file=$(mktemp)
    wait_for_jobs "$latest_run" "$temp_jobs_file"
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Не удалось найти джобы${NC}"
        say_message "Не удалось найти джобы"
        rm -f "$temp_jobs_file"
        exit 1
    fi
    
    local jobs=$(cat "$temp_jobs_file" 2>/dev/null || echo "")
    rm -f "$temp_jobs_file"
    
    if [[ -z "$jobs" ]]; then
        echo -e "${RED}❌ Не удалось получить список джоб${NC}"
        say_message "Не удалось получить список джоб"
        exit 1
    fi
    
    # Парсим джобы
    local job_ids=()
    local job_names=()
    
    while IFS= read -r job; do
        if [[ -n "$job" ]]; then
            local job_id=$(echo "$job" | jq -r '.id' 2>/dev/null || echo "")
            local job_name=$(echo "$job" | jq -r '.name' 2>/dev/null || echo "")
            
            if [[ -n "$job_id" && "$job_id" != "null" && -n "$job_name" ]]; then
                job_ids+=("$job_id")
                job_names+=("$job_name")
                echo -e "${BLUE}📝 Джоба: $job_name (ID: $job_id)${NC}"
            fi
        fi
    done <<< "$jobs"
    
    if [[ ${#job_ids[@]} -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  Не найдено активных джоб${NC}"
    else
        # Запускаем мониторинг каждой джобы в фоне
        local pids=()
        for i in "${!job_ids[@]}"; do
            monitor_job "$latest_run" "${job_ids[$i]}" "${job_names[$i]}" &
            pids+=($!)
        done
        
        # Отслеживаем статус workflow параллельно с джобами
        while true; do
            local workflow_status=$(get_workflow_status "$latest_run")
            local workflow_conclusion=$(get_workflow_conclusion "$latest_run")
            
            if [[ "$workflow_status" == "error" ]]; then
                echo -e "${YELLOW}⚠️  Ошибка получения статуса workflow, повторяем...${NC}"
                sleep 5
                continue
            fi
            
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
        
        # Ждем завершения всех процессов мониторинга джоб
        echo -e "${BLUE}⏳ Ожидаем завершения мониторинга джоб...${NC}"
        for pid in "${pids[@]}"; do
            wait "$pid" 2>/dev/null || true
        done
    fi
    
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