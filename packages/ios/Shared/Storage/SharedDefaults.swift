import Foundation

private let suiteName = "group.net.beznomera.ilost"
private let tokenKey = "jwt_token"
private let lastItemIdKey = "last_item_id"
private let itemStatsKey = "item_stats_json"

enum SharedDefaults {
    private static let defaults = UserDefaults(suiteName: suiteName)!

    static var token: String? {
        get { defaults.string(forKey: tokenKey) }
        set { defaults.set(newValue, forKey: tokenKey) }
    }

    static var lastItemId: Int? {
        get {
            let v = defaults.integer(forKey: lastItemIdKey)
            return v == 0 ? nil : v
        }
        set { defaults.set(newValue, forKey: lastItemIdKey) }
    }

    static var itemStats: [LostItemStats] {
        get {
            guard let data = defaults.data(forKey: itemStatsKey) else { return [] }
            return (try? JSONDecoder().decode([LostItemStats].self, from: data)) ?? []
        }
        set {
            let data = try? JSONEncoder().encode(newValue)
            defaults.set(data, forKey: itemStatsKey)
        }
    }
}
