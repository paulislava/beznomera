import Foundation

struct LinkedAccount: Codable, Identifiable {
    let id: Int
    let provider: String
    let providerId: String?
    let email: String?
}

struct UserProfile: Codable {
    let id: Int
    let firstName: String?
    let lastName: String?
    let nickname: String?
    let avatarUrl: String?
    let email: String?
    let tel: String?
    let linkedAccounts: [LinkedAccount]

    var displayName: String {
        if let nickname = nickname, !nickname.isEmpty { return nickname }
        let parts = [firstName, lastName].compactMap { $0 }.filter { !$0.isEmpty }
        if !parts.isEmpty { return parts.joined(separator: " ") }
        return "Пользователь #\(id)"
    }

    var initials: String {
        let parts = [firstName, lastName].compactMap { $0?.first.map(String.init) }
        return parts.prefix(2).joined()
    }
}

struct AuthResponse: Decodable {
    let token: String
    let user: UserProfile?
}

// MARK: – DTOs

struct ProfileUpdateDTO: Encodable {
    var firstName: String?
    var lastName: String?
    var nickname: String?
    var tel: String?
}

struct AppleAuthDTO: Encodable {
    var identityToken: String
    var firstName: String?
    var lastName: String?
    var email: String?
}

struct GoogleAuthDTO: Encodable {
    var idToken: String
}

struct EmailOTPStartDTO: Encodable {
    var email: String
}

struct EmailOTPFinishDTO: Encodable {
    var email: String
    var code: String
}

struct PushSubscribeDTO: Encodable {
    var token: String
    var platform: String = "ios"
}
