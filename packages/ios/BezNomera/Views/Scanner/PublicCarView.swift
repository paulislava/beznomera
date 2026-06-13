import SwiftUI

struct PublicCarView: View {
    @EnvironmentObject private var chatsStore: ChatsStore
    @Environment(\.dismiss) private var dismiss
    let code: String

    @State private var car: CarInfo?
    @State private var isLoading = true
    @State private var error: String?
    @State private var showMessageForm = false
    @State private var userRating: Int = 0
    @State private var ratingSubmitted = false

    private let carService = CarService()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.bzBackground.ignoresSafeArea()

                if isLoading {
                    ProgressView()
                } else if let error {
                    ContentUnavailableView("Ошибка", systemImage: "exclamationmark.triangle", description: Text(error))
                } else if let car {
                    carContent(car)
                }
            }
            .navigationTitle(car?.no ?? "Автомобиль")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Закрыть") { dismiss() }
                }
            }
            .sheet(isPresented: $showMessageForm) {
                if let car { PublicMessageFormView(carCode: car.code) }
            }
            .task { await loadCar() }
        }
    }

    private func carContent(_ car: CarInfo) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                // Car image
                if let url = car.imageUrl.flatMap(URL.init) {
                    AsyncImage(url: url) { image in
                        image.resizable().scaledToFill()
                    } placeholder: { carPlaceholder }
                        .frame(height: 180)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                } else {
                    carPlaceholder.frame(height: 140)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                }

                // Info
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        PlateView(no: car.no)
                        Spacer()
                        if let rating = car.rating {
                            HStack(spacing: 3) {
                                Image(systemName: "star.fill").foregroundStyle(.yellow)
                                Text(String(format: "%.1f", rating))
                                    .font(.subheadline.bold())
                                Text("(\(car.ratesCount))")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                    if let brand = car.brand { Text(brand.title).font(.subheadline).foregroundStyle(.secondary) }
                    if let model = car.model { Text(model).font(.subheadline).foregroundStyle(.secondary) }
                }
                .padding(16)
                .glassCard()

                // Rating
                if !ratingSubmitted {
                    ratingSection(car)
                } else {
                    Text("Спасибо за оценку!")
                        .font(.subheadline)
                        .foregroundStyle(.bzPrimary)
                        .padding(16)
                        .glassCard()
                }

                // Write message button
                Button {
                    showMessageForm = true
                } label: {
                    Label("Написать владельцу", systemImage: "bubble.left.fill")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(.bzPrimary)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
    }

    private func ratingSection(_ car: CarInfo) -> some View {
        VStack(spacing: 10) {
            Text("Оцените водителя")
                .font(.subheadline.weight(.medium))
            HStack(spacing: 8) {
                ForEach(1...5, id: \.self) { star in
                    Image(systemName: star <= userRating ? "star.fill" : "star")
                        .font(.title2)
                        .foregroundStyle(star <= userRating ? .yellow : .secondary)
                        .onTapGesture {
                            userRating = star
                            Task { await submitRating(car: car) }
                        }
                }
            }
        }
        .padding(16)
        .glassCard()
    }

    private var carPlaceholder: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(Color.bzPrimary.opacity(0.1))
            .overlay(Image(systemName: "car.fill").font(.system(size: 48)).foregroundStyle(.bzPrimary.opacity(0.5)))
    }

    private func loadCar() async {
        isLoading = true
        do {
            car = try await carService.fetchCarByCode(code)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    private func submitRating(car: CarInfo) async {
        do {
            try await CarService().rateCar(code: car.code, rating: userRating)
            ratingSubmitted = true
        } catch {}
    }
}

struct PublicMessageFormView: View {
    @EnvironmentObject private var chatsStore: ChatsStore
    @Environment(\.dismiss) private var dismiss
    let carCode: String

    @State private var text = ""
    @State private var contactType = "tel"
    @State private var contactValue = ""
    @State private var senderName = ""
    @State private var isSent = false
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Сообщение") {
                    TextEditor(text: $text)
                        .frame(minHeight: 80)
                }
                Section("Контакт для ответа") {
                    Picker("Способ", selection: $contactType) {
                        Text("Телефон").tag("tel")
                        Text("Email").tag("email")
                        Text("Telegram").tag("telegram")
                    }
                    .pickerStyle(.segmented)
                    TextField(contactPlaceholder, text: $contactValue)
                        .keyboardType(contactType == "tel" ? .phonePad : .emailAddress)
                        .autocapitalization(.none)
                }
                Section("Ваше имя (необязательно)") {
                    TextField("Имя", text: $senderName)
                }
                if let error { Section { Text(error).foregroundStyle(.red).font(.caption) } }
            }
            .navigationTitle("Написать владельцу")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Отмена") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Отправить") { Task { await send() } }
                        .disabled(text.isEmpty || contactValue.isEmpty || isLoading)
                }
            }
        }
        .alert("Сообщение отправлено", isPresented: $isSent) {
            Button("OK") { dismiss() }
        }
    }

    private var contactPlaceholder: String {
        switch contactType {
        case "tel": return "+7 (999) 000-00-00"
        case "email": return "email@example.com"
        default: return "@username"
        }
    }

    private func send() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await chatsStore.sendPublicMessage(
                carCode: carCode,
                text: text,
                contactType: contactType,
                contactValue: contactValue,
                senderName: senderName.isEmpty ? nil : senderName
            )
            isSent = true
        } catch {
            self.error = error.localizedDescription
        }
    }
}
