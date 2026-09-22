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
    public let pluginMethods = [CAPPluginMethod(name: "setActive", returnType: CAPPluginReturnPromise)]
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
        CAPPluginMethod(name: "reach", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "request", returnType: CAPPluginReturnPromise)
    ]
    private let reachedKey = "voro.review.thirdEnvironment.reached"
    private let attemptedKey = "voro.review.thirdEnvironment.attempted"

    @objc func reach(_ call: CAPPluginCall) {
        UserDefaults.standard.set(true, forKey: reachedKey)
        call.resolve()
    }

    @objc func request(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { call.resolve(["attempted": false]); return }
            let defaults = UserDefaults.standard
            if defaults.bool(forKey: self.attemptedKey) {
                call.resolve(["attempted": true]); return
            }
            guard defaults.bool(forKey: self.reachedKey),
                  let controller = self.bridge?.viewController,
                  controller.presentedViewController == nil,
                  let scene = controller.view.window?.windowScene,
                  scene.activationState == .foregroundActive else {
                call.resolve(["attempted": false]); return
            }
            // Persist the attempt, never claim that Apple displayed a prompt or a rating was given.
            defaults.set(true, forKey: self.attemptedKey)
            if #available(iOS 16.0, *) {
                AppStore.requestReview(in: scene)
            } else {
                SKStoreReviewController.requestReview(in: scene)
            }
            call.resolve(["attempted": true])
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
