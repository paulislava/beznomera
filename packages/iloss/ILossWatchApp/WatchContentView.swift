import SwiftUI

struct WatchContentView: View {
    @EnvironmentObject private var store: ILostStore
    @State private var selectedIndex: Int = 0

    var body: some View {
        if !store.isAuthenticated {
            Text("Войди через iPhone")
                .font(.caption)
                .multilineTextAlignment(.center)
        } else {
            mainContent
        }
    }

    private var mainContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                if !store.items.isEmpty {
                    Picker("Предмет", selection: $selectedIndex) {
                        ForEach(Array(store.items.enumerated()), id: \.offset) { idx, item in
                            Text(item.name).tag(idx)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(height: 60)
                }

                Button {
                    Task { await recordLoss() }
                } label: {
                    ZStack {
                        if store.isLoading {
                            ProgressView()
                        } else {
                            VStack(spacing: 4) {
                                Text("😔").font(.title3)
                                Text(buttonLabel)
                                    .font(.system(size: 11, weight: .semibold))
                                    .multilineTextAlignment(.center)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 80)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "a855f7"), Color(hex: "7c3aed")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)
                .disabled(store.isLoading || store.items.isEmpty)

                if !store.itemStats.isEmpty {
                    Divider()
                    ForEach(store.itemStats.prefix(3)) { stat in
                        HStack {
                            Text(stat.name)
                                .font(.system(size: 11))
                                .lineLimit(1)
                            Spacer()
                            Text("\(stat.today)/\(stat.total)")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .padding(.horizontal, 4)
        }
        .task {
            await store.load()
            syncSelectedIndex()
        }
        .onChange(of: store.items) { _, _ in syncSelectedIndex() }
    }

    private var buttonLabel: String {
        guard !store.items.isEmpty else { return "Потеряла" }
        let item = store.items[min(selectedIndex, store.items.count - 1)]
        return "Потеряла\n\(item.name)"
    }

    private func recordLoss() async {
        guard !store.items.isEmpty else { return }
        let item = store.items[min(selectedIndex, store.items.count - 1)]
        await store.recordLoss(itemId: item.id)
    }

    private func syncSelectedIndex() {
        guard !store.items.isEmpty else { return }
        if let id = store.selectedItemId, let idx = store.items.firstIndex(where: { $0.id == id }) {
            selectedIndex = idx
        }
    }
}
