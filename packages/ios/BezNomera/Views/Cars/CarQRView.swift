import SwiftUI
import CoreImage.CIFilterBuiltins

struct CarQRView: View {
    @Environment(\.dismiss) private var dismiss
    let car: CarInfo

    var body: some View {
        NavigationStack {
            ZStack {
                Color.bzBackground.ignoresSafeArea()

                VStack(spacing: 32) {
                    Text("QR-код автомобиля")
                        .font(.title2.bold())

                    PlateView(no: car.no)
                        .font(.title.bold())
                        .scaleEffect(1.3)

                    if let qrImage = generateQR(from: carURL) {
                        Image(uiImage: qrImage)
                            .interpolation(.none)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 240, height: 240)
                            .padding(20)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    }

                    Text(carURL)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)

                    ShareLink(item: URL(string: carURL)!) {
                        Label("Поделиться", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.bzPrimary)
                    .padding(.horizontal, 32)
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Готово") { dismiss() }
                }
            }
        }
    }

    private var carURL: String {
        "https://beznomera.net/g/\(car.code)"
    }

    private func generateQR(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        guard let output = filter.outputImage else { return nil }
        let scaled = output.transformed(by: CGAffineTransform(scaleX: 10, y: 10))
        guard let cgImage = context.createCGImage(scaled, from: scaled.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
