import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authStore: AuthStore
    @EnvironmentObject private var carsStore: CarsStore
    @EnvironmentObject private var chatsStore: ChatsStore
    @EnvironmentObject private var profileStore: ProfileStore

    @State private var selectedTab = 0

    var body: some View {
        Group {
            if authStore.isAuthenticated {
                mainTabView
            } else {
                AuthView()
            }
        }
        .onChange(of: authStore.isAuthenticated) { _, authenticated in
            if authenticated {
                Task {
                    await carsStore.loadCars()
                    await chatsStore.loadChats()
                    await profileStore.loadProfile()
                    chatsStore.connectSocket()
                }
            } else {
                chatsStore.disconnectSocket()
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .openChat)) { notification in
            if let chatId = notification.object as? Int {
                selectedTab = 1
                Task { await chatsStore.openChat(id: chatId) }
            }
        }
    }

    private var mainTabView: some View {
        TabView(selection: $selectedTab) {
            CarsListView()
                .tabItem { Label("Авто", systemImage: "car.fill") }
                .tag(0)

            ChatsListView()
                .tabItem { Label("Чаты", systemImage: "bubble.left.and.bubble.right.fill") }
                .badge(chatsStore.unreadCount > 0 ? chatsStore.unreadCount : 0)
                .tag(1)

            ScannerView()
                .tabItem { Label("Сканер", systemImage: "qrcode.viewfinder") }
                .tag(2)

            ProfileView()
                .tabItem { Label("Профиль", systemImage: "person.fill") }
                .tag(3)
        }
        .tint(Color.bzPrimary)
    }
}
