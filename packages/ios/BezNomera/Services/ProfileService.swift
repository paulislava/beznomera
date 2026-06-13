import Foundation

struct ProfileService {
    private let api = APIClient.shared

    func fetchProfile() async throws -> UserProfile {
        try await api.get("/user/me")
    }

    func updateProfile(_ dto: ProfileUpdateDTO) async throws -> UserProfile {
        try await api.post("/user/me", body: dto)
    }

    func uploadAvatar(data: Data) async throws -> UserProfile {
        let responseData = try await api.postMultipart("/user/me/avatar", data: data, mimeType: "image/jpeg", fieldName: "avatar")
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(UserProfile.self, from: responseData)
    }

    func deleteAvatar() async throws {
        try await api.delete("/user/me/avatar")
    }

    func subscribePush(token: String) async throws {
        try await api.postVoid("/notification/subscribe", body: PushSubscribeDTO(token: token))
    }

    func unsubscribePush(token: String) async throws {
        try await api.postVoid("/notification/unsubscribe", body: PushSubscribeDTO(token: token))
    }
}
