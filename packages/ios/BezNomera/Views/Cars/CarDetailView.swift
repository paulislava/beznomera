import SwiftUI

struct CarDetailView: View {
    @EnvironmentObject private var carsStore: CarsStore
    let car: CarInfo

    @State private var showEdit = false
    @State private var showQR = false
    @State private var showAddDriver = false
    @State private var deleteError: String?
    @State private var showDeleteConfirm = false
    @Environment(\.dismiss) private var dismiss

    // Use live version from store when available
    private var liveCar: CarInfo {
        carsStore.cars.first(where: { $0.id == car.id }) ?? car
    }

    var body: some View {
        ZStack {
            Color.bzBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 16) {
                    // Car image
                    carImageHeader

                    // Main info card
                    infoCard

                    // Rating card
                    ratingCard

                    // Drivers section
                    driversSection

                    // Danger zone
                    dangerZone
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(liveCar.no)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button { showEdit = true } label: { Label("Редактировать", systemImage: "pencil") }
                    Button { showQR = true } label: { Label("QR-код", systemImage: "qrcode") }
                    Divider()
                    Button(role: .destructive) { showDeleteConfirm = true } label: {
                        Label("Удалить авто", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showEdit) {
            CarFormView(mode: .edit(liveCar))
        }
        .sheet(isPresented: $showQR) {
            CarQRView(car: liveCar)
        }
        .sheet(isPresented: $showAddDriver) {
            AddDriverView(carId: liveCar.id)
        }
        .confirmationDialog("Удалить автомобиль \(liveCar.no)?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Удалить", role: .destructive) {
                Task {
                    try? await carsStore.deleteCar(id: liveCar.id)
                    dismiss()
                }
            }
        }
    }

    // MARK: – Sections

    private var carImageHeader: some View {
        Group {
            if let url = liveCar.imageUrl.flatMap(URL.init) {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    imagePlaceholder
                }
                .frame(height: 200)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            } else {
                imagePlaceholder
                    .frame(height: 160)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
        }
    }

    private var imagePlaceholder: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(Color.bzPrimary.opacity(0.12))
            .overlay(
                VStack(spacing: 8) {
                    Image(systemName: "car.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.bzPrimary.opacity(0.6))
                    PlateView(no: liveCar.no)
                }
            )
    }

    private var infoCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            infoRow(label: "Госномер", value: liveCar.no)
            if let brand = liveCar.brand {
                infoRow(label: "Марка", value: brand.title)
            }
            if let model = liveCar.model {
                infoRow(label: "Модель", value: model)
            }
            if let year = liveCar.year {
                infoRow(label: "Год", value: "\(year)")
            }
            if let color = liveCar.color {
                HStack {
                    Text("Цвет")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Circle()
                        .fill(Color(red: Double(color.r)/255, green: Double(color.g)/255, blue: Double(color.b)/255))
                        .frame(width: 22, height: 22)
                        .overlay(Circle().stroke(Color.white.opacity(0.3), lineWidth: 1))
                }
            }
        }
        .padding(16)
        .glassCard()
    }

    private var ratingCard: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Рейтинг")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .foregroundStyle(.yellow)
                    Text(liveCar.rating.map { String(format: "%.1f", $0) } ?? "—")
                        .font(.title3.bold())
                    Text("(\(liveCar.ratesCount) оценок)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            Image(systemName: "qrcode")
                .font(.title2)
                .foregroundStyle(.bzPrimary)
                .onTapGesture { showQR = true }
        }
        .padding(16)
        .glassCard()
    }

    private var driversSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Водители")
                    .font(.headline)
                Spacer()
                Button {
                    showAddDriver = true
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .foregroundStyle(.bzPrimary)
                }
            }

            if liveCar.drivers.isEmpty {
                Text("Нет водителей")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(liveCar.drivers) { driver in
                    DriverRow(driver: driver, carId: liveCar.id)
                }
            }
        }
        .padding(16)
        .glassCard()
    }

    private var dangerZone: some View {
        Button(role: .destructive) {
            showDeleteConfirm = true
        } label: {
            Label("Удалить автомобиль", systemImage: "trash")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.bordered)
        .tint(.red)
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
        }
    }
}

struct DriverRow: View {
    @EnvironmentObject private var carsStore: CarsStore
    let driver: DriverInfo
    let carId: Int

    var body: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(Color.avatarColor(for: driver.id))
                .frame(width: 36, height: 36)
                .overlay(
                    Text(driver.firstName.prefix(1).uppercased())
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                )

            VStack(alignment: .leading, spacing: 2) {
                Text(driver.displayName)
                    .font(.subheadline.weight(.medium))
                if driver.isOwner {
                    Text("Владелец")
                        .font(.caption2)
                        .foregroundStyle(.bzPrimary)
                } else if let tel = driver.tel {
                    Text(tel)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            if !driver.isOwner {
                Button {
                    Task { try? await carsStore.removeDriver(carId: carId, driverId: driver.id) }
                } label: {
                    Image(systemName: "xmark.circle")
                        .foregroundStyle(.red.opacity(0.7))
                }
            }
        }
    }
}

struct AddDriverView: View {
    @EnvironmentObject private var carsStore: CarsStore
    @Environment(\.dismiss) private var dismiss
    let carId: Int

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var tel = ""
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Имя") {
                    TextField("Имя *", text: $firstName)
                    TextField("Фамилия", text: $lastName)
                }
                Section("Контакт") {
                    TextField("Телефон", text: $tel)
                        .keyboardType(.phonePad)
                }
                if let error { Text(error).foregroundStyle(.red).font(.caption) }
            }
            .navigationTitle("Добавить водителя")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Отмена") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Добавить") {
                        Task { await save() }
                    }
                    .disabled(firstName.isEmpty || isLoading)
                }
            }
        }
    }

    private func save() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let dto = AddDriverDTO(
                firstName: firstName,
                lastName: lastName.isEmpty ? nil : lastName,
                tel: tel.isEmpty ? nil : tel
            )
            try await carsStore.addDriver(carId: carId, dto)
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
