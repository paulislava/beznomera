import SwiftUI

struct ChatsListView: View {
    @EnvironmentObject private var chatsStore: ChatsStore

    var body: some View {
        NavigationStack {
            ZStack {
                Color.bzBackground.ignoresSafeArea()

                if chatsStore.isLoading && chatsStore.chats.isEmpty {
                    ProgressView()
                } else if chatsStore.chats.isEmpty {
                    ContentUnavailableView(
                        "Нет чатов",
                        systemImage: "bubble.left.and.bubble.right",
                        description: Text("Отсканируйте QR-код автомобиля, чтобы написать владельцу")
                    )
                } else {
                    chatList
                }
            }
            .navigationTitle("Чаты")
            .refreshable { await chatsStore.loadChats() }
            .task { if chatsStore.chats.isEmpty { await chatsStore.loadChats() } }
        }
    }

    private var chatList: some View {
        List {
            ForEach(chatsStore.chats) { chat in
                NavigationLink(destination: ChatView(chatId: chat.id, title: chatTitle(chat))) {
                    ChatRow(chat: chat)
                }
                .listRowBackground(Color.bzSecondary)
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    Button(role: .destructive) {
                        Task { try? await chatsStore.deleteChat(id: chat.id) }
                    } label: {
                        Label("Удалить", systemImage: "trash")
                    }
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private func chatTitle(_ chat: ChatInfo) -> String {
        chat.car?.no ?? chat.senderName ?? "Чат #\(chat.id)"
    }
}

struct ChatRow: View {
    let chat: ChatInfo

    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            Circle()
                .fill(Color.avatarColor(for: chat.id))
                .frame(width: 44, height: 44)
                .overlay(
                    Text(avatarText)
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                )

            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(chat.car?.no ?? chat.senderName ?? "Чат #\(chat.id)")
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                    Spacer()
                    if let lastMessage = chat.lastMessage {
                        Text(formatDate(lastMessage.createdAt))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                HStack {
                    Text(chat.lastMessage?.text ?? "Нет сообщений")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    Spacer()
                    if let unread = chat.unreadCount, unread > 0 {
                        Text("\(unread)")
                            .font(.caption2.bold())
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.primary)
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var avatarText: String {
        if let no = chat.car?.no { return String(no.prefix(2)) }
        if let name = chat.senderName { return String(name.prefix(1)) }
        return "#"
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "" }
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            let f = DateFormatter()
            f.dateFormat = "HH:mm"
            return f.string(from: date)
        }
        if calendar.isDateInYesterday(date) { return "вчера" }
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "d MMM"
        return f.string(from: date)
    }
}
