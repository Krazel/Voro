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
  // Beta must be repeatable, and must ignore the consumed legacy attempt key.
  app.terminate(); app.launch()
  XCTAssertTrue(app.alerts["Rating test · TestFlight"].waitForExistence(timeout:120), app.debugDescription)
  capture("03-beta-repeat")
 }
}
