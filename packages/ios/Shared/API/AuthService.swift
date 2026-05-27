// iOS-only: used by the main app after extracting the token from WKWebView
import Foundation

enum AuthService {
    static func saveToken(_ token: String) {
        KeychainHelper.token = token
        SharedDefaults.token = token
    }

    static func logout() {
        KeychainHelper.token = nil
        SharedDefaults.token = nil
        SharedDefaults.lastItemId = nil
        SharedDefaults.itemStats = []
    }

    static var isLoggedIn: Bool {
        SharedDefaults.token != nil
    }
}
