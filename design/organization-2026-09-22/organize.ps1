$ErrorActionPreference = 'Stop'
$root = 'C:\Users\dmkra\Documents\Codex Apps'
$hub = Join-Path $root 'Juegos\Voro'
$evidence = Join-Path $root 'Voro-camera\design\organization-2026-09-22'
function Inside([string]$path) {
    $full = [IO.Path]::GetFullPath($path)
    if (!$full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Outside workspace: $full" }
    return $full
}
$mapping = [ordered]@{
    'Voro_Music' = 'Recursos\Musica-original'
    'Voro-background-assets' = 'Recursos\Fondos'
    'Voro-campaign-assets' = 'Recursos\Campana'
    'Voro-coast-assets' = 'Recursos\Costa'
    'Voro-cristal-assets' = 'Recursos\Marco-cristal'
    'Voro-earth-art' = 'Recursos\Tierra'
    'Voro-female-swimmer-assets' = 'Recursos\Nadadora'
    'Voro-inhabitants-assets' = 'Recursos\Habitantes'
    'Voro-matter-assets' = 'Recursos\Materia'
    'Voro-swimmer-v2-assets' = 'Recursos\Nadador'
    'Voro-upgrade-assets' = 'Recursos\Mejoras'
    'Voro-animation-review' = 'Pruebas\Animaciones'
    'Voro-fish-preview' = 'Pruebas\Sardina'
    'Voro-asset-delivery' = 'Archivo\Paquetes-web-antiguos'
    'Voro-diseno-validacion' = 'Archivo\Disenos-iniciales'
    'Voro-membrana-variants' = 'Archivo\Variantes-membrana'
    'Voro-ui-image-assets' = 'Archivo\Conceptos-interfaz'
}
if (Test-Path -LiteralPath $hub) { throw 'Hub already exists; inspect journal before rerunning.' }
foreach ($name in $mapping.Keys) {
    $source = Inside (Join-Path $root $name)
    $item = Get-Item -LiteralPath $source -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Source already linked: $source" }
    if (Test-Path -LiteralPath (Join-Path $source '.git')) { throw "Git source must not move: $source" }
    $links = @(Get-ChildItem -LiteralPath $source -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint })
    if ($links.Count) { throw "Unexpected link inside $source" }
    $destination = Inside (Join-Path $hub $mapping[$name])
    if (Test-Path -LiteralPath $destination) { throw "Destination occupied: $destination" }
}
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
$repos = @('Voro','Voro-camera','Voro-pc-demo')
$before = @{}
foreach ($repo in $repos) {
    $path = Join-Path $root $repo
    $head = & git -c "safe.directory=$path" -C $path rev-parse HEAD
    if ($LASTEXITCODE -ne 0) { throw "Git head failed: $repo" }
    $status = @(& git -c "safe.directory=$path" -C $path status --porcelain -uno)
    if ($LASTEXITCODE -ne 0) { throw "Git status failed: $repo" }
    $before[$repo] = @{head=[string]$head; trackedStatus=$status}
}
function Inventory([string]$path) {
    return @(Get-ChildItem -LiteralPath $path -Recurse -File -Force | Sort-Object FullName | ForEach-Object {
        [ordered]@{file=$_.FullName.Substring($path.Length + 1);bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}
    })
}
$journal = [ordered]@{date=(Get-Date).ToString('o');root=$root;hub=$hub;completed=$false;gitBefore=$before;moved=@();links=@()}
$journalPath = Join-Path $evidence 'manifest.json'
function SaveJournal { $journal | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $journalPath -Encoding utf8 }
SaveJournal
foreach ($name in $mapping.Keys) {
    $source = Inside (Join-Path $root $name)
    $destination = Inside (Join-Path $hub $mapping[$name])
    $files = Inventory $source
    $entry = [ordered]@{source=$source;destination=$destination;state='inventoried';files=$files}
    $journal.moved += $entry
    SaveJournal
    New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
    Move-Item -LiteralPath $source -Destination $destination
    try { New-Item -ItemType Junction -Path $source -Target $destination | Out-Null }
    catch { Move-Item -LiteralPath $destination -Destination $source; throw }
    $entry.state = 'moved-linked'
    SaveJournal
    $after = Inventory $destination
    if (($files | ConvertTo-Json -Depth 6 -Compress) -cne ($after | ConvertTo-Json -Depth 6 -Compress)) { throw "Hash mismatch: $name" }
    # Keep historical absolute paths working without cluttering normal Explorer view.
    $link = Get-Item -LiteralPath $source -Force
    $link.Attributes = $link.Attributes -bor [IO.FileAttributes]::Hidden
    $entry.state = 'verified'
    SaveJournal
}
$links = [ordered]@{
    'Codigo' = 'Voro-camera'
    'Entregas\PC\0.6.2' = 'Voro-pc-demo\artifact\itchio\0.6.2-pc'
    'Entregas\iOS\0.6.2' = 'Voro-camera\artifact\testflight-0.6.2-build-1'
    'Pruebas\PC' = 'Voro-pc-demo'
    'Pruebas\Evidencias' = 'Voro-camera\design'
    'Pruebas\Temporales' = 'Voro-camera\work'
    'Archivo\Repositorio-original' = 'Voro'
    'Archivo\Compilaciones-anteriores' = 'Voro-camera\artifact'
}
foreach ($relative in $links.Keys) {
    $path = Inside (Join-Path $hub $relative)
    $target = Inside (Join-Path $root $links[$relative])
    if (!(Test-Path -LiteralPath $target)) { throw "Missing target $target" }
    New-Item -ItemType Directory -Path (Split-Path $path -Parent) -Force | Out-Null
    New-Item -ItemType Junction -Path $path -Target $target | Out-Null
    $journal.links += @{path=$path;target=$target}
}
foreach ($repo in $repos) {
    $path = Join-Path $root $repo
    $head = & git -c "safe.directory=$path" -C $path rev-parse HEAD
    $status = @(& git -c "safe.directory=$path" -C $path status --porcelain -uno)
    if ($LASTEXITCODE -ne 0 -or [string]$head -ne $before[$repo].head -or ($status -join "`n") -cne ($before[$repo].trackedStatus -join "`n")) { throw "Git changed: $repo" }
}
$journal.gitVerified = $true
$journal.completed = $true
SaveJournal
$fileCount = ($journal.moved | ForEach-Object { $_.files.Count } | Measure-Object -Sum).Sum
[pscustomobject]@{hub=$hub;foldersMoved=$journal.moved.Count;filesVerified=$fileCount;links=$journal.links.Count;gitVerified=$true} | ConvertTo-Json
