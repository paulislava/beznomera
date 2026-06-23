import SwiftUI

struct ChatView: View {
    @EnvironmentObject private var chatsStore: ChatsStore
    let chatId: Int
    let title: String

    @State private var inputText = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        ZStack {
            Color.bzBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // Messages
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 4) {
                            if let chat = chatsStore.activeChat {
                                ForEach(chat.messages) { message in
                                    MessageBubble(message: message)
                                        .id(message.id)
                                }
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                    }
                    .onChange(of: chatsStore.activeChat?.messages.count) { _, _ in
                        if let lastId = chatsStore.activeChat?.messages.last?.id {
                            withAnimation { proxy.scrollTo(lastId, anchor: .bottom) }
                        }
                    }
                }

                Divider()
                    .background(Color.white.opacity(0.08))

                // Input bar
                HStack(spacing: 10) {
                    TextField("Сообщение...", text: $inputText, axis: .vertical)
                        .focused($inputFocused)
                        .lineLimit(1...5)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color.bzSecondary)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

                    Button {
                        send()
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 32))
                            .foregroundStyle(inputText.trimmingCharacters(in: .whitespaces).isEmpty ? .secondary : Color.bzPrimary)
                    }
                    .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.bzBackground)
            }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await chatsStore.openChat(id: chatId)
        }
        .onDisappear {
            chatsStore.closeChat(id: chatId)
        }
    }

    private func send() {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        inputText = ""
        Task { await chatsStore.sendMessage(chatId: chatId, text: text) }
    }
}

struct MessageBubble: View {
    let message: ChatMessageInfo

    private var isOutgoing: Bool { message.source == .receiver }

    var body: some View {
        HStack {
            if isOutgoing { Spacer(minLength: 48) }

            VStack(alignment: isOutgoing ? .trailing : .leading, spacing: 2) {
                if message.type == .system {
                    Text(message.text)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                        .multilineTextAlignment(.center)
                        .padding(.vertical, 4)
                } else {
                    Text(message.isDeleted == true ? "Сообщение удалено" : message.text)
                        .font(.subheadline)
                        .foregroundStyle(isOutgoing ? .white : .primary)
                        .italic(message.isDeleted == true)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            isOutgoing
                            ? Color.bzPrimary
                            : Color.bzSecondary
                        )
                        .clipShape(
                            RoundedRectangle(
                                cornerRadius: 16,
                                style: .continuous
                            )
                        )

                    Text(formatTime(message.createdAt))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 4)
                }
            }

            if !isOutgoing { Spacer(minLength: 48) }
        }
    }

    private func formatTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) ?? ISO8601DateFormatter().date(from: dateString) else { return "" }
        let f = DateFormatter()
        f.dateFormat = "HH:mm"
        return f.string(from: date)
    }
}
