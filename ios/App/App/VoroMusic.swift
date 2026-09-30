import UIKit
import AVFAudio
import Capacitor

// Same playback stack and session policy as Tilt Arena's ClassicSound.
// Web Audio is retained only for the game's existing effects.
@objc(VoroMusicPlugin)
public class VoroMusicPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VoroMusicPlugin"
    public let jsName = "VoroMusic"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "setState", returnType: CAPPluginReturnPromise),
                                CAPPluginMethod(name: "snapshot", returnType: CAPPluginReturnPromise)]
    private let tracks = ["menu":"life-in-silico", "micro":"solace", "pond":"reverie", "land":"ephemera",
        "water":"sleep", "city":"meanwhile", "orbit":"cirrus", "planets":"hymn-to-the-dawn",
        "stars":"permafrost", "galaxies":"hiraeth", "universe":"shadows-and-dust", "final":"the-distant-sun"]
    private var player: AVAudioPlayer?
    private var outgoing: AVAudioPlayer?
    private var track = ""
    private var desired = "menu"
    private var wanted = false
    private var foreground = false
    private var interrupted = false
    private var sessionActive = false
    private var volume: Float = 0
    private var revision = -1
    private var generation = 0
    private var transitionEnd: TimeInterval = 0
    private var timer: Timer?
    private var lastReport: TimeInterval = 0
    private var failure: String?
    public override func load() {
        #if targetEnvironment(simulator)
        if ProcessInfo.processInfo.arguments.contains("--voro-native-audio-smoke") {
            DispatchQueue.main.asyncAfter(deadline: .now() + 6) { [weak self] in
                guard let url = Bundle.main.url(forResource: "native-music-probe", withExtension: "js", subdirectory: "public"),
                      let script = try? String(contentsOf: url, encoding: .utf8) else { return }
                self?.saveProbe("injection", extra: ["url": self?.bridge?.webView?.url?.absoluteString ?? "missing"])
                self?.bridge?.webView?.evaluateJavaScript(script + ";null") { _, error in
                    if let error = error { self?.saveProbe("error", extra: ["injectionError": error.localizedDescription]) }
                }
            }
        }
        #endif
        foreground = UIApplication.shared.applicationState == .active
        let center = NotificationCenter.default
        for name in [UIApplication.willResignActiveNotification, UIApplication.didBecomeActiveNotification,
            AVAudioSession.interruptionNotification, AVAudioSession.routeChangeNotification,
            AVAudioSession.mediaServicesWereLostNotification, AVAudioSession.mediaServicesWereResetNotification] {
            center.addObserver(self, selector: #selector(observe(_:)), name: name, object: nil)
        }
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in self?.tick() }
    }
    deinit { timer?.invalidate(); NotificationCenter.default.removeObserver(self) }
    private func activate() throws {
        if sessionActive { return }
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try session.setActive(true)
        sessionActive = true
    }
    private func cancelTransition() {
        generation += 1; outgoing?.pause(); outgoing = nil; transitionEnd = 0
    }
    private func pauseNow() {
        cancelTransition(); player?.pause()
    }
    private func start(loop: Bool = false) throws {
        guard foreground && !interrupted && wanted else { return }
        try activate()
        if player == nil || track != desired || loop {
            let slug = tracks[desired]!
            guard let url = Bundle.main.url(forResource: slug, withExtension: "mp3", subdirectory: "public/music") else {
                throw NSError(domain: "VoroMusic", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing bundled track: \(slug)"])
            }
            let next = try AVAudioPlayer(contentsOf: url)
            next.prepareToPlay()
            cancelTransition()
            let previous = player
            outgoing = previous
            next.volume = previous?.isPlaying == true ? 0 : volume
            guard next.play() else { throw NSError(domain: "VoroMusic", code: 2) }
            player = next; track = desired
            if previous?.isPlaying == true {
                next.setVolume(volume, fadeDuration: 4)
                previous?.setVolume(0, fadeDuration: 4)
                transitionEnd = Date.timeIntervalSinceReferenceDate + 4
            } else { outgoing = nil }
        } else if player?.isPlaying == false {
            player?.volume = volume
            guard player?.play() == true else { throw NSError(domain: "VoroMusic", code: 3) }
        }
        failure = nil
    }
    @objc func setState(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let incoming = call.getInt("revision") ?? -1
            guard incoming > self.revision, let id = call.getString("track"), self.tracks[id] != nil else {
                call.resolve(self.state()); return
            }
            self.revision = incoming; self.desired = id
            self.wanted = call.getBool("active") ?? false
            let oldVolume = self.volume
            self.volume = Float(max(0, min(1, call.getDouble("volume") ?? 0)))
            let fade = max(0, min(3, call.getDouble("fade") ?? 0.08))
            do {
                if self.wanted && self.foreground && !self.interrupted {
                    try self.start()
                    if oldVolume != self.volume { self.player?.setVolume(self.volume, fadeDuration: fade) }
                } else if call.getBool("immediate") == true || !self.foreground || self.interrupted {
                    self.pauseNow()
                } else {
                    self.cancelTransition()
                    self.player?.setVolume(0, fadeDuration: fade)
                    let token = self.generation
                    DispatchQueue.main.asyncAfter(deadline: .now() + fade) { [weak self] in
                        guard let self = self, token == self.generation, !self.wanted else { return }
                        self.player?.pause(); self.publish()
                    }
                }
            } catch { self.failure = error.localizedDescription; self.pauseNow() }
            self.publish(); call.resolve(self.state())
        }
    }
    @objc func snapshot(_ call: CAPPluginCall) { DispatchQueue.main.async {
        #if targetEnvironment(simulator)
        if let probe = call.getString("probe"), ["menu", "micro", "muted", "resumed", "foreground", "error"].contains(probe) {
            self.saveProbe(probe, extra: ["probeError": call.getString("error") ?? ""])
        }
        #endif
        call.resolve(self.state())
    } }
    private func state() -> [String: Any] {
        ["backend":"AVAudioPlayer", "revision":revision, "track":track, "desired":desired,
         "playing":player?.isPlaying ?? false, "time":player?.currentTime ?? 0,
         "duration":player?.duration ?? 0, "volume":player?.volume ?? 0,
         "foreground":foreground, "interrupted":interrupted, "transition":outgoing != nil,
         "error":failure as Any? ?? NSNull()]
    }
    private func publish() {
        notifyListeners("musicState", data: state())
        #if targetEnvironment(simulator)
        saveProbe("state")
        if ProcessInfo.processInfo.arguments.contains("--voro-native-audio-smoke") {
            bridge?.webView?.evaluateJavaScript("JSON.stringify({phase:window.__voroSmoke,ready:document.readyState,cap:typeof window.Capacitor,nativePromise:typeof window.Capacitor?.nativePromise,plugins:Object.keys(window.Capacitor?.Plugins||{}),headers:window.Capacitor?.PluginHeaders,hidden:document.hidden})") { [weak self] result, error in
                self?.saveProbe("javascript", extra: ["javascript": result as? String ?? "nil", "evaluationError": error?.localizedDescription ?? ""])
            }
        }
        #endif
    }
    #if targetEnvironment(simulator)
    private func saveProbe(_ name: String, extra: [String: Any] = [:]) {
        guard ProcessInfo.processInfo.arguments.contains("--voro-native-audio-smoke") else { return }
        var report = state(); report.merge(extra) { _, new in new }
        if let data = try? JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted]),
           let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            try? FileManager.default.createDirectory(at: documents, withIntermediateDirectories: true)
            try? data.write(to: documents.appendingPathComponent("music-\(name).json"), options: .atomic)
        }
    }
    #endif
    private func tick() {
        guard foreground else { return }
        let now = Date.timeIntervalSinceReferenceDate
        if transitionEnd > 0 && now >= transitionEnd { cancelTransition() }
        if wanted && !interrupted && outgoing == nil, let player = player,
           player.duration > 8 && player.currentTime >= player.duration - 4.5 {
            do { try start(loop: true) } catch { failure = error.localizedDescription; pauseNow() }
        }
        if now - lastReport >= 2 { lastReport = now; publish() }
    }
    @objc private func observe(_ notification: Notification) {
        let apply = { [weak self] in
            guard let self = self else { return }
            switch notification.name {
            case UIApplication.willResignActiveNotification:
                self.foreground = false; self.wanted = false; self.pauseNow()
                try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])
                self.sessionActive = false
            case UIApplication.didBecomeActiveNotification:
                self.foreground = true // The game supplies its current pause/mute state before resuming.
            case AVAudioSession.interruptionNotification:
                let type = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt
                self.interrupted = type == AVAudioSession.InterruptionType.began.rawValue
                self.sessionActive = false
                if self.interrupted { self.pauseNow() }
                else if let options = notification.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt,
                        AVAudioSession.InterruptionOptions(rawValue: options).contains(.shouldResume) {
                    do { try self.start() } catch { self.failure = error.localizedDescription }
                } else { self.wanted = false }
            case AVAudioSession.mediaServicesWereLostNotification:
                self.interrupted = true; self.sessionActive = false; self.pauseNow()
            case AVAudioSession.mediaServicesWereResetNotification:
                self.pauseNow(); self.player = nil; self.interrupted = false; self.sessionActive = false
                do { try self.start() } catch { self.failure = error.localizedDescription }
            default: self.sessionActive = false
            }
            self.publish()
        }
        if Thread.isMainThread { apply() } else { DispatchQueue.main.async(execute: apply) }
    }
}
