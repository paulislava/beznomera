import Foundation
import SocketIO

@MainActor
final class ChatSocketService: ObservableObject {
    static let shared = ChatSocketService()

    private var manager: SocketManager?
    private var socket: SocketIOClient?

    @Published private(set) var isConnected = false

    var onNewMessage: ((ChatMessageInfo) -> Void)?

    func connect() {
        guard let token = KeychainHelper.token else { return }
        guard socket == nil else { return }

        let url = URL(string: "https://beznomera.net")!
        manager = SocketManager(socketURL: url, config: [
            .log(false),
            .compress,
            .extraHeaders(["Authorization": "Bearer \(token)"])
        ])
        socket = manager?.defaultSocket

        socket?.on(clientEvent: .connect) { [weak self] _, _ in
            Task { @MainActor in self?.isConnected = true }
        }
        socket?.on(clientEvent: .disconnect) { [weak self] _, _ in
            Task { @MainActor in self?.isConnected = false }
        }
        socket?.on("chat:new_message") { [weak self] data, _ in
            guard let dict = data.first as? [String: Any],
                  let jsonData = try? JSONSerialization.data(withJSONObject: dict) else { return }
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            if let message = try? decoder.decode(ChatMessageInfo.self, from: jsonData) {
                Task { @MainActor in self?.onNewMessage?(message) }
            }
        }
        socket?.connect()
    }

    func disconnect() {
        socket?.disconnect()
        socket = nil
        manager = nil
        isConnected = false
    }

    func joinChat(id: Int) {
        socket?.emit("chat:join", ["chatId": id])
    }

    func leaveChat(id: Int) {
        socket?.emit("chat:leave", ["chatId": id])
    }

    func sendMessage(chatId: Int, text: String) {
        socket?.emit("chat:send_message", ["chatId": chatId, "text": text])
    }
}
