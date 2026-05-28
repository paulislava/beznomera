import SwiftUI

@Observable
final class AppViewModel {
    var items: [LostItem] = []
    var itemStats: [LostItemStats] = SharedDefaults.itemStats
    var selectedItemId: Int? = SharedDefaults.lastItemId
    var isLoading = false
    var errorMessage: String?

    func load() async {
        do {
            async let fetchedItems = LostService.getItems()
            async let fetchedStats = LostService.getItemStats()
            let (newItems, newStats) = try await (fetchedItems, fetchedStats)
            await MainActor.run {
                self.items = newItems
                self.itemStats = newStats
                SharedDefaults.itemStats = newStats
            }
        } catch APIError.unauthorized {
            await MainActor.run { AuthService.logout() }
        } catch {
            await MainActor.run { self.errorMessage = error.localizedDescription }
        }
    }

    func recordLoss(itemId: Int) async {
        isLoading = true
        defer { isLoading = false }
        do {
            _ = try await LostService.recordLoss(itemId: itemId)
            SharedDefaults.lastItemId = itemId
            selectedItemId = itemId
            await load()
        } catch APIError.unauthorized {
            AuthService.logout()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createItemAndRecord(name: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let item = try await LostService.createItem(name: name)
            await MainActor.run { self.items.append(item) }
            await recordLoss(itemId: item.id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
