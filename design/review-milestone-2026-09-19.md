# Valoración nativa: tercer entorno

Plugin local VoroReview registrado en VoroBridgeViewController desde SceneDelegate.
AppStore.requestReview(in:) desde iOS 16; SKStoreReviewController en iOS 15.
Hito e intento persisten en UserDefaults, separados de la partida y del renacer.
Se admite partida antigua en entorno >= 3; el modo pruebas no marca el hito.
El frontend espera ocho segundos sin menús, adaptaciones, transición, mensajes,
daño o pausa y con assets listos. iOS exige escena activa y ningún controlador
presentado. No se consulta satisfacción ni se observa si el usuario valoró.
Apple decide si presenta la solicitud; TestFlight no permite comprobar su aparición.

Verificado: tests/review-policy.test.mjs (2 tests), TypeScript sin errores.
Pendiente: compilación Xcode y prueba física del puente. Windows no acredita
una compilación nativa. No se subió build ni se publicó por este encargo.

Documentación consultada:
- https://developer.apple.com/documentation/storekit/appstore/requestreview(in:)-1q8qs/
- https://developer.apple.com/documentation/storekit/requesting-app-store-reviews
- https://capacitorjs.com/docs/ios/custom-code

Manifest de privacidad: UserDefaults CA92.1, preferencias propias de esta app.
