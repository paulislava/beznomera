import SwiftUI

struct CarFormView: View {
    @EnvironmentObject private var carsStore: CarsStore
    @Environment(\.dismiss) private var dismiss

    enum Mode {
        case create
        case edit(CarInfo)
    }

    let mode: Mode

    @State private var no = ""
    @State private var selectedBrandId: Int?
    @State private var model = ""
    @State private var yearText = ""
    @State private var selectedColor: Color = .white
    @State private var isLoading = false
    @State private var error: String?

    private var title: String {
        switch mode { case .create: "Новый автомобиль"; case .edit: "Редактировать" }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Госномер") {
                    TextField("А000АА 00", text: $no)
                        .textInputAutocapitalization(.characters)
                }

                Section("Автомобиль") {
                    Picker("Марка", selection: $selectedBrandId) {
                        Text("Не выбрана").tag(nil as Int?)
                        ForEach(carsStore.brands) { brand in
                            Text(brand.title).tag(brand.id as Int?)
                        }
                    }
                    TextField("Модель", text: $model)
                    TextField("Год выпуска", text: $yearText)
                        .keyboardType(.numberPad)
                }

                Section("Цвет") {
                    ColorPicker("Цвет автомобиля", selection: $selectedColor, supportsOpacity: false)
                }

                if let error {
                    Section { Text(error).foregroundStyle(.red).font(.caption) }
                }
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Отмена") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") { Task { await save() } }
                        .disabled(no.isEmpty || isLoading)
                }
            }
            .task { await carsStore.loadBrands() }
            .onAppear { prefill() }
        }
    }

    private func prefill() {
        if case .edit(let car) = mode {
            no = car.no
            selectedBrandId = car.brand?.id
            model = car.model ?? ""
            yearText = car.year.map(String.init) ?? ""
            if let c = car.color {
                selectedColor = Color(red: Double(c.r)/255, green: Double(c.g)/255, blue: Double(c.b)/255)
            }
        }
    }

    private func save() async {
        isLoading = true
        defer { isLoading = false }
        let rgb = selectedColor.rgbComponents
        do {
            switch mode {
            case .create:
                let dto = CarCreateDTO(
                    no: no,
                    brandId: selectedBrandId,
                    model: model.isEmpty ? nil : model,
                    year: Int(yearText),
                    colorR: rgb?.r,
                    colorG: rgb?.g,
                    colorB: rgb?.b
                )
                try await carsStore.createCar(dto)
            case .edit(let car):
                let dto = CarUpdateDTO(
                    no: no.isEmpty ? nil : no,
                    brandId: selectedBrandId,
                    model: model.isEmpty ? nil : model,
                    year: Int(yearText),
                    colorR: rgb?.r,
                    colorG: rgb?.g,
                    colorB: rgb?.b
                )
                try await carsStore.updateCar(id: car.id, dto)
            }
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

// Extract RGB from SwiftUI Color
private extension Color {
    var rgbComponents: (r: Int, g: Int, b: Int)? {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0
        guard UIColor(self).getRed(&r, green: &g, blue: &b, alpha: nil) else { return nil }
        return (Int(r * 255), Int(g * 255), Int(b * 255))
    }
}
