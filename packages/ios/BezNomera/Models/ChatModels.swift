import Foundation

enum MessageSource: String, Codable {
    case sender, receiver
}

enum MessageType: String, Codable {
    case normal, call, system
}

struct ChatMessageInfo: Codable, Identifiable {
    let id: Int
    let chatId: Int
    let text: String
    let userId: Int?
    let createdAt: String
    let source: MessageSource
    let attachmentUrl: String?
    let type: MessageType
    let isDeleted: Bool?
}

struct ChatCarInfo: Codable {
    let id: Int
    let no: String
    let code: String
}

struct ChatInfo: Codable, Identifiable {
    let id: Int
    let createdAt: String
    let lastMessage: ChatMessageInfo?
    let senderName: String?
    let contactType: String?
    let contactValue: String?
    let unreadCount: Int?
    let car: ChatCarInfo?
}

struct ChatDetails: Codable, Identifiable {
    let id: Int
    let createdAt: String
    let senderName: String?
    let contactType: String?
    let contactValue: String?
    let car: ChatCarInfo?
    let messages: [ChatMessageInfo]
}

// MARK: – DTOs

struct SendMessageDTO: Encodable {
    var text: String
}

struct SendPublicMessageDTO: Encodable {
    var text: String
    var contactType: String
    var contactValue: String
    var senderName: String?
}
