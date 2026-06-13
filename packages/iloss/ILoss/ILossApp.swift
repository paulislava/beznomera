import SwiftUI

@main
struct ILostApp: App {
    @StateObject private var store = ILostStore()

    var body: some Scene {
        WindowGroup {
            if store.isAuthenticated {
                ContentView()
                    .environmentObject(store)
            } else {
                LoginView {
                    store.didLogin()
                }
            }
        }
    }
}

extension Notification.Name {
    static let didLogout = Notification.Name("didLogout")
}
