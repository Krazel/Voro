import XCTest
import UIKit
final class StoreCapture: XCTestCase {
 func capture(_ name: String) {
  let a=XCTAttachment(screenshot:XCUIScreen.main.screenshot())
  a.name=name; a.lifetime = .keepAlways; add(a)
 }
 func testPauseAndIngest() {
  continueAfterFailure=false
  let app=XCUIApplication(bundleIdentifier:"com.dmkr.voro")
  app.launchArguments=["-AppleLanguages","(en)","-AppleLocale","en_US"]
  app.launch()
  let resume=app.buttons.matching(NSPredicate(format:"label ==[c] %@","Continue")).firstMatch
  XCTAssertTrue(resume.waitForExistence(timeout:120),app.debugDescription)
  sleep(3)
  app.buttons["Check membrane frames"].tap()
  XCTAssertTrue(app.buttons["membrane-frames-ready-3"].waitForExistence(timeout:30),app.debugDescription)
  capture("01-new-native-pause")
  if UIDevice.current.userInterfaceIdiom == .pad {
   XCUIDevice.shared.orientation = .landscapeLeft
   sleep(2);capture("01b-ipad-landscape-pause")
   XCUIDevice.shared.orientation = .portrait
  }
  app.buttons["Check ingest audio"].tap()
  XCTAssertTrue(app.buttons["ingest-audio-5-5"].waitForExistence(timeout:60),app.debugDescription)
  capture("02-five-native-audio-samples")
  app.buttons.matching(NSPredicate(format:"label ==[c] %@","Settings")).firstMatch.tap()
  let back=app.buttons.matching(NSPredicate(format:"label ==[c] %@","Back to game")).firstMatch
  XCTAssertTrue(back.waitForExistence(timeout:30),app.debugDescription)
  capture("03-current-native-settings")
  back.tap()
  XCTAssertTrue(resume.waitForExistence(timeout:30),app.debugDescription)
  resume.tap()
  let pause=app.buttons["Pause"].firstMatch
  XCTAssertTrue(pause.waitForExistence(timeout:30),app.debugDescription)
  capture("04-notice-during-play")
  pause.tap()
  XCTAssertTrue(resume.waitForExistence(timeout:30));capture("05-paused-again")
 }
}
