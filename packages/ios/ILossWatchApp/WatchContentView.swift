import SwiftUI

struct WatchContentView: View {
    @State private var vm = WatchViewModel()

    var body: some View {
        if SharedDefaults.token == nil {
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
                // Item picker via Crown
                if !vm.items.isEmpty {
                    Picker("Предмет", selection: $vm.selectedIndex) {
                        ForEach(Array(vm.items.enumerated()), id: \.offset) { idx, item in
                            Text(item.name).tag(idx)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(height: 60)
                }

                // Loss button
                Button {
                    Task { await vm.recordLoss() }
                } label: {
                    ZStack {
                        if vm.showSuccess {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 32))
                                .foregroundStyle(.green)
                        } else if vm.isLoading {
                            ProgressView()
                        } else {
                            VStack(spacing: 4) {
                                Text("😔").font(.title3)
                                Text(vm.selectedItem.map { "Потеряла\n\($0.name)" } ?? "Потеряла")
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
                .disabled(vm.isLoading || vm.selectedItem == nil)

                // Top stats
                if !vm.itemStats.isEmpty {
                    Divider()
                    ForEach(vm.itemStats.prefix(3)) { stat in
                        HStack {
                            Text(stat.name).font(.system(size: 11)).lineLimit(1)
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
        .task { await vm.load() }
    }
}

extension Color {
    init(hex: String) {
        let v = UInt64(hex, radix: 16) ?? 0
        let r = Double((v >> 16) & 0xFF) / 255
        let g = Double((v >> 8) & 0xFF) / 255
        let b = Double(v & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
