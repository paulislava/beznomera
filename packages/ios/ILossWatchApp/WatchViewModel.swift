import SwiftUI

@Observable
final class WatchViewModel {
    var items: [LostItem] = []
    var itemStats: [LostItemStats] = SharedDefaults.itemStats
    var selectedIndex: Int = 0
    var isLoading = false
    var showSuccess = false

    var selectedItem: LostItem? {
        items.isEmpty ? nil : items[min(selectedIndex, items.count - 1)]
    }

    func load() async {
        guard SharedDefaults.token != nil else { return }
        do {
            async let fetchedItems = LostService.getItems()
            async let fetchedStats = LostService.getItemStats()
            let (newItems, newStats) = try await (fetchedItems, fetchedStats)
            await MainActor.run {
                self.items = newItems
                self.itemStats = newStats
                SharedDefaults.itemStats = newStats
                if let lastId = SharedDefaults.lastItemId,
                   let idx = newItems.firstIndex(where: { $0.id == lastId }) {
                    self.selectedIndex = idx
                }
            }
        } catch {}
    }

    func recordLoss() async {
        guard let item = selectedItem else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            _ = try await LostService.recordLoss(itemId: item.id)
            SharedDefaults.lastItemId = item.id
            await load()
            await MainActor.run {
                showSuccess = true
            }
            try? await Task.sleep(for: .seconds(1.5))
            await MainActor.run { showSuccess = false }
        } catch {}
    }
}
