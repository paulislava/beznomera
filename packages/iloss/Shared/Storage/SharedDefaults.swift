import Foundation

private let suiteName = "group.net.beznomera.ilost"
private let tokenKey = "jwt_token"
private let lastItemIdKey = "last_item_id"

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
}
