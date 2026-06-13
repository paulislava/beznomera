import Foundation

struct ChatService {
    private let api = APIClient.shared

    func fetchChats() async throws -> [ChatInfo] {
        try await api.get("/chat/my")
    }

    func fetchChatDetails(id: Int) async throws -> ChatDetails {
        try await api.get("/chat/\(id)")
    }

    func sendMessage(chatId: Int, text: String) async throws -> ChatMessageInfo {
        try await api.post("/chat/\(chatId)/message", body: SendMessageDTO(text: text))
    }

    func deleteChat(id: Int) async throws {
        try await api.delete("/chat/\(id)")
    }

    func markRead(chatId: Int) async throws {
        try await api.postVoid("/chat/\(chatId)/read", body: EmptyBody())
    }

    func sendPublicMessage(carCode: String, dto: SendPublicMessageDTO) async throws {
        try await api.postVoid("/car/\(carCode)/message", body: dto)
    }
}

private struct EmptyBody: Encodable {}
