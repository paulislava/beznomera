import SwiftUI

struct ProfileEditView: View {
    @EnvironmentObject private var profileStore: ProfileStore
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var nickname = ""
    @State private var tel = ""
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Имя") {
                    TextField("Имя", text: $firstName)
                    TextField("Фамилия", text: $lastName)
                    TextField("Никнейм", text: $nickname)
                        .autocapitalization(.none)
                }
                Section("Контакты") {
                    TextField("Телефон", text: $tel)
                        .keyboardType(.phonePad)
                }
                if let error { Section { Text(error).foregroundStyle(.red).font(.caption) } }
            }
            .navigationTitle("Редактирование")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Отмена") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") { Task { await save() } }
                        .disabled(isLoading)
                }
            }
            .onAppear { prefill() }
        }
    }

    private func prefill() {
        guard let profile = profileStore.profile else { return }
        firstName = profile.firstName ?? ""
        lastName = profile.lastName ?? ""
        nickname = profile.nickname ?? ""
        tel = profile.tel ?? ""
    }

    private func save() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let dto = ProfileUpdateDTO(
                firstName: firstName.isEmpty ? nil : firstName,
                lastName: lastName.isEmpty ? nil : lastName,
                nickname: nickname.isEmpty ? nil : nickname,
                tel: tel.isEmpty ? nil : tel
            )
            try await profileStore.updateProfile(dto)
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
