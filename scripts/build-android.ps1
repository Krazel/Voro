param([switch]$SkipWebBuild)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$studioRoot = Split-Path $projectRoot -Parent
Set-Location -LiteralPath $projectRoot
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = Join-Path $studioRoot 'tools/android-studio/jbr' }
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $studioRoot 'tools/android-sdk' }
if (-not $env:VORO_ANDROID_KEYSTORE) { $env:VORO_ANDROID_KEYSTORE = Join-Path $studioRoot '.studio/signing/voro-android/release.p12' }
if (-not $env:VORO_ANDROID_PASSWORD_FILE) { $env:VORO_ANDROID_PASSWORD_FILE = Join-Path $studioRoot '.studio/signing/voro-android/release.password' }
foreach ($path in @($env:VORO_ANDROID_KEYSTORE,$env:VORO_ANDROID_PASSWORD_FILE)) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Missing authorized Android signing resource: $path" }
}
$gameVersion = [regex]::Match((Get-Content app/release.mjs -Raw), "version: '([^']+)'").Groups[1].Value
$androidVersion = [regex]::Match((Get-Content android/app/build.gradle -Raw), 'versionName "([^"]+)"').Groups[1].Value
if ($gameVersion -ne $androidVersion) { throw 'Android version must match the current game release.' }
Set-Content -LiteralPath android/local.properties -Value ('sdk.dir=' + $env:ANDROID_HOME.Replace('\','/'))
if (-not $SkipWebBuild) { & npm.cmd run build:mobile; if ($LASTEXITCODE -ne 0) { throw 'Mobile build failed' } }
& node.exe scripts/verify-mobile-assets.mjs
if ($LASTEXITCODE -ne 0) { throw 'Web assets failed verification' }
& npx.cmd cap sync android
if ($LASTEXITCODE -ne 0) { throw 'Android sync failed' }
& ./android/gradlew.bat -p android assembleRelease assembleReleaseAndroidTest --console=plain
if ($LASTEXITCODE -ne 0) { throw 'Android build failed' }
& (Join-Path $env:ANDROID_HOME 'build-tools/36.0.0/apksigner.bat') verify --verbose --print-certs android/app/build/outputs/apk/release/app-release.apk
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed' }
Get-FileHash -LiteralPath android/app/build/outputs/apk/release/app-release.apk -Algorithm SHA256
