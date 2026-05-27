import SwiftUI

@main
struct ILossApp: App {
    @State private var isLoggedIn = AuthService.isLoggedIn

    var body: some Scene {
        WindowGroup {
            if isLoggedIn {
                MainView()
                    .onReceive(NotificationCenter.default.publisher(for: .didLogout)) { _ in
                        isLoggedIn = false
                    }
            } else {
                LoginView {
                    isLoggedIn = true
                }
            }
        }
    }
}

extension Notification.Name {
    static let didLogout = Notification.Name("didLogout")
}
