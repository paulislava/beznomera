import SwiftUI

@MainActor
final class ProfileStore: ObservableObject {
    @Published private(set) var profile: UserProfile?
    @Published private(set) var isLoading = false
    @Published var error: String?

    private let service = ProfileService()

    func loadProfile() async {
        isLoading = true
        defer { isLoading = false }
        do {
            profile = try await service.fetchProfile()
            error = nil
        } catch APIError.unauthorized {
            error = nil
        } catch {
            self.error = error.localizedDescription
        }
    }

    func updateProfile(_ dto: ProfileUpdateDTO) async throws {
        profile = try await service.updateProfile(dto)
    }

    func uploadAvatar(data: Data) async throws {
        profile = try await service.uploadAvatar(data: data)
    }

    func deleteAvatar() async throws {
        try await service.deleteAvatar()
        await loadProfile()
    }

    func subscribePush(token: String) async {
        do { try await service.subscribePush(token: token) } catch {}
    }

    func unsubscribePush(token: String) async {
        do { try await service.unsubscribePush(token: token) } catch {}
    }
}
