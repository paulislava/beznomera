import SwiftUI
import WebKit

struct LoginView: View {
    let onLoggedIn: () -> Void

    var body: some View {
        WebAuthView(onTokenReceived: { token in
            AuthService.saveToken(token)
            onLoggedIn()
        })
        .ignoresSafeArea()
    }
}

// MARK: - WKWebView wrapper

private struct WebAuthView: UIViewRepresentable {
    let onTokenReceived: (String) -> Void
    static let authURL = URL(string: "https://beznomera.net/auth")!

    func makeCoordinator() -> Coordinator {
        Coordinator(onTokenReceived: onTokenReceived)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: Self.authURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        let onTokenReceived: (String) -> Void

        init(onTokenReceived: @escaping (String) -> Void) {
            self.onTokenReceived = onTokenReceived
        }

        func webView(_ webView: WKWebView, didFinish _: WKNavigation!) {
            guard let url = webView.url, !url.path.contains("/auth") else { return }
            extractToken(from: webView)
        }

        private func extractToken(from webView: WKWebView) {
            webView.configuration.websiteDataStore.httpCookieStore.getAllCookies { cookies in
                DispatchQueue.main.async {
                    if let cookie = cookies.first(where: {
                        $0.name == "auth" && $0.domain.contains("beznomera.net")
                    }) {
                        self.onTokenReceived(cookie.value)
                    }
                }
            }
        }
    }
}
