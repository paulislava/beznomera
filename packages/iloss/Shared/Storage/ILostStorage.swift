import Foundation

final class ILostStorage {
    private let defaults: UserDefaults
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    private enum Key {
        static let events = "ilost_events_json"
        static let stats = "ilost_stats_json"
    }

    init() {
        self.defaults = UserDefaults(suiteName: "group.net.beznomera.ilost")!
    }

    var cachedEvents: [LossEvent] {
        get {
            guard let data = defaults.data(forKey: Key.events) else { return [] }
            return (try? decoder.decode([LossEvent].self, from: data)) ?? []
        }
        set {
            defaults.set(try? encoder.encode(newValue), forKey: Key.events)
        }
    }

    var cachedStats: [LostItemStats] {
        get {
            guard let data = defaults.data(forKey: Key.stats) else { return [] }
            return (try? decoder.decode([LostItemStats].self, from: data)) ?? []
        }
        set {
            defaults.set(try? encoder.encode(newValue), forKey: Key.stats)
        }
    }
}
