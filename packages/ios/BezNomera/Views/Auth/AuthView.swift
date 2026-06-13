import SwiftUI
import AuthenticationServices
import GoogleSignIn
import WebKit

struct AuthView: View {
    @EnvironmentObject private var authStore: AuthStore
    @State private var showEmailOTP = false
    @State private var showWebAuth: OAuthProvider?

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "#252836"), Color(hex: "#1a1d2a")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    Spacer().frame(height: 40)

                    // Logo / header
                    VStack(spacing: 12) {
                        Image(systemName: "car.2.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(.bzPrimary)
                        Text("БезНомера")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                        Text("Свяжитесь с любым водителем по QR-коду")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }

                    // Auth buttons
                    VStack(spacing: 12) {
                        // Apple
                        SignInWithAppleButton(.signIn) { request in
                            request.requestedScopes = [.fullName, .email]
                        } onCompletion: { result in
                            Task { await authStore.signInWithApple(result: result) }
                        }
                        .signInWithAppleButtonStyle(.white)
                        .frame(height: 50)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                        // Google
                        authButton(title: "Войти через Google", icon: "g.circle.fill", color: .white) {
                            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                                  let vc = scene.windows.first?.rootViewController else { return }
                            Task { await authStore.signInWithGoogle(presenting: vc) }
                        }

                        // Divider
                        HStack {
                            Divider().background(Color.white.opacity(0.15))
                            Text("или")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, 8)
                            Divider().background(Color.white.opacity(0.15))
                        }

                        // Yandex, VK, Telegram
                        HStack(spacing: 12) {
                            oauthIconButton(label: "Яндекс", systemImage: "y.circle.fill", color: Color(hex: "#FFCC00")) {
                                showWebAuth = .yandex
                            }
                            oauthIconButton(label: "VK", systemImage: "v.circle.fill", color: Color(hex: "#0077FF")) {
                                showWebAuth = .vk
                            }
                            oauthIconButton(label: "Telegram", systemImage: "paperplane.circle.fill", color: Color(hex: "#26A5E4")) {
                                showWebAuth = .telegram
                            }
                        }

                        // Email OTP
                        Button {
                            showEmailOTP = true
                        } label: {
                            HStack {
                                Image(systemName: "envelope.fill")
                                Text("Войти по email")
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.white.opacity(0.06))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                    }
                    .padding(.horizontal, 24)

                    if let error = authStore.error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }

                    Spacer().frame(height: 40)
                }
            }

            if authStore.isLoading {
                Color.black.opacity(0.3).ignoresSafeArea()
                ProgressView().tint(.white)
            }
        }
        .sheet(isPresented: $showEmailOTP) {
            EmailOTPView()
        }
        .sheet(item: $showWebAuth) { provider in
            WebAuthView(provider: provider) { token in
                showWebAuth = nil
                authStore.handleWebAuthToken(token)
            }
        }
    }

    private func authButton(title: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: icon)
                Text(title)
            }
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.black)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(color)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
    }

    private func oauthIconButton(label: String, systemImage: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: systemImage)
                    .font(.system(size: 28))
                    .foregroundStyle(color)
                Text(label)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.white.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
    }
}

// MARK: – OAuth providers

enum OAuthProvider: String, Identifiable {
    case yandex, vk, telegram
    var id: String { rawValue }

    var authURL: URL {
        URL(string: "https://beznomera.net/api/auth/\(rawValue)")!
    }
}

// MARK: – WebView for OAuth (Yandex/VK/Telegram)

private struct _WebAuthWebView: UIViewRepresentable {
    let provider: OAuthProvider
    let onTokenReceived: (String) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(onTokenReceived: onTokenReceived) }

    func makeUIView(context: Context) -> WKWebView {
        let wv = WKWebView()
        wv.navigationDelegate = context.coordinator
        wv.load(URLRequest(url: provider.authURL))
        return wv
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        let onTokenReceived: (String) -> Void
        init(onTokenReceived: @escaping (String) -> Void) { self.onTokenReceived = onTokenReceived }

        func webView(_ webView: WKWebView, didFinish _: WKNavigation!) {
            guard let url = webView.url, !url.path.contains("/auth") else { return }
            webView.configuration.websiteDataStore.httpCookieStore.getAllCookies { cookies in
                DispatchQueue.main.async {
                    if let cookie = cookies.first(where: { $0.name == "auth" && $0.domain.contains("beznomera.net") }) {
                        self.onTokenReceived(cookie.value)
                    }
                }
            }
        }
    }
}

struct WebAuthView: View {
    let provider: OAuthProvider
    let onTokenReceived: (String) -> Void

    var body: some View {
        NavigationStack {
            _WebAuthWebView(provider: provider, onTokenReceived: onTokenReceived)
                .ignoresSafeArea()
                .navigationTitle(provider.rawValue.capitalized)
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}
