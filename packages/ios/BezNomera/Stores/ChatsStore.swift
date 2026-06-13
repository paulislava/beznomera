import SwiftUI

@MainActor
final class ChatsStore: ObservableObject {
    @Published private(set) var chats: [ChatInfo] = []
    @Published private(set) var activeChat: ChatDetails?
    @Published private(set) var isLoading = false
    @Published var error: String?

    private let service = ChatService()
    private let socket = ChatSocketService.shared

    var unreadCount: Int { chats.compactMap { $0.unreadCount }.reduce(0, +) }

    func loadChats() async {
        isLoading = true
        defer { isLoading = false }
        do {
            chats = try await service.fetchChats()
            error = nil
        } catch APIError.unauthorized {
            error = nil
        } catch {
            self.error = error.localizedDescription
        }
    }

    func openChat(id: Int) async {
        socket.joinChat(id: id)
        socket.onNewMessage = { [weak self] message in
            guard let self, message.chatId == id else { return }
            if var chat = self.activeChat, chat.id == id {
                // Append only if not already present
                if !chat.messages.contains(where: { $0.id == message.id }) {
                    self.activeChat = ChatDetails(
                        id: chat.id,
                        createdAt: chat.createdAt,
                        senderName: chat.senderName,
                        contactType: chat.contactType,
                        contactValue: chat.contactValue,
                        car: chat.car,
                        messages: chat.messages + [message]
                    )
                }
            }
        }
        do {
            activeChat = try await service.fetchChatDetails(id: id)
            try await service.markRead(chatId: id)
            // Update unread count locally
            if let idx = chats.firstIndex(where: { $0.id == id }) {
                chats[idx] = ChatInfo(
                    id: chats[idx].id,
                    createdAt: chats[idx].createdAt,
                    lastMessage: chats[idx].lastMessage,
                    senderName: chats[idx].senderName,
                    contactType: chats[idx].contactType,
                    contactValue: chats[idx].contactValue,
                    unreadCount: 0,
                    car: chats[idx].car
                )
            }
        } catch {}
    }

    func closeChat(id: Int) {
        socket.leaveChat(id: id)
        socket.onNewMessage = nil
        activeChat = nil
    }

    func sendMessage(chatId: Int, text: String) async {
        do {
            let message = try await service.sendMessage(chatId: chatId, text: text)
            if let chat = activeChat, chat.id == chatId {
                activeChat = ChatDetails(
                    id: chat.id,
                    createdAt: chat.createdAt,
                    senderName: chat.senderName,
                    contactType: chat.contactType,
                    contactValue: chat.contactValue,
                    car: chat.car,
                    messages: chat.messages + [message]
                )
            }
            // Update last message in list
            if let idx = chats.firstIndex(where: { $0.id == chatId }) {
                chats[idx] = ChatInfo(
                    id: chats[idx].id,
                    createdAt: chats[idx].createdAt,
                    lastMessage: message,
                    senderName: chats[idx].senderName,
                    contactType: chats[idx].contactType,
                    contactValue: chats[idx].contactValue,
                    unreadCount: chats[idx].unreadCount,
                    car: chats[idx].car
                )
            }
        } catch {
            self.error = error.localizedDescription
        }
    }

    func deleteChat(id: Int) async throws {
        try await service.deleteChat(id: id)
        chats.removeAll { $0.id == id }
    }

    func sendPublicMessage(carCode: String, text: String, contactType: String, contactValue: String, senderName: String?) async throws {
        let dto = SendPublicMessageDTO(
            text: text,
            contactType: contactType,
            contactValue: contactValue,
            senderName: senderName
        )
        try await service.sendPublicMessage(carCode: carCode, dto: dto)
    }

    func connectSocket() {
        socket.connect()
    }

    func disconnectSocket() {
        socket.disconnect()
    }
}
