import WidgetKit
import SwiftUI

struct ILostEntry: TimelineEntry {
    let date: Date
    let stats: [LostItemStats]
}

struct ILostProvider: TimelineProvider {
    private let storage = ILostStorage()

    func placeholder(in context: Context) -> ILostEntry {
        ILostEntry(date: .now, stats: [
            LostItemStats(itemId: 0, name: "Ключи", total: 12, today: 1, week: 3)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (ILostEntry) -> Void) {
        completion(ILostEntry(date: .now, stats: storage.cachedStats))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ILostEntry>) -> Void) {
        let entry = ILostEntry(date: .now, stats: storage.cachedStats)
        let refresh = Calendar.current.date(byAdding: .minute, value: 30, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }
}
