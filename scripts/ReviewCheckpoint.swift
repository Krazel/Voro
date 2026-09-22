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
  // Simulator interruption handling can swallow the first synthesized tap.
  // Retry only while the same native alert remains visible, then require dismissal.
  let dismissed=NSPredicate(format:"exists == false")
  if XCTWaiter.wait(for:[XCTNSPredicateExpectation(predicate:dismissed,object:prompt)],timeout:5) != .completed {
    prompt.buttons["Continue"].coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.5)).tap()
  }
  XCTAssertEqual(XCTWaiter.wait(for:[XCTNSPredicateExpectation(predicate:dismissed,object:prompt)],timeout:10),.completed)
  XCTAssertTrue(app.staticTexts["review-stage-2"].waitForExistence(timeout:30), app.debugDescription)
  capture("02-third-environment-after-continue")
  XCTAssertTrue(app.staticTexts["native-play-ready"].waitForExistence(timeout:120),app.debugDescription)
  let audio=app.buttons["Check ingest audio"]
  XCTAssertTrue(audio.waitForExistence(timeout:10)); audio.tap()
  XCTAssertTrue(app.buttons["ingest-audio-5-5"].waitForExistence(timeout:20),app.debugDescription)
  // Exercise the actual player pause and settings in the installed WKWebView.
  let pause=app.buttons["Pause"].firstMatch
  XCTAssertTrue(pause.waitForExistence(timeout:15)); pause.tap()
  XCTAssertTrue(app.buttons["BACK TO MENU"].waitForExistence(timeout:30),app.debugDescription)
  capture("04-new-pause")
  app.buttons["SETTINGS"].tap()
  XCTAssertTrue(app.buttons["Back to game"].firstMatch.waitForExistence(timeout:10))
  capture("05-current-settings")
  app.buttons["Back to game"].firstMatch.tap()
  XCTAssertTrue(app.buttons["BACK TO MENU"].waitForExistence(timeout:30))
  app.buttons["CONTINUE"].tap()
  XCTAssertTrue(pause.waitForExistence(timeout:10)); pause.tap()
  app.buttons["BACK TO MENU"].tap()
  XCTAssertFalse(app.buttons["BACK TO MENU"].exists)
  // Beta must be repeatable, and must ignore the consumed legacy attempt key.
  app.terminate(); app.launch()
  XCTAssertTrue(app.alerts["Rating test · TestFlight"].waitForExistence(timeout:120), app.debugDescription)
  capture("03-beta-repeat")
 }
}
