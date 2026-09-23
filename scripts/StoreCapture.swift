import XCTest
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
  app.launchArguments = ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
  app.launch()
  let wake = app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", "Awaken")).firstMatch
  XCTAssertTrue(wake.waitForExistence(timeout: 60), app.debugDescription)
  let ready = XCTNSPredicateExpectation(predicate:NSPredicate(format:"isEnabled == true"),object:wake)
  XCTAssertEqual(XCTWaiter.wait(for:[ready],timeout:60), .completed)
  sleep(2)
  capture("01-origin")
  wake.tap()
  let pause = app.buttons["Pause"]
  XCTAssertTrue(pause.waitForExistence(timeout:60))
  let gameplay = XCTNSPredicateExpectation(predicate:NSPredicate(format:"isHittable == true"),object:pause)
  XCTAssertEqual(XCTWaiter.wait(for:[gameplay],timeout:120), .completed)
  sleep(3)
  capture("02-microscopic-life")
  let from = app.coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.6))
  let to = app.coordinate(withNormalizedOffset:CGVector(dx:0.8,dy:0.4))
  from.press(forDuration:0.1,thenDragTo:to,withVelocity:.slow,thenHoldForDuration:1)
  sleep(2)
  capture("03-absorb-and-grow")
  pause.tap()
  sleep(2)
  capture("05-pause")
  let resume = app.buttons["Continue"]
  if resume.exists { resume.tap() }
  let settings = app.buttons["Settings"]
  XCTAssertTrue(settings.waitForExistence(timeout:10))
  settings.tap()
  sleep(2)
  capture("04-settings")
 }
}
