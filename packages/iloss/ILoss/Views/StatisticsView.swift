import Charts
import SwiftUI

struct StatisticsView: View {
    @EnvironmentObject private var store: ILostStore

    var body: some View {
        NavigationStack {
            Group {
                if store.itemStats.isEmpty && !store.isLoading {
                    ContentUnavailableView(
                        "Нет данных",
                        systemImage: "chart.bar.xaxis",
                        description: Text("Начни фиксировать потери")
                    )
                } else {
                    ScrollView {
                        VStack(spacing: 20) {
                            summaryCards
                            if !store.itemStats.isEmpty {
                                itemStatsSection
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Статистика")
            .refreshable { await store.load() }
        }
    }

    // MARK: - Summary Cards

    private var summaryCards: some View {
        HStack(spacing: 12) {
            SummaryCard(title: "Сегодня", value: store.todayTotal, color: Color(hex: "a855f7"))
            SummaryCard(title: "Неделя", value: store.weekTotal, color: Color(hex: "7c3aed"))
            SummaryCard(title: "Всего", value: store.totalCount, color: .secondary)
        }
    }

    // MARK: - Per-Item Stats

    private var itemStatsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("По предметам")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 4)

            VStack(spacing: 1) {
                ForEach(store.itemStats) { stat in
                    ItemStatRow(stat: stat)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}

// MARK: - Subviews

private struct SummaryCard: View {
    let title: String
    let value: Int
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Text("\(value)")
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(color)
            Text(title)
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private struct ItemStatRow: View {
    let stat: LostItemStats

    var body: some View {
        HStack(spacing: 8) {
            Text(stat.name)
                .font(.system(size: 14, weight: .semibold))
                .lineLimit(1)
            Spacer()
            Group {
                statCell(value: stat.today, label: "сег")
                statCell(value: stat.week, label: "нед")
                statCell(value: stat.total, label: "всего")
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemBackground))
    }

    private func statCell(value: Int, label: String) -> some View {
        VStack(spacing: 1) {
            Text("\(value)")
                .font(.system(size: 15, weight: .bold))
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.secondary)
        }
        .frame(minWidth: 36)
    }
}
