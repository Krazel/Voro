import XCTest
import UIKit
final class StoreCapture: XCTestCase {
 func capture(_ name: String) {
  let a=XCTAttachment(screenshot:XCUIScreen.main.screenshot())
  a.name=name; a.lifetime = .keepAlways; add(a)
 }
 func check(_ language: String) {
  continueAfterFailure=false
  let app=XCUIApplication(bundleIdentifier:"com.dmkr.voro")
  app.launchArguments=["-AppleLanguages","(\(language))","-AppleLocale",language == "es" ? "es_ES" : "en_US"]
  app.launch()
  let entry=app.buttons.matching(NSPredicate(format:"label CONTAINS %@", "VORO")).firstMatch
  XCTAssertTrue(entry.waitForExistence(timeout:120),app.debugDescription)
  let title=language == "es" ? "Tu recorrido" : "Your journey"
  XCTAssertFalse(app.staticTexts[title].exists, "Journey must open manually")
  entry.tap()
  XCTAssertTrue(app.staticTexts[title].waitForExistence(timeout:30),app.debugDescription)
  let heading=app.staticTexts[title].frame, screen=app.frame.size
  XCTAssertGreaterThanOrEqual(heading.minX,0,"Journey title must be on screen")
  XCTAssertGreaterThanOrEqual(heading.minY,0,"Journey must open at its top")
  XCTAssertLessThanOrEqual(heading.maxX,screen.width)
  capture("01-d3-portrait-\(language)")
  let rebirth=app.buttons[language == "es" ? "Volver a nacer" : "Be born again"]
  for _ in 0..<4 { if rebirth.isHittable { break }; app.swipeUp() }
  XCTAssertTrue(rebirth.isHittable,app.debugDescription)
  capture("02-d3-footer-\(language)")
  rebirth.tap()
  let cancel=app.buttons[language == "es" ? "Cancelar" : "Cancel"]
  XCTAssertTrue(cancel.waitForExistence(timeout:10)); cancel.tap()
  let silence=app.buttons[language == "es" ? "Volver al silencio" : "Return to silence"]
  for _ in 0..<3 { if silence.isHittable { break }; app.swipeUp() }
  silence.tap(); XCTAssertTrue(entry.waitForExistence(timeout:10)); entry.tap()
  XCUIDevice.shared.orientation = .landscapeLeft
  sleep(2)
  if UIDevice.current.userInterfaceIdiom == .pad {
   let universe=app.staticTexts[language == "es" ? "Universo" : "Universe"].firstMatch
   XCTAssertTrue(universe.isHittable,"The final band must be visible in landscape")
   XCTAssertLessThanOrEqual(universe.frame.maxY,app.frame.maxY,"All ten bands must fit in landscape")
  }
  capture("03-d3-landscape-\(language)")
  XCUIDevice.shared.orientation = .portrait
  app.terminate()
 }
 func testSpanishJourney() { check("es") }
 func testEnglishJourney() { check("en") }
}
