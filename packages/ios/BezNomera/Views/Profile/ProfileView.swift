import SwiftUI
import PhotosUI

struct ProfileView: View {
    @EnvironmentObject private var authStore: AuthStore
    @EnvironmentObject private var profileStore: ProfileStore
    @State private var showEdit = false
    @State private var showLinkedAccounts = false
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var avatarUploadError: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.bzBackground.ignoresSafeArea()

                List {
                    // Avatar + name header
                    Section {
                        HStack(spacing: 16) {
                            avatarView
                            VStack(alignment: .leading, spacing: 4) {
                                Text(profileStore.profile?.displayName ?? "Загрузка...")
                                    .font(.title3.bold())
                                if let email = profileStore.profile?.email {
                                    Text(email)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                                if let tel = profileStore.profile?.tel {
                                    Text(tel)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .padding(.vertical, 8)
                    }
                    .listRowBackground(Color.bzSecondary)

                    // Actions
                    Section {
                        Button {
                            showEdit = true
                        } label: {
                            Label("Редактировать профиль", systemImage: "pencil")
                        }

                        Button {
                            showLinkedAccounts = true
                        } label: {
                            Label("Привязанные аккаунты", systemImage: "link")
                        }
                    }
                    .listRowBackground(Color.bzSecondary)

                    // Danger
                    Section {
                        Button(role: .destructive) {
                            authStore.signOut()
                        } label: {
                            Label("Выйти из аккаунта", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    }
                    .listRowBackground(Color.bzSecondary)
                }
                .listStyle(.insetGrouped)
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Профиль")
            .sheet(isPresented: $showEdit) {
                ProfileEditView()
            }
            .sheet(isPresented: $showLinkedAccounts) {
                LinkedAccountsView()
            }
            .task { if profileStore.profile == nil { await profileStore.loadProfile() } }
        }
    }

    private var avatarView: some View {
        PhotosPicker(selection: $selectedPhoto, matching: .images) {
            Group {
                if let avatarUrl = profileStore.profile?.avatarUrl, let url = URL(string: avatarUrl) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        avatarPlaceholder
                    }
                } else {
                    avatarPlaceholder
                }
            }
            .frame(width: 64, height: 64)
            .clipShape(Circle())
            .overlay(Circle().stroke(Color.bzPrimary.opacity(0.4), lineWidth: 2))
        }
        .onChange(of: selectedPhoto) { _, item in
            Task { await uploadAvatar(item: item) }
        }
    }

    private var avatarPlaceholder: some View {
        Circle()
            .fill(Color.bzPrimary.opacity(0.2))
            .overlay(
                Text(profileStore.profile?.initials ?? "?")
                    .font(.title2.bold())
                    .foregroundStyle(.bzPrimary)
            )
    }

    private func uploadAvatar(item: PhotosPickerItem?) async {
        guard let item,
              let data = try? await item.loadTransferable(type: Data.self) else { return }
        do {
            try await profileStore.uploadAvatar(data: data)
        } catch {
            avatarUploadError = error.localizedDescription
        }
    }
}
