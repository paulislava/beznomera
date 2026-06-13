import SwiftUI

@MainActor
final class CarsStore: ObservableObject {
    @Published private(set) var cars: [CarInfo] = []
    @Published private(set) var brands: [BrandInfo] = []
    @Published private(set) var isLoading = false
    @Published var error: String?

    private let service = CarService()

    func loadCars() async {
        isLoading = true
        defer { isLoading = false }
        do {
            cars = try await service.fetchCars()
            error = nil
        } catch APIError.unauthorized {
            error = nil
        } catch {
            self.error = error.localizedDescription
        }
    }

    func loadBrands() async {
        guard brands.isEmpty else { return }
        do {
            brands = try await service.fetchBrands()
        } catch {}
    }

    func createCar(_ dto: CarCreateDTO) async throws {
        let car = try await service.createCar(dto)
        cars.insert(car, at: 0)
    }

    func updateCar(id: Int, _ dto: CarUpdateDTO) async throws {
        let updated = try await service.updateCar(id: id, dto)
        if let idx = cars.firstIndex(where: { $0.id == id }) {
            cars[idx] = updated
        }
    }

    func deleteCar(id: Int) async throws {
        try await service.deleteCar(id: id)
        cars.removeAll { $0.id == id }
    }

    func uploadImage(carId: Int, data: Data) async throws {
        try await service.uploadCarImage(id: carId, data: data)
        // Refresh car info after upload
        let updated = try await service.fetchCarFullInfo(id: carId)
        if let idx = cars.firstIndex(where: { $0.id == carId }) {
            cars[idx] = updated
        }
    }

    func addDriver(carId: Int, _ dto: AddDriverDTO) async throws {
        try await service.addDriver(carId: carId, dto)
        let updated = try await service.fetchCarFullInfo(id: carId)
        if let idx = cars.firstIndex(where: { $0.id == carId }) {
            cars[idx] = updated
        }
    }

    func removeDriver(carId: Int, driverId: Int) async throws {
        try await service.removeDriver(carId: carId, driverId: driverId)
        let updated = try await service.fetchCarFullInfo(id: carId)
        if let idx = cars.firstIndex(where: { $0.id == carId }) {
            cars[idx] = updated
        }
    }

    func loadCarByCode(_ code: String) async throws -> CarInfo {
        try await service.fetchCarByCode(code)
    }

    func rateCar(code: String, rating: Int) async throws {
        try await service.rateCar(code: code, rating: rating)
    }
}
