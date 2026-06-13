import SwiftUI

struct LinkedAccountsView: View {
    @EnvironmentObject private var profileStore: ProfileStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List(profileStore.profile?.linkedAccounts ?? []) { account in
                HStack(spacing: 12) {
                    Image(systemName: providerIcon(account.provider))
                        .font(.title3)
                        .foregroundStyle(providerColor(account.provider))
                        .frame(width: 32)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(providerName(account.provider))
                            .font(.subheadline.weight(.medium))
                        if let email = account.email {
                            Text(email)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
                .listRowBackground(Color.bzSecondary)
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Color.bzBackground)
            .navigationTitle("Привязанные аккаунты")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") { dismiss() }
                }
            }
        }
    }

    private func providerName(_ provider: String) -> String {
        switch provider.lowercased() {
        case "apple": return "Apple"
        case "google": return "Google"
        case "yandex": return "Яндекс"
        case "vk": return "ВКонтакте"
        case "telegram": return "Telegram"
        default: return provider.capitalized
        }
    }

    private func providerIcon(_ provider: String) -> String {
        switch provider.lowercased() {
        case "apple": return "apple.logo"
        case "google": return "g.circle.fill"
        case "telegram": return "paperplane.circle.fill"
        case "email": return "envelope.fill"
        default: return "link.circle.fill"
        }
    }

    private func providerColor(_ provider: String) -> Color {
        switch provider.lowercased() {
        case "google": return Color(hex: "#EA4335")
        case "yandex": return Color(hex: "#FFCC00")
        case "vk": return Color(hex: "#0077FF")
        case "telegram": return Color(hex: "#26A5E4")
        default: return .primary
        }
    }
}
