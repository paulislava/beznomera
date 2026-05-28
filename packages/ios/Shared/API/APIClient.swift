import Foundation

enum APIError: Error {
    case unauthorized
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)
}

actor APIClient {
    static let shared = APIClient()
    static let baseURL = "https://beznomera.net/api"

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }()

    private var token: String? { SharedDefaults.token }

    func get<T: Decodable>(_ path: String) async throws -> T {
        try await request(path, method: "GET", body: nil as EmptyBody?)
    }

    func post<B: Encodable, T: Decodable>(_ path: String, body: B) async throws -> T {
        try await request(path, method: "POST", body: body)
    }

    func postVoid<B: Encodable>(_ path: String, body: B) async throws {
        let _: EmptyResponse = try await request(path, method: "POST", body: body)
    }

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

        if let t = token {
            req.setValue("Bearer \(t)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            req.httpBody = try JSONEncoder().encode(body)
        }

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
