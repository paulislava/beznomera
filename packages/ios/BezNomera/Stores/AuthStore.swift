import SwiftUI
import AuthenticationServices
import GoogleSignIn

@MainActor
final class AuthStore: ObservableObject {
    @Published private(set) var isAuthenticated = false
    @Published private(set) var currentUser: UserProfile?
    @Published private(set) var isLoading = false
    @Published var error: String?

    private let authService = AuthAPIService()
    private let profileService = ProfileService()

    init() {
        isAuthenticated = KeychainHelper.token != nil
    }

    // MARK: – Apple Sign In

    func signInWithApple(result: Result<ASAuthorization, Error>) async {
        guard case .success(let auth) = result,
              let credential = auth.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let token = String(data: tokenData, encoding: .utf8) else {
            if case .failure(let e) = result {
                let code = (e as? ASAuthorizationError)?.code
                if code != .canceled { error = e.localizedDescription }
            }
            return
        }

        let fullName = credential.fullName
        let dto = AppleAuthDTO(
            identityToken: token,
            firstName: fullName?.givenName,
            lastName: fullName?.familyName,
            email: credential.email
        )

        isLoading = true
        defer { isLoading = false }
        do {
            let response = try await authService.authApple(dto)
            saveToken(response.token)
            currentUser = response.user
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: – Google Sign In

    func signInWithGoogle(presenting viewController: UIViewController) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: viewController)
            guard let idToken = result.user.idToken?.tokenString else {
                error = "Не удалось получить токен Google"
                return
            }
            let response = try await authService.authGoogle(GoogleAuthDTO(idToken: idToken))
            saveToken(response.token)
            currentUser = response.user
        } catch {
            if (error as? GIDSignInError)?.code != .canceled {
                self.error = error.localizedDescription
            }
        }
    }

    // MARK: – Email OTP

    func startEmailOTP(email: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await authService.startEmailOTP(email: email)
        } catch {
            self.error = error.localizedDescription
        }
    }

    func verifyEmailOTP(email: String, code: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response = try await authService.finishEmailOTP(email: email, code: code)
            saveToken(response.token)
            currentUser = response.user
        } catch {
            self.error = error.localizedDescription
        }
    }

    // MARK: – WebView OAuth (Yandex, VK, Telegram)

    func handleWebAuthToken(_ token: String) {
        saveToken(token)
        Task { await loadProfile() }
    }

    // MARK: – Profile

    func loadProfile() async {
        do {
            currentUser = try await profileService.fetchProfile()
        } catch APIError.unauthorized {
            signOut()
        } catch {}
    }

    // MARK: – Sign Out

    func signOut() {
        KeychainHelper.token = nil
        isAuthenticated = false
        currentUser = nil
    }

    // MARK: – Private

    private func saveToken(_ token: String) {
        KeychainHelper.token = token
        isAuthenticated = true
        Task { await loadProfile() }
    }
}
