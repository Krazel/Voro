import XCTest
import UIKit
final class StoreCapture: XCTestCase {
 func capture(_ name:String){let a=XCTAttachment(screenshot:XCUIScreen.main.screenshot());a.name=name;a.lifetime = .keepAlways;add(a)}
 func testDarkFinaleBackgroundAndRelaunch(){
  continueAfterFailure=false
  let app=XCUIApplication(bundleIdentifier:"com.dmkr.voro")
  app.launchArguments=["-AppleLanguages","(es)","-AppleLocale","es_ES"];app.launch()
  let status=app.staticTexts.matching(NSPredicate(format:"label BEGINSWITH %@","Finale checkpoint")).firstMatch
  XCTAssertTrue(status.waitForExistence(timeout:120));XCTAssertTrue(status.label.contains("started paused false"),app.debugDescription)
  capture("01-dark-before-background")
  XCUIDevice.shared.press(.home);sleep(2);app.activate()
  XCTAssertTrue(status.waitForExistence(timeout:20));sleep(1)
  XCTAssertTrue(status.label.contains("started paused false"),status.label);capture("02-resumed-dark")
  app.terminate();app.launch()
  XCTAssertTrue(status.waitForExistence(timeout:30));XCTAssertTrue(status.label.contains("intro paused false"),status.label)
  let continueGame=app.buttons["Continuar partida"].firstMatch
  XCTAssertTrue(continueGame.waitForExistence(timeout:30));continueGame.tap()
  if !status.label.contains("started") && continueGame.isHittable {continueGame.tap()}
  sleep(1);XCTAssertTrue(status.label.contains("started paused false"),status.label);capture("03-restored-sequence")
  // Let WKWebView animate without repeated full accessibility-tree snapshots.
  // A restored sequence has at most17s here; then assert real completion.
  sleep(30);XCTAssertTrue(status.label.contains("started paused false remaining 0"),status.label)
  capture("04-survivor-after-relaunch")
  XCTAssertFalse(app.staticTexts["Tu recorrido"].exists,"Journey must not open automatically")
  app.terminate();app.launch();XCTAssertTrue(status.waitForExistence(timeout:30));XCTAssertTrue(status.label.contains("remaining 0"),status.label)
  capture("05-completion-persisted")
 }
}
