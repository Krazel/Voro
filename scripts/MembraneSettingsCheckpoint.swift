import XCTest
import UIKit
final class StoreCapture: XCTestCase {
 func capture(_ name:String) {
  let a=XCTAttachment(screenshot:XCUIScreen.main.screenshot());a.name=name;a.lifetime = .keepAlways;add(a)
 }
 func check(_ language:String) {
  continueAfterFailure=false
  let es=language == "es",app=XCUIApplication(bundleIdentifier:"com.dmkr.voro")
  app.launchArguments=["-AppleLanguages","(\(language))","-AppleLocale",es ? "es_ES" : "en_US"]
  app.launch()
  let wake=app.buttons[es ? "Despertar" : "Awaken"]
  if wake.waitForExistence(timeout:25) { wake.tap() }
  let settings=app.buttons[es ? "Configuración" : "Settings"].firstMatch
  XCTAssertTrue(settings.waitForExistence(timeout:90),app.debugDescription);settings.tap()
  let heading=app.staticTexts[es ? "Configuración" : "Settings"].firstMatch
  XCTAssertTrue(heading.waitForExistence(timeout:20));sleep(2)
  XCTAssertGreaterThanOrEqual(heading.frame.minX,0);XCTAssertLessThanOrEqual(heading.frame.maxX,app.frame.maxX)
  capture("01-membrane-portrait-\(language)")
  let left=app.buttons[es ? "Modo zurdo" : "Left-handed mode"]
  XCTAssertTrue(left.isHittable);left.tap();left.tap()
  let sound=app.buttons[es ? "Sonido" : "Sound"]
  XCTAssertTrue(sound.isHittable);sound.tap();sound.tap()
  let journey=app.buttons[es ? "Recorrido" : "Journey"].firstMatch
  for _ in 0..<3 { if journey.isHittable {break};app.swipeUp() }
  XCTAssertTrue(journey.isHittable);journey.tap()
  let back=app.buttons[es ? "Volver a configuración" : "Back to settings"].firstMatch
  XCTAssertTrue(back.waitForExistence(timeout:10));back.tap()
  let credits=app.buttons[es ? "Créditos" : "Credits"].firstMatch
  for _ in 0..<3 { if credits.isHittable {break};app.swipeUp() }
  XCTAssertTrue(credits.isHittable);credits.tap();XCTAssertTrue(back.waitForExistence(timeout:10));back.tap()
  let rebirth=app.buttons[es ? "Volver a nacer" : "Be born again"].firstMatch
  for _ in 0..<4 {if rebirth.isHittable {break};app.swipeUp()}
  XCTAssertTrue(rebirth.isHittable);rebirth.tap()
  let cancel=app.buttons[es ? "Cancelar" : "Cancel"]
  XCTAssertTrue(cancel.waitForExistence(timeout:10));capture("02-reset-confirmation-\(language)");cancel.tap()
  if UIDevice.current.userInterfaceIdiom == .pad {
   XCUIDevice.shared.orientation = .landscapeLeft;sleep(3)
   XCTAssertTrue(left.isHittable);XCTAssertTrue(sound.isHittable)
   capture("03-membrane-landscape-\(language)")
   XCUIDevice.shared.orientation = .portrait;sleep(2)
  }
  let resume=app.buttons[es ? "Volver al juego" : "Back to game"].firstMatch
  for _ in 0..<4 {if resume.isHittable {break};app.swipeUp()}
  XCTAssertTrue(resume.isHittable);capture("04-membrane-footer-\(language)");resume.tap()
  XCTAssertTrue(settings.waitForExistence(timeout:10));app.terminate()
 }
 func testSpanishSettings(){check("es")}
 func testEnglishSettings(){check("en")}
}
