import WidgetKit
import SwiftUI

struct ILossWidget: Widget {
    let kind = "ILossWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ILossProvider()) { entry in
            ILossWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("ILoss")
        .description("Статистика потерь")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct ILossWidgetView: View {
    let entry: ILossEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        if entry.stats.isEmpty {
            Text("Нет данных")
                .font(.caption)
                .foregroundStyle(.secondary)
        } else if family == .systemSmall {
            SmallWidgetView(stat: entry.stats[0])
        } else {
            MediumWidgetView(stats: Array(entry.stats.prefix(3)))
        }
    }
}

private struct SmallWidgetView: View {
    let stat: LostItemStats

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("😔").font(.title2)
            Text(stat.name)
                .font(.system(size: 13, weight: .semibold))
                .lineLimit(1)
            Spacer()
            HStack(spacing: 4) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(stat.today)").font(.system(size: 20, weight: .bold))
                    Text("сегодня").font(.system(size: 9)).foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(stat.total)").font(.system(size: 14, weight: .medium))
                    Text("всего").font(.system(size: 9)).foregroundStyle(.secondary)
                }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

private struct MediumWidgetView: View {
    let stats: [LostItemStats]

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("ILoss", systemImage: "questionmark.circle.fill")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.secondary)
            ForEach(stats) { stat in
                HStack {
                    Text(stat.name)
                        .font(.system(size: 13, weight: .medium))
                        .lineLimit(1)
                    Spacer()
                    Text("\(stat.today) сег")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                    Text("\(stat.week) нед")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                    Text("\(stat.total)")
                        .font(.system(size: 13, weight: .bold))
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}
