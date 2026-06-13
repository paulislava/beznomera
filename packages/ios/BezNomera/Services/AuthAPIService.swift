import Foundation

struct AuthAPIService {
    private let api = APIClient.shared

    func authApple(_ dto: AppleAuthDTO) async throws -> AuthResponse {
        try await api.post("/auth/apple", body: dto)
    }

    func authGoogle(_ dto: GoogleAuthDTO) async throws -> AuthResponse {
        try await api.post("/auth/google", body: dto)
    }

    func startEmailOTP(email: String) async throws {
        try await api.postVoid("/auth/start", body: EmailOTPStartDTO(email: email))
    }

    func finishEmailOTP(email: String, code: String) async throws -> AuthResponse {
        try await api.post("/auth/finish", body: EmailOTPFinishDTO(email: email, code: code))
    }
}
