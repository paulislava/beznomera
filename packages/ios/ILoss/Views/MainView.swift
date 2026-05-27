import SwiftUI

struct MainView: View {
    @State private var vm = AppViewModel()
    @State private var newItemName = ""
    @State private var showNewItemField = false

    var selectedItem: LostItem? {
        items.first { $0.id == vm.selectedItemId }
    }

    private var items: [LostItem] { vm.items }
    private var canLose: Bool { vm.selectedItemId != nil || !newItemName.trimmingCharacters(in: .whitespaces).isEmpty }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    // Item picker
                    VStack(spacing: 12) {
                        Picker("Что потеряла", selection: $vm.selectedItemId) {
                            Text("Выбери предмет").tag(Int?.none)
                            ForEach(items) { item in
                                Text(item.name).tag(Int?.some(item.id))
                            }
                        }
                        .pickerStyle(.menu)
                        .frame(maxWidth: .infinity)
                        .padding(.horizontal)

                        if showNewItemField {
                            TextField("Название нового предмета", text: $newItemName)
                                .textFieldStyle(.roundedBorder)
                                .padding(.horizontal)
                        }

                        Button(showNewItemField ? "Отмена" : "+ Новый предмет") {
                            showNewItemField.toggle()
                            if !showNewItemField { newItemName = "" }
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }

                    // Loss button
                    Button {
                        Task {
                            let trimmed = newItemName.trimmingCharacters(in: .whitespaces)
                            if let id = vm.selectedItemId, trimmed.isEmpty {
                                await vm.recordLoss(itemId: id)
                            } else if !trimmed.isEmpty {
                                await vm.createItemAndRecord(name: trimmed)
                                showNewItemField = false
                                newItemName = ""
                            }
                        }
                    } label: {
                        VStack(spacing: 8) {
                            Text("😔").font(.system(size: 40))
                            Text(buttonLabel).font(.system(size: 15, weight: .bold))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 20)
                        }
                    }
                    .frame(width: 200, height: 200)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "a855f7"), Color(hex: "7c3aed")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .foregroundStyle(.white)
                    .clipShape(Circle())
                    .shadow(color: Color(hex: "7c3aed").opacity(0.35), radius: 16, y: 8)
                    .disabled(vm.isLoading || !canLose)
                    .opacity(vm.isLoading || !canLose ? 0.5 : 1)

                    // Stats
                    if !vm.itemStats.isEmpty {
                        VStack(spacing: 8) {
                            ForEach(vm.itemStats) { stat in
                                HStack {
                                    Text(stat.name)
                                        .font(.system(size: 14, weight: .semibold))
                                        .lineLimit(1)
                                    Spacer()
                                    HStack(spacing: 6) {
                                        StatPill("\(stat.today) сег")
                                        StatPill("\(stat.week) нед")
                                        StatPill("\(stat.total) всего")
                                    }
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(Color(.secondarySystemBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical, 32)
            }
            .navigationTitle("ILoss")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Выйти") {
                        AuthService.logout()
                        NotificationCenter.default.post(name: .didLogout, object: nil)
                    }
                    .foregroundStyle(.secondary)
                }
            }
            .task { await vm.load() }
        }
    }

    private var buttonLabel: String {
        let name = selectedItem?.name ?? newItemName.trimmingCharacters(in: .whitespaces)
        return "Я потеряла\(name.isEmpty ? "" : " \(name)")"
    }
}

private struct StatPill: View {
    let text: String
    init(_ text: String) { self.text = text }

    var body: some View {
        Text(text)
            .font(.system(size: 11))
            .opacity(0.65)
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(Color(.tertiarySystemBackground))
            .clipShape(Capsule())
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
