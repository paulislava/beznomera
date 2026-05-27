import WidgetKit
import SwiftUI

struct ILossEntry: TimelineEntry {
    let date: Date
    let stats: [LostItemStats]
}

struct ILossProvider: TimelineProvider {
    func placeholder(in context: Context) -> ILossEntry {
        ILossEntry(date: .now, stats: [
            LostItemStats(itemId: 0, name: "Ключи", total: 12, today: 1, week: 3)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (ILossEntry) -> Void) {
        completion(ILossEntry(date: .now, stats: SharedDefaults.itemStats))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ILossEntry>) -> Void) {
        let entry = ILossEntry(date: .now, stats: SharedDefaults.itemStats)
        let refresh = Calendar.current.date(byAdding: .minute, value: 30, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }
}
