---
project: beznomera
date: 2026-06-13
tags: [features, architecture, ios]
---

# ILost iOS — рефакторинг по лекалам NoSmoke

## Контекст

Существующий `packages/ios` содержит минимальное приложение ILost:
- `@Observable AppViewModel` на каждом View — не централизовано
- Нет хранилища событий — только кэш статистики в SharedDefaults
- Watch и Widget делают прямые API-запросы без синхронизации
- Только HomeView (кнопка + пикер), нет истории и статистики

Цель: переработать архитектуру по лекалам NoSmoke — централизованный ObservableObject store, отдельный storage layer, WatchConnectivity sync, TabView с History + Statistics views.

## Архитектура

### ILostStore (`@MainActor ObservableObject`, Shared/)
Единственный источник истины для iOS и watchOS через `@EnvironmentObject`.

**Состояние:**
- `items: [LostItem]` — предметы пользователя
- `events: [LossEvent]` — недавние потери (GET /lost/events)
- `itemStats: [LostItemStats]` — статистика по предметам
- `selectedItemId: Int?` — последний выбранный предмет
- `isLoading: Bool`
- `isAuthenticated: Bool`

**Computed:**
- `todayTotal`, `weekTotal`, `totalCount` — суммы по статистике

**Методы:**
- `load()` — параллельно грузит items + stats + events
- `recordLoss(itemId:)` → reload
- `createItemAndRecord(name:)` → create → recordLoss
- `didLogin()` / `logout()`

На iOS: подписка на UIApplication.willEnterForegroundNotification → load().
На watchOS: при пустом кэше — load() при старте.

### ILostStorage (`Shared/Storage/`)
JSON-кэш в App Group UserDefaults (`group.net.beznomera.ilost`):
- `cachedEvents: [LossEvent]`
- `cachedStats: [LostItemStats]`

Заменяет `SharedDefaults.itemStats` (устаревший). Widget и Watch читают из него без API-вызова.

### ILostSyncService (`Shared/Sync/`)
WatchConnectivity мост:
- iPhone → Watch: `updateApplicationContext` с items + stats после каждого load()
- Watch → Store: callback `onRemoteData` обновляет store без API-вызова

Исключён из цели Widget (WatchConnectivity недоступен в extension).

### Views (iOS)

**ContentView** — `TabView` с 3 вкладками:
1. Главная (`HomeView`) — большая кнопка + пикер
2. История (`HistoryView`) — список событий с датами, pull-to-refresh
3. Статистика (`StatisticsView`) — Charts: сводные карточки + строки по предметам

Все Views: `@EnvironmentObject var store: ILostStore`.

### Watch (`ILossWatchApp/`)
`WatchContentView` получает `ILostStore` через `@EnvironmentObject`.
Локальный `@State selectedIndex: Int` для пикера.
`WatchViewModel.swift` — зачищен (заменён store).

### Widget (`ILossWidget/`)
`Provider.swift` читает `ILostStorage().cachedStats` вместо `SharedDefaults.itemStats`.
Без изменений в логике виджета.

## Изменения в project.yml
Widget target — исключить из Shared/:
- `Store/ILostStore.swift`
- `Sync/ILostSyncService.swift`

## Новые файлы
- `Shared/Extensions/ColorExtensions.swift` — `Color(hex:)` (убрать дублирование)
- `Shared/Storage/ILostStorage.swift`
- `Shared/Store/ILostStore.swift`
- `Shared/Sync/ILostSyncService.swift`
- `ILoss/Views/ContentView.swift`
- `ILoss/Views/HistoryView.swift`
- `ILoss/Views/StatisticsView.swift`

## Изменённые файлы
- `Shared/API/LostService.swift` — добавить `getRecentEvents()`
- `Shared/Storage/SharedDefaults.swift` — убрать `itemStats`
- `ILoss/Views/MainView.swift` — struct переименован в `HomeView`, использует store
- `ILoss/ILossApp.swift` — `@StateObject store`, ContentView
- `ILossWatchApp/ILossWatchApp.swift` — inject store
- `ILossWatchApp/WatchContentView.swift` — use store
- `ILossWatchApp/WatchViewModel.swift` — очищен
- `ILossWidget/Provider.swift` — use ILostStorage
- `packages/ios/project.yml` — exclusions для widget
