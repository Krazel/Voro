import UIKit
import Capacitor
import StoreKit
import AVFAudio

class VoroBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(VoroReviewPlugin())
        bridge?.registerPluginInstance(VoroBenchmarkDisplayPlugin())
        bridge?.registerPluginInstance(VoroAudioDiagnosticsPlugin())
        bridge?.registerPluginInstance(VoroMusicPlugin())
    }
}

// Coordinates WKWebView playback with native activity. Never configures or records AVAudioSession.
@objc(VoroAudioDiagnosticsPlugin)
public class VoroAudioDiagnosticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoroAudioDiagnosticsPlugin"
    public let jsName = "VoroAudioDiagnostics"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "snapshot", returnType: CAPPluginReturnPromise)]
    private var events: [[String: Any]] = []
    private var sequence = 0
    private var appActive = false
    private var mediaSuspended = false
    private var mediaReleasePending = false
    private var mediaRevision = 0
    public override func load() {
        appActive = UIApplication.shared.applicationState == .active
        updateMediaSuspension()
        for name in [AVAudioSession.interruptionNotification, AVAudioSession.routeChangeNotification,
                     AVAudioSession.mediaServicesWereLostNotification, AVAudioSession.mediaServicesWereResetNotification,
                     UIApplication.willResignActiveNotification, UIApplication.didEnterBackgroundNotification,
                     UIApplication.didBecomeActiveNotification] {
            NotificationCenter.default.addObserver(self, selector: #selector(observe(_:)), name: name, object: nil)
        }
        capture("native-load", info: [:])
    }
    deinit { NotificationCenter.default.removeObserver(self) }
    private func activity() -> [String: Any] {
        return ["sequence": sequence, "allowed": appActive && !mediaSuspended && !mediaReleasePending,
                "appActive": appActive, "mediaSuspended": mediaSuspended, "releasePending": mediaReleasePending]
    }
    private func updateMediaSuspension() {
        let suspended = !appActive
        guard mediaSuspended != suspended else { return }
        mediaSuspended = suspended
        mediaReleasePending = !suspended
        mediaRevision += 1
        let revision = mediaRevision
        guard let webView = bridge?.webView else { mediaReleasePending = false; return }
        // Pause as well as block: releasing the block must not autoplay a paused game.
        if suspended { webView.pauseAllMediaPlayback(completionHandler: nil) }
        webView.setAllMediaPlaybackSuspended(suspended) { [weak self] in
            guard let self = self, self.mediaRevision == revision else { return }
            self.mediaReleasePending = false
            self.capture(suspended ? "native-media-blocked" : "native-media-ready", info: [:])
        }
    }
    private func state() -> [String: Any] {
        let s = AVAudioSession.sharedInstance()
        return ["wallMs": Date().timeIntervalSince1970 * 1000,
                "sampleRate": s.sampleRate, "ioBufferDuration": s.ioBufferDuration,
                "outputLatency": s.outputLatency, "outputVolume": s.outputVolume,
                "category": s.category.rawValue, "mode": s.mode.rawValue,
                "otherAudioPlaying": s.isOtherAudioPlaying,
                "secondaryAudioShouldBeSilenced": s.secondaryAudioShouldBeSilencedHint,
                "outputTypes": s.currentRoute.outputs.map { $0.portType.rawValue },
                "os": UIDevice.current.systemVersion, "deviceFamily": UIDevice.current.model]
    }
    @objc private func observe(_ notification: Notification) {
        var info: [String: Any] = [:]
        for key in [AVAudioSessionInterruptionTypeKey, AVAudioSessionInterruptionOptionKey, AVAudioSessionRouteChangeReasonKey] {
            if let value = notification.userInfo?[key] as? NSNumber { info[key] = value }
        }
        let name = notification.name
        let apply = { [weak self] in
            guard let self = self else { return }
            if name == UIApplication.willResignActiveNotification || name == UIApplication.didEnterBackgroundNotification {
                self.appActive = false; self.updateMediaSuspension()
            } else if name == UIApplication.didBecomeActiveNotification {
                self.appActive = true; self.updateMediaSuspension()
            }
            self.capture(name.rawValue, info: info)
        }
        // UIKit activity notifications are already on main: block playback now.
        if Thread.isMainThread { apply() } else { DispatchQueue.main.async(execute: apply) }
    }
    private func capture(_ type: String, info: [String: Any]) {
        sequence += 1
        let event: [String: Any] = ["sequence": sequence, "type": type, "info": info, "session": state(), "activity": activity()]
        events.append(event)
        if events.count > 40 { events.removeFirst(events.count - 40) }
        notifyListeners("audioSession", data: event)
    }
    @objc func snapshot(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(["session": self.state(), "events": self.events, "activity": self.activity()]) }
    }
}

@objc(VoroBenchmarkDisplayPlugin)
public class VoroBenchmarkDisplayPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoroBenchmarkDisplayPlugin"
    public let jsName = "VoroBenchmarkDisplay"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "setActive", returnType: CAPPluginReturnPromise)]
    private var requested = false
    private var previousIdleState = false

    public override func load() {
        NotificationCenter.default.addObserver(self, selector: #selector(suspend), name: UIApplication.willResignActiveNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(resume), name: UIApplication.didBecomeActiveNotification, object: nil)
    }
    @objc func setActive(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let active = call.getBool("active") ?? false
            if active && !self.requested { self.previousIdleState = UIApplication.shared.isIdleTimerDisabled }
            self.requested = active
            UIApplication.shared.isIdleTimerDisabled = active
                ? UIApplication.shared.applicationState == .active : self.previousIdleState
            call.resolve()
        }
    }
    @objc private func suspend() {
        if requested { UIApplication.shared.isIdleTimerDisabled = false }
    }
    @objc private func resume() {
        if requested { UIApplication.shared.isIdleTimerDisabled = true }
    }
    deinit { NotificationCenter.default.removeObserver(self) }
}

@objc(VoroReviewPlugin)
public class VoroReviewPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoroReviewPlugin"
    public let jsName = "VoroReview"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise)
    ]
    // New production-only key: old TestFlight attempts must not suppress release requests.
    private let attemptedKey = "voro.review.waterCompleted.productionAttempt.v2"
    private var presenting = false

    private var isReviewTest: Bool {
        #if DEBUG
        return true
        #else
        return Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
        #endif
    }

    @objc func request(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  !self.presenting,
                  let controller = self.bridge?.viewController,
                  controller.presentedViewController == nil,
                  let scene = controller.view.window?.windowScene,
                  scene.activationState == .foregroundActive else {
                call.resolve(["attempted": false, "finished": false]); return
            }
            if self.isReviewTest {
                // TestFlight suppresses StoreKit's actual prompt. This labelled native
                // preview exercises the pause/close path without recording a rating.
                self.presenting = true
                let english = call.getString("language") == "en"
                let alert = UIAlertController(
                    title: english ? "Rating test · TestFlight" : "Prueba de valoración · TestFlight",
                    message: english
                        ? "Second environment completed. The game is paused. Apple disables real rating prompts in TestFlight; this preview sends no review."
                        : "Segundo entorno completado. La partida está en pausa. Apple desactiva la valoración real en TestFlight; esta prueba no envía reseñas.",
                    preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: english ? "Continue" : "Continuar", style: .default) { _ in
                    self.presenting = false
                    call.resolve(["attempted": true, "finished": true])
                })
                controller.present(alert, animated: true)
                return
            }
            let defaults = UserDefaults.standard
            if defaults.bool(forKey: self.attemptedKey) {
                call.resolve(["attempted": false, "finished": true]); return
            }
            defaults.set(true, forKey: self.attemptedKey)
            if #available(iOS 16.0, *) {
                AppStore.requestReview(in: scene)
            } else {
                SKStoreReviewController.requestReview(in: scene)
            }
            // No StoreKit dismissal callback exists. Keep the checkpoint paused
            // until the player explicitly continues, even if Apple shows no prompt.
            call.resolve(["attempted": true, "finished": false])
        }
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = VoroBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
