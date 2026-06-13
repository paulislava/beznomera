import SwiftUI

struct HistoryView: View {
    @EnvironmentObject private var store: ILostStore

    var body: some View {
        NavigationStack {
            Group {
                if store.events.isEmpty && !store.isLoading {
                    ContentUnavailableView(
                        "Нет записей",
                        systemImage: "clock.badge.questionmark",
                        description: Text("Записи о потерях появятся здесь")
                    )
                } else {
                    List {
                        ForEach(store.events, id: \.id) { event in
                            EventRow(event: event)
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("История")
            .refreshable { await store.load() }
            .overlay {
                if store.isLoading && store.events.isEmpty {
                    ProgressView()
                }
            }
        }
    }
}

private struct EventRow: View {
    let event: LossEvent

    var body: some View {
        HStack(spacing: 12) {
            Text("😔")
                .font(.title3)
            VStack(alignment: .leading, spacing: 3) {
                Text(event.itemName)
                    .font(.system(size: 15, weight: .semibold))
                Text(formattedDate)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(.vertical, 2)
    }

    private var formattedDate: String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let date = iso.date(from: event.createdAt) ?? ISO8601DateFormatter().date(from: event.createdAt)
        guard let date else { return event.createdAt }
        let fmt = DateFormatter()
        fmt.dateStyle = .medium
        fmt.timeStyle = .short
        fmt.locale = Locale(identifier: "ru_RU")
        return fmt.string(from: date)
    }
}
