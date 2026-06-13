import SwiftUI

extension Color {
    static let bzPrimary = Color("BZPrimary")
    static let bzBackground = Color("BZBackground")
    static let bzSecondary = Color("BZSecondary")

    // Avatar palette (matching web app)
    static let avatarColors: [Color] = [
        Color(hex: "#2b82e5"), Color(hex: "#5856d6"), Color(hex: "#ff2d55"),
        Color(hex: "#ff9500"), Color(hex: "#34c759"), Color(hex: "#00c7be"),
        Color(hex: "#af52de")
    ]

    static func avatarColor(for id: Int) -> Color {
        avatarColors[abs(id) % avatarColors.count]
    }

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8) & 0xFF) / 255
        let b = Double(int & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: – Glassmorphism card modifier
struct GlassCard: ViewModifier {
    var cornerRadius: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .stroke(Color.white.opacity(0.12), lineWidth: 1)
                    )
            )
    }
}

extension View {
    func glassCard(cornerRadius: CGFloat = 16) -> some View {
        modifier(GlassCard(cornerRadius: cornerRadius))
    }
}

// MARK: – License plate view
struct PlateView: View {
    let no: String

    var body: some View {
        Text(no)
            .font(.system(.subheadline, design: .monospaced).bold())
            .foregroundStyle(.black)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
    }
}
