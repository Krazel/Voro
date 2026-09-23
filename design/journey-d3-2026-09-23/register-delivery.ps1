param([Parameter(Mandatory=$true)][string]$Token,[Parameter(Mandatory=$true)][string]$ApiProof,[Parameter(Mandatory=$true)][string]$Run,[Parameter(Mandatory=$true)][string]$Commit)
$ErrorActionPreference='Stop'
$proof=Get-Content -LiteralPath $ApiProof -Raw | ConvertFrom-Json
if($proof.processingState-ne'VALID' -or $proof.internalBuildState-ne'IN_BETA_TESTING' -or $proof.group.id-ne'05db8744-bcf3-4c2d-a465-2635012bfeeb'){throw 'Entrega interna aún no acreditada'}
$api='https://krazel-studio.krazel.chatgpt.site/api/projects'
$headers=@{'OAI-Sites-Authorization'='Bearer '+$Token}
$before=(Invoke-RestMethod $api -Headers $headers).projects | Where-Object id -eq 'PR-009'
$copy=$before | ConvertTo-Json -Depth 25 | ConvertFrom-Json
$copy.version=$proof.version
$copy.build=[int]$proof.build
$copy.detail="TF interno $($proof.version)($($proof.build)), $Commit, CI${Run}: VALID/IN_BETA_TESTING. Incluye D3 Diez horizontes, Respira, privacidad EN/ES, Película viva, 4 estructuras cósmicas y final29s: fade inmediato tras absorción, núcleo colapsa, vacío5s y aparición12.5s.225 tests/tipos/assets OK; QA web6vistas y nativa documentadas en design/journey-d3-2026-09-23. Falta QA físico. ASC1.0 sigue sin revisión; Windows prueba5 sin nueva entrega."
$parts=$copy.next -split ' Visuales ',2
if($parts.Count-ne2){throw 'Releer next: falta sección Visuales'}
$copy.next="VORO 01a06eb1-17bb-74c1-b4a4-f88225d8e26d: TF interno $($proof.version)($($proof.build)) disponible, CI$Run, $Commit. Probar físicamente iPhone/iPad: D3, audio, cámara y final29s. Sin envío App Store. Visuales "+$parts[1]
$copy.next=$copy.next.Replace('D3 APROBADA, implementar+TF autorizados.',"D3 integrada y disponible en TF$($proof.version)($($proof.build)).")
$copy.next=$copy.next.Replace('QA móvil/PC y vídeo OK; mecánica intacta, sin TF nuevo.',"QA móvil/PC y vídeo OK; mecánica intacta, incluido en TF$($proof.version)($($proof.build)).")
if($copy.detail.Length-gt500 -or $copy.next.Length-gt1000){throw 'Límite de campos excedido'}
$body=@{revision=$before.revision;project=$copy}|ConvertTo-Json -Depth 25
$null=Invoke-RestMethod $api -Method Put -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
$after=(Invoke-RestMethod $api -Headers $headers).projects | Where-Object id -eq 'PR-009'
foreach($name in @('detail','next','version','build')){if($after.$name-cne$copy.$name){throw "Campo no verificado: $name"}}
foreach($name in $before.PSObject.Properties.Name){
 if($name-in@('detail','next','version','build','revision','updatedAt')){continue}
 if(($before.$name|ConvertTo-Json -Depth 25 -Compress)-cne($after.$name|ConvertTo-Json -Depth 25 -Compress)){throw "Campo ajeno alterado: $name"}
}
$receipt=@{id='PR-009';beforeRevision=$before.revision;afterRevision=$after.revision;verified=$true;version=$after.version;build=$after.build;detail=$after.detail;next=$after.next;tracking=$after.tracking}
$receipt|ConvertTo-Json -Depth 8|Set-Content (Join-Path $PSScriptRoot 'library-delivery.json') -Encoding utf8
$receipt|ConvertTo-Json -Depth 8
