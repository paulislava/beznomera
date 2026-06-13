import Foundation

struct BrandInfo: Codable, Identifiable, Hashable {
    let id: Int
    let title: String
    let slug: String
    let logoUrl: String?
}

struct ColorInfo: Codable, Hashable {
    let r: Int
    let g: Int
    let b: Int
}

struct DriverInfo: Codable, Identifiable, Hashable {
    let id: Int
    let firstName: String
    let lastName: String?
    let nickname: String?
    let tel: String?
    let telegramId: String?
    let isOwner: Bool
    let addedAt: String

    var displayName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
}

struct CarInfo: Codable, Identifiable, Hashable {
    let id: Int
    let no: String
    let brand: BrandInfo?
    let model: String?
    let version: String?
    let year: Int?
    let color: ColorInfo?
    let imageUrl: String?
    let rating: Double?
    let ratesCount: Int
    let code: String
    let drivers: [DriverInfo]

    var displayName: String {
        [brand?.title, model].compactMap { $0 }.joined(separator: " ")
    }
}

// MARK: – DTOs

struct CarCreateDTO: Encodable {
    var no: String
    var brandId: Int?
    var model: String?
    var year: Int?
    var colorR: Int?
    var colorG: Int?
    var colorB: Int?
}

struct CarUpdateDTO: Encodable {
    var no: String?
    var brandId: Int?
    var model: String?
    var year: Int?
    var colorR: Int?
    var colorG: Int?
    var colorB: Int?
}

struct AddDriverDTO: Encodable {
    var firstName: String
    var lastName: String?
    var tel: String?
    var telegramId: String?
}

struct RateCarDTO: Encodable {
    var rating: Int
}
