import SwiftUI
import AVFoundation

struct ScannerView: View {
    @State private var scannedCode: String?
    @State private var showPublicCar = false
    @State private var cameraPermission: AVAuthorizationStatus = .notDetermined

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                switch cameraPermission {
                case .authorized:
                    QRCameraView(onCodeScanned: handleScanned)
                        .ignoresSafeArea()
                    scannerOverlay
                case .denied, .restricted:
                    permissionDeniedView
                default:
                    Color.black.ignoresSafeArea()
                        .onAppear { requestPermission() }
                }
            }
            .navigationTitle("Сканер")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .sheet(isPresented: $showPublicCar, onDismiss: { scannedCode = nil }) {
                if let code = scannedCode {
                    PublicCarView(code: code)
                }
            }
            .onAppear {
                cameraPermission = AVCaptureDevice.authorizationStatus(for: .video)
                if cameraPermission == .notDetermined { requestPermission() }
            }
        }
    }

    private var scannerOverlay: some View {
        VStack {
            Spacer()
            // Finder frame
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.bzPrimary, lineWidth: 3)
                .frame(width: 240, height: 240)
                .overlay(
                    VStack {
                        HStack {
                            cornerMark(rotate: 0)
                            Spacer()
                            cornerMark(rotate: 90)
                        }
                        Spacer()
                        HStack {
                            cornerMark(rotate: 270)
                            Spacer()
                            cornerMark(rotate: 180)
                        }
                    }
                    .padding(4)
                )
            Text("Наведите камеру на QR-код автомобиля")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.8))
                .padding(.top, 24)
            Spacer()
        }
    }

    private func cornerMark(rotate degrees: Double) -> some View {
        Image(systemName: "l.joystick.tilt.up")
            .font(.title2.bold())
            .foregroundStyle(.bzPrimary)
            .rotationEffect(.degrees(degrees))
    }

    private var permissionDeniedView: some View {
        ContentUnavailableView {
            Label("Нет доступа к камере", systemImage: "camera.fill")
        } description: {
            Text("Разрешите доступ к камере в Настройках, чтобы сканировать QR-коды")
        } actions: {
            Button("Открыть настройки") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.bzPrimary)
        }
    }

    private func requestPermission() {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                cameraPermission = granted ? .authorized : .denied
            }
        }
    }

    private func handleScanned(_ code: String) {
        guard let url = URL(string: code),
              url.host == "beznomera.net",
              url.pathComponents.count >= 3,
              url.pathComponents[1] == "g" else { return }
        let carCode = url.pathComponents[2]
        scannedCode = carCode
        showPublicCar = true
    }
}

// MARK: – AVFoundation camera

struct QRCameraView: UIViewRepresentable {
    let onCodeScanned: (String) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(onCodeScanned: onCodeScanned) }

    func makeUIView(context: Context) -> UIView {
        let view = UIView()
        let session = AVCaptureSession()
        context.coordinator.session = session

        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device) else { return view }
        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        session.addOutput(output)
        output.setMetadataObjectsDelegate(context.coordinator, queue: .main)
        output.metadataObjectTypes = [.qr]

        let preview = AVCaptureVideoPreviewLayer(session: session)
        preview.videoGravity = .resizeAspectFill
        view.layer.addSublayer(preview)
        context.coordinator.previewLayer = preview

        DispatchQueue.global(qos: .userInitiated).async { session.startRunning() }
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        context.coordinator.previewLayer?.frame = uiView.bounds
    }

    final class Coordinator: NSObject, AVCaptureMetadataOutputObjectsDelegate {
        let onCodeScanned: (String) -> Void
        var session: AVCaptureSession?
        var previewLayer: AVCaptureVideoPreviewLayer?
        private var lastScanned: String?

        init(onCodeScanned: @escaping (String) -> Void) { self.onCodeScanned = onCodeScanned }

        func metadataOutput(_ output: AVCaptureMetadataOutput,
                            didOutput objects: [AVMetadataObject],
                            from connection: AVCaptureConnection) {
            guard let obj = objects.first as? AVMetadataMachineReadableCodeObject,
                  let value = obj.stringValue,
                  value != lastScanned else { return }
            lastScanned = value
            onCodeScanned(value)
            // Reset after 3 seconds to allow re-scan
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
                self?.lastScanned = nil
            }
        }
    }
}
