import XCTest
import UIKit
final class StoreCapture: XCTestCase {
 func capture(_ name: String) {
  let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
  attachment.name = name
  attachment.lifetime = .keepAlways
  add(attachment)
 }
 func testStoreScreens() {
  continueAfterFailure = false
  let app = XCUIApplication(bundleIdentifier: "com.dmkr.voro")
  if UIDevice.current.userInterfaceIdiom == .pad { XCUIDevice.shared.orientation = .landscapeLeft }
  for language in ["en", "es"] {
   for stage in ["origin", "micro", "sea", "city", "planets"] {
    app.launchArguments = ["-AppleLanguages", "(\(language))", "-AppleLocale", language == "en" ? "en_US" : "es_ES"]
    app.launchEnvironment["VORO_CAPTURE_STAGE"] = stage
    app.launch()
    let text = language == "en" ? "Awaken|Continue game" : "Despertar|Continuar partida"
    let wake = app.buttons.matching(NSPredicate(format: "label MATCHES[c] %@", ".*(\(text)).*")).firstMatch
    XCTAssertTrue(wake.waitForExistence(timeout: 90), app.debugDescription)
    let ready = XCTNSPredicateExpectation(predicate:NSPredicate(format:"isEnabled == true"),object:wake)
    XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:90), .completed)
    if stage != "origin" {
     wake.tap()
     let pause = app.buttons[language == "en" ? "Pause" : "Pausar"]
     XCTAssertTrue(pause.waitForExistence(timeout:90),app.debugDescription)
     let gameplay = XCTNSPredicateExpectation(predicate:NSPredicate(format:"isHittable == true"),object:pause)
     XCTAssertEqual(XCTWaiter.wait(for:[gameplay],timeout:120), .completed)
     sleep(9)
    } else { sleep(3) }
    capture("\(language)-\(stage)")
    app.terminate()
   }
  }
 }
}
