import Foundation
import WatchConnectivity

final class ILostSyncService: NSObject, WCSessionDelegate {
    var onRemoteData: (([LostItem], [LostItemStats]) -> Void)?

    private var session: WCSession?

    override init() {
        super.init()
        guard WCSession.isSupported() else { return }
        let s = WCSession.default
        s.delegate = self
        s.activate()
        session = s
    }

    func send(items: [LostItem], stats: [LostItemStats]) {
        guard let session, session.activationState == .activated else { return }
        #if os(iOS)
        guard session.isWatchAppInstalled else { return }
        #endif

        let encoder = JSONEncoder()
        let context: [String: Any] = [
            "items": (try? encoder.encode(items)) ?? Data(),
            "stats": (try? encoder.encode(stats)) ?? Data()
        ]
        try? session.updateApplicationContext(context)
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        let decoder = JSONDecoder()
        let items = (applicationContext["items"] as? Data).flatMap { try? decoder.decode([LostItem].self, from: $0) } ?? []
        let stats = (applicationContext["stats"] as? Data).flatMap { try? decoder.decode([LostItemStats].self, from: $0) } ?? []
        DispatchQueue.main.async { self.onRemoteData?(items, stats) }
    }

    #if os(iOS)
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { session.activate() }
    #endif
}
