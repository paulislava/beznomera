import Combine
import Foundation
import WidgetKit
#if os(iOS)
import UIKit
#endif

@MainActor
final class ILostStore: ObservableObject {
    @Published private(set) var items: [LostItem] = []
    @Published private(set) var events: [LossEvent] = []
    @Published private(set) var itemStats: [LostItemStats] = []
    @Published var selectedItemId: Int?
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    @Published private(set) var isAuthenticated: Bool

    private let storage: ILostStorage
    private let syncService: ILostSyncService
    #if os(iOS)
    private var foregroundCancellable: AnyCancellable?
    #endif

    var todayTotal: Int { itemStats.reduce(0) { $0 + $1.today } }
    var weekTotal: Int { itemStats.reduce(0) { $0 + $1.week } }
    var totalCount: Int { itemStats.reduce(0) { $0 + $1.total } }

    init(storage: ILostStorage = ILostStorage(), syncService: ILostSyncService = ILostSyncService()) {
        self.storage = storage
        self.syncService = syncService
        self.isAuthenticated = SharedDefaults.token != nil

        events = storage.cachedEvents
        itemStats = storage.cachedStats
        selectedItemId = SharedDefaults.lastItemId

        syncService.onRemoteData = { [weak self] items, stats in
            Task { @MainActor in
                guard let self else { return }
                self.items = items
                self.itemStats = stats
                self.storage.cachedStats = stats
            }
        }

        #if os(iOS)
        foregroundCancellable = NotificationCenter.default
            .publisher(for: UIApplication.willEnterForegroundNotification)
            .sink { [weak self] _ in Task { await self?.load() } }
        #endif

        #if os(watchOS)
        if events.isEmpty && itemStats.isEmpty {
            Task { await load() }
        }
        #endif
    }

    // MARK: - Load

    func load() async {
        guard isAuthenticated else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            async let fetchedItems = LostService.getItems()
            async let fetchedStats = LostService.getItemStats()
            async let fetchedEvents = LostService.getRecentEvents()
            let (newItems, newStats, newEvents) = try await (fetchedItems, fetchedStats, fetchedEvents)

            items = newItems
            itemStats = newStats
            events = newEvents
            storage.cachedStats = newStats
            storage.cachedEvents = newEvents

            if let lastId = SharedDefaults.lastItemId, newItems.contains(where: { $0.id == lastId }) {
                selectedItemId = lastId
            } else {
                selectedItemId = newItems.first(where: { $0.isDefault })?.id ?? newItems.first?.id
            }

            syncService.send(items: newItems, stats: newStats)
            WidgetCenter.shared.reloadAllTimelines()
        } catch APIError.unauthorized {
            logout()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Record Loss

    func recordLoss(itemId: Int) async {
        isLoading = true
        defer { isLoading = false }
        do {
            _ = try await LostService.recordLoss(itemId: itemId)
            SharedDefaults.lastItemId = itemId
            selectedItemId = itemId
            await load()
        } catch APIError.unauthorized {
            logout()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createItemAndRecord(name: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let item = try await LostService.createItem(name: name)
            items.append(item)
            await recordLoss(itemId: item.id)
        } catch APIError.unauthorized {
            logout()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Auth

    func didLogin() {
        isAuthenticated = true
        Task { await load() }
    }

    func logout() {
        KeychainHelper.token = nil
        SharedDefaults.token = nil
        SharedDefaults.lastItemId = nil
        isAuthenticated = false
        items = []
        events = []
        itemStats = []
        selectedItemId = nil
        storage.cachedEvents = []
        storage.cachedStats = []
    }
}
