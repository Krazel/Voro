import XCTest
final class StoreCapture: XCTestCase {
 func capture(_ name: String) {
  let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
  attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
 }
 func testReviewCheckpoint() {
  continueAfterFailure = false
  let app = XCUIApplication(bundleIdentifier: "com.dmkr.voro")
  app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US", "-voro.review.thirdEnvironment.attempted", "YES"]
  app.launch()
  let prompt=app.alerts["Rating test · TestFlight"]
  XCTAssertTrue(prompt.waitForExistence(timeout:120), app.debugDescription)
  capture("01-native-review-paused")
  sleep(3)
  XCTAssertTrue(prompt.exists)
  prompt.buttons["Continue"].tap()
  XCTAssertTrue(app.staticTexts["review-stage-2"].waitForExistence(timeout:30), app.debugDescription)
  capture("02-third-environment-after-continue")
  let audio=app.buttons["Check ingest audio"]
  XCTAssertTrue(audio.waitForExistence(timeout:10)); audio.tap()
  XCTAssertTrue(app.buttons["ingest-audio-5-5"].waitForExistence(timeout:20),app.debugDescription)
  // Exercise the actual player pause and settings in the installed WKWebView.
  let pause=app.buttons["Pause"].firstMatch
  XCTAssertTrue(pause.waitForExistence(timeout:15)); pause.tap()
  XCTAssertTrue(app.buttons["Back to menu"].waitForExistence(timeout:15),app.debugDescription)
  capture("04-new-pause")
  app.buttons["Settings"].firstMatch.tap()
  XCTAssertTrue(app.buttons["Back to game"].firstMatch.waitForExistence(timeout:10))
  capture("05-current-settings")
  app.buttons["Back to game"].firstMatch.tap()
  XCTAssertTrue(app.buttons["Back to menu"].waitForExistence(timeout:10))
  app.buttons["Continue"].firstMatch.tap()
  XCTAssertTrue(pause.waitForExistence(timeout:10)); pause.tap()
  app.buttons["Back to menu"].tap()
  XCTAssertFalse(app.buttons["Back to menu"].exists)
  // Beta must be repeatable, and must ignore the consumed legacy attempt key.
  app.terminate(); app.launch()
  XCTAssertTrue(app.alerts["Rating test · TestFlight"].waitForExistence(timeout:120), app.debugDescription)
  capture("03-beta-repeat")
 }
}
