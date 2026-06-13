import Foundation

struct LostItem: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let isDefault: Bool
}

struct LossStats: Codable {
    let total: Int
    let today: Int
    let week: Int
}

struct LostItemStats: Codable, Identifiable {
    let itemId: Int
    let name: String
    let total: Int
    let today: Int
    let week: Int

    var id: Int { itemId }
}

struct LossEvent: Codable {
    let id: Int
    let itemId: Int
    let itemName: String
    let createdAt: String
}
