param([Parameter(Mandatory=$true)][string]$Token)
$ErrorActionPreference='Stop'
$api='https://krazel-studio.krazel.chatgpt.site/api/projects'
$headers=@{'OAI-Sites-Authorization'='Bearer '+$Token}
$before=(Invoke-RestMethod $api -Headers $headers).projects | Where-Object id -eq 'PR-009'
$copy=$before | ConvertTo-Json -Depth 25 | ConvertFrom-Json
$copy.detail='TF interno0.6.4(1),9381ebc,CI35793229429: VALID/IN_BETA_TESTING. App Store1.0 conserva0.6.2(1),sin revisión. Windows0.6.4 prueba5: audio/cámara/balance/Tierra/final24s/4estructuras/Película viva/Respira. Fuente local ae104fe añade Recorrido A Espiral manual y privacidad EN/ES;13tests/tipos/4vistas OK, sin nueva build/subida. TF aún lleva ApprovedPause; Respira candidata verificada en EXE. Evidencia design/journey-spiral-2026-09-23. Falta QA físico iOS.'
$parts=$copy.next -split ' UI ',2
if($parts.Count-ne 2){throw 'Releer next: no se encuentra sección UI.'}
$copy.next='VORO 01a06eb1-17bb-74c1-b4a4-f88225d8e26d: ae104fe local, Recorrido A Espiral manual/confirmación y privacidad EN/ES;13tests/tipos/4vistas OK. Windows prueba5 conserva fixes/4estructuras. No nueva build; falta QA físico. UI '+$parts[1]
$copy.next=$copy.next.Replace('A Espiral elegida; marco Renacer refinado y entregado. Respira correcta local, TF aún ApprovedPause; usuario confirma TF. Enlace privacidad EN/ES encargado a VORO.','A Espiral refinada integrada local por VORO; privacidad EN/ES verificada. Respira correcta en EXE, TF aún ApprovedPause; usuario confirma TF.')
if($copy.detail.Length-gt 500 -or $copy.next.Length-gt 1000){throw 'Límite de campos excedido'}
$body=@{revision=$before.revision;project=$copy}|ConvertTo-Json -Depth 25
$null=Invoke-RestMethod $api -Method Put -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
$after=(Invoke-RestMethod $api -Headers $headers).projects | Where-Object id -eq 'PR-009'
if($after.detail-cne$copy.detail -or $after.next-cne$copy.next){throw 'Campos no coinciden en relectura'}
foreach($name in $before.PSObject.Properties.Name){
 if($name-in@('detail','next','revision','updatedAt')){continue}
 if(($before.$name|ConvertTo-Json -Depth 25 -Compress)-cne($after.$name|ConvertTo-Json -Depth 25 -Compress)){throw "Campo ajeno alterado: $name"}
}
$receipt=@{id='PR-009';beforeRevision=$before.revision;afterRevision=$after.revision;verified=$true;detail=$after.detail;next=$after.next;tracking=$after.tracking;noBuildOrUpload=$true}
$receipt|ConvertTo-Json -Depth 8|Set-Content (Join-Path $PSScriptRoot 'library-verified.json') -Encoding utf8
$receipt|ConvertTo-Json -Depth 8
