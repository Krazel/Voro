import XCTest
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
  let menu=app.buttons["BACK TO MENU"]
  XCTAssertTrue(menu.waitForExistence(timeout:120),app.debugDescription)
  capture("01-new-native-pause")
  app.buttons["Check ingest audio"].tap()
  XCTAssertTrue(app.buttons["ingest-audio-5-5"].waitForExistence(timeout:60),app.debugDescription)
  capture("02-five-native-audio-samples")
  app.buttons["SETTINGS"].tap()
  let back=app.buttons.matching(NSPredicate(format:"label ==[c] %@","Back to game")).firstMatch
  XCTAssertTrue(back.waitForExistence(timeout:30),app.debugDescription)
  capture("03-current-native-settings")
  back.tap()
  XCTAssertTrue(menu.waitForExistence(timeout:30),app.debugDescription)
  app.buttons["CONTINUE"].tap()
  let pause=app.buttons["Pause"].firstMatch
  XCTAssertTrue(pause.waitForExistence(timeout:30),app.debugDescription)
  pause.tap()
  XCTAssertTrue(menu.waitForExistence(timeout:30)); menu.tap()
  XCTAssertEqual(XCTWaiter.wait(for:[XCTNSPredicateExpectation(predicate:NSPredicate(format:"exists == false"),object:menu)],timeout:30),.completed)
  capture("04-returned-to-main-menu")
 }
}
