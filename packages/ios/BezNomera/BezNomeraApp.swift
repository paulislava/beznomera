import SwiftUI
import GoogleSignIn

@main
struct BezNomeraApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    @StateObject private var authStore = AuthStore()
    @StateObject private var carsStore = CarsStore()
    @StateObject private var chatsStore = ChatsStore()
    @StateObject private var profileStore = ProfileStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authStore)
                .environmentObject(carsStore)
                .environmentObject(chatsStore)
                .environmentObject(profileStore)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}
