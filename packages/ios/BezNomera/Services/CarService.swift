import Foundation

struct CarService {
    private let api = APIClient.shared

    func fetchCars() async throws -> [CarInfo] {
        try await api.get("/car")
    }

    func fetchCarFullInfo(id: Int) async throws -> CarInfo {
        try await api.get("/car/\(id)/full-info")
    }

    func fetchCarByCode(_ code: String) async throws -> CarInfo {
        try await api.get("/car/\(code)/info")
    }

    func fetchBrands() async throws -> [BrandInfo] {
        try await api.get("/car/brands")
    }

    func createCar(_ dto: CarCreateDTO) async throws -> CarInfo {
        try await api.post("/car/create", body: dto)
    }

    func updateCar(id: Int, _ dto: CarUpdateDTO) async throws -> CarInfo {
        try await api.post("/car/\(id)/update", body: dto)
    }

    func deleteCar(id: Int) async throws {
        try await api.delete("/car/\(id)")
    }

    func uploadCarImage(id: Int, data: Data) async throws {
        _ = try await api.postMultipart("/car/\(id)/image", data: data, mimeType: "image/jpeg", fieldName: "image")
    }

    func addDriver(carId: Int, _ dto: AddDriverDTO) async throws {
        try await api.postVoid("/car/\(carId)/drivers", body: dto)
    }

    func removeDriver(carId: Int, driverId: Int) async throws {
        try await api.delete("/car/\(carId)/drivers/\(driverId)")
    }

    func rateCar(code: String, rating: Int) async throws {
        try await api.postVoid("/car/\(code)/rate", body: RateCarDTO(rating: rating))
    }
}
