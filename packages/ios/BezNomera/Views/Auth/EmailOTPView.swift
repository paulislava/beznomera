import SwiftUI

struct EmailOTPView: View {
    @EnvironmentObject private var authStore: AuthStore
    @Environment(\.dismiss) private var dismiss

    @State private var email = ""
    @State private var code = ""
    @State private var step: Step = .email

    enum Step { case email, code }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer().frame(height: 20)

                Image(systemName: "envelope.badge.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.bzPrimary)

                VStack(spacing: 8) {
                    Text(step == .email ? "Войти по email" : "Введите код")
                        .font(.title2.bold())
                    Text(step == .email
                         ? "Отправим одноразовый код на вашу почту"
                         : "Код отправлен на \(email)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }

                VStack(spacing: 16) {
                    if step == .email {
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .padding()
                            .background(Color.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                        Button {
                            Task { await sendCode() }
                        } label: {
                            Group {
                                if authStore.isLoading {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Получить код")
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.bzPrimary)
                        .disabled(email.isEmpty || authStore.isLoading)
                    } else {
                        TextField("6-значный код", text: $code)
                            .textContentType(.oneTimeCode)
                            .keyboardType(.numberPad)
                            .font(.system(size: 28, weight: .bold, design: .monospaced))
                            .multilineTextAlignment(.center)
                            .padding()
                            .background(Color.white.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                        Button {
                            Task { await verifyCode() }
                        } label: {
                            Group {
                                if authStore.isLoading {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Войти")
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.bzPrimary)
                        .disabled(code.count < 4 || authStore.isLoading)

                        Button("Отправить код снова") {
                            Task { await sendCode() }
                        }
                        .font(.subheadline)
                        .foregroundStyle(.bzPrimary)
                    }
                }
                .padding(.horizontal, 24)

                if let error = authStore.error {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(.horizontal, 24)
                }

                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
            }
        }
    }

    private func sendCode() async {
        authStore.error = nil
        await authStore.startEmailOTP(email: email)
        if authStore.error == nil { step = .code }
    }

    private func verifyCode() async {
        await authStore.verifyEmailOTP(email: email, code: code)
        if authStore.isAuthenticated { dismiss() }
    }
}
