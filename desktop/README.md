# VORO Windows

Windows x64 portable, Electron 44.4.3. Uses the same Vite PC build and approved UI as the browser version. No web server or internet required to play. No Steam integration yet; no store publication is performed by these scripts.

## Build

From the repository root:

```powershell
npm ci
npm ci --prefix desktop
npm --prefix desktop test
npm run build:windows
python desktop/archive.py
```

Output: `artifact/windows/0.6.2-preview.1/VORO-win32-x64/VORO.exe` and `VORO-0.6.2-Windows-x64-prueba1.zip`. Extract the complete ZIP; the executable needs the accompanying Electron files. Do not overwrite a previously delivered preview; advance the preview path/version for a subsequent package. The icon is a format conversion of the existing approved iOS app icon.

For automated testing, set `VORO_PLAYWRIGHT_RUNTIME` to the package.json of an installed Playwright runtime and run `node desktop/check-package.mjs`. The test uses its own `VORO_QA_PROFILE` and does not touch the player's save. Native Electron input is used to verify F11; CDP keyboard injection bypasses the main-process handler.

## Behavior

- Starts maximized; F11 / Alt+Enter toggles fullscreen; Escape pauses; Alt+F4 closes.
- Profile and existing localStorage saves live under `%APPDATA%/Krazel Games/VORO`, outside the installation directory. Desktop saves flush on beforeunload.
- Spanish/English and current game controls are preserved. Pointer drag, WASD/arrows and Space are supported by the existing game; gamepad code is preserved but physical-controller QA is pending.
- `voro://game` is a fixed secure local origin. Files are streamed from the packaged ASAR, with constrained path resolution and CSP. Renderer has no Node access; context isolation, sandbox and web security stay enabled.
- Renderer network requests are restricted to local resources. Approved Instagram/music-license links open in the system browser.
- No update server, no telemetry, no remote game loading. This preview is unsigned; Windows may show a publisher warning. Signing and store publication are separate release work.

## Validation

`design/windows-preview-2026-09-22/` contains actual executable screenshots and checks: start, movement/dash, menus, fullscreen, all 206 local game files, WAV decoding/playback and persistence after restart. GPU status is read after graphics initialization; an early query can misleadingly return disabled/software before GPU info arrives. Rendering uses the RTX 3080 Ti with GPU compositing and Canvas acceleration enabled on the tested PC. This is not a minimum-hardware or Steam Deck certification.
