import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: ILostStore

    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Главная", systemImage: "house.fill") }
            HistoryView()
                .tabItem { Label("История", systemImage: "clock.fill") }
            StatisticsView()
                .tabItem { Label("Статистика", systemImage: "chart.bar.fill") }
        }
        .task { await store.load() }
    }
}
