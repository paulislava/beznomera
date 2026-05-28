import Foundation

enum LostService {
    static func getItems() async throws -> [LostItem] {
        try await APIClient.shared.get("/lost/items")
    }

    static func getItemStats() async throws -> [LostItemStats] {
        try await APIClient.shared.get("/lost/stats/items")
    }

    static func recordLoss(itemId: Int) async throws -> LossEvent {
        try await APIClient.shared.post("/lost/record", body: ["itemId": itemId])
    }

    static func createItem(name: String) async throws -> LostItem {
        try await APIClient.shared.post("/lost/items", body: ["name": name])
    }
}
