import Foundation

enum APIError: Error, LocalizedError {
    case unauthorized
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)

    var errorDescription: String? {
        switch self {
        case .unauthorized: return "Необходима авторизация"
        case .networkError(let e): return e.localizedDescription
        case .decodingError: return "Ошибка данных от сервера"
        case .serverError(let code): return "Ошибка сервера: \(code)"
        }
    }
}

actor APIClient {
    static let shared = APIClient()
    static let baseURL = "https://beznomera.net/api"

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    private var token: String? { KeychainHelper.token }

    var isAuthenticated: Bool { token != nil }

    // MARK: – Generic request

    func get<T: Decodable>(_ path: String) async throws -> T {
        try await request(path, method: "GET", body: nil as EmptyBody?)
    }

    func post<B: Encodable, T: Decodable>(_ path: String, body: B) async throws -> T {
        try await request(path, method: "POST", body: body)
    }

    func put<B: Encodable, T: Decodable>(_ path: String, body: B) async throws -> T {
        try await request(path, method: "PUT", body: body)
    }

    func delete(_ path: String) async throws {
        let _: EmptyResponse = try await request(path, method: "DELETE", body: nil as EmptyBody?)
    }

    func postVoid<B: Encodable>(_ path: String, body: B) async throws {
        let _: EmptyResponse = try await request(path, method: "POST", body: body)
    }

    func postMultipart(_ path: String, data: Data, mimeType: String, fieldName: String) async throws -> Data {
        guard let url = URL(string: Self.baseURL + path) else { throw APIError.serverError(0) }
        let boundary = UUID().uuidString
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        if let t = token { req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization") }

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"\(fieldName)\"; filename=\"file\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        req.httpBody = body

        let (responseData, response) = try await URLSession.shared.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if status == 401 { throw APIError.unauthorized }
        guard (200..<300).contains(status) else { throw APIError.serverError(status) }
        return responseData
    }

    // MARK: – Private

    private func request<B: Encodable, T: Decodable>(
        _ path: String,
        method: String,
        body: B?
    ) async throws -> T {
        guard let url = URL(string: Self.baseURL + path) else {
            throw APIError.serverError(0)
        }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let t = token { req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try JSONEncoder().encode(body) }

        let (data, response) = try await URLSession.shared.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if status == 401 { throw APIError.unauthorized }
        guard (200..<300).contains(status) else { throw APIError.serverError(status) }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }
}

private struct EmptyBody: Encodable {}
private struct EmptyResponse: Decodable {}
