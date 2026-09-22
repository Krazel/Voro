import UIKit
import Capacitor
import StoreKit

class VoroBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(VoroReviewPlugin())
        bridge?.registerPluginInstance(VoroBenchmarkDisplayPlugin())
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
