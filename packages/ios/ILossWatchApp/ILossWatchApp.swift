import SwiftUI

@main
struct ILostWatchApp: App {
    @StateObject private var store = ILostStore()

    var body: some Scene {
        WindowGroup {
            WatchContentView()
                .environmentObject(store)
        }
    }
}
