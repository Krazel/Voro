// Compact exports retain diagnostic evidence, not thousands of per-frame rows.
export function compactPerformanceReport(report) {
  if (!report?.summary?.frames) throw new Error('Primero mide una partida de 30 s.');
  const events = {};
  for (const e of report.events || []) {
    const group = events[e.name] ||= {count:0,maxMs:0,failed:0};
    group.count++; group.maxMs=Math.max(group.maxMs,e.ms);if(e.ok===false)group.failed++;
  }
  return {
    format:'voro-performance-v3-compact',version:report.version,build:report.build,date:report.date,
    userAgent:report.userAgent,viewport:report.viewport,summary:report.summary,session:report.session,
    animationSheets:report.animationSheets,animationCache:report.animationCache,
    backgroundRebuilds:report.backgroundRebuilds,
    backgroundRebuildsDuringCapture:report.backgroundRebuildsDuringCapture,
    diagnostics:report.diagnostics,
    worstFrames:report.worstFrames.slice(0,5),events,
    coverage:{retainedFrames:report.session.retainedFrames,exportedWorstFrames:Math.min(5,report.worstFrames.length),rawSamplesOmitted:true},
    notes:['Cadencia rAF, no tiempo de GPU. CPU del motor; no incluye todo WebKit.',
      'Secciones de CPU anidadas. El intervalo puede reflejar trabajo del fotograma anterior.',
      'Cargas: tiempo transcurrido, no CPU. Memoria: buffers propios, no memoria total de la app.',
      'Pausas y espera de assets base excluidas. Se omiten muestras crudas; se conservan resumen y peores cuadros.',
      'Correlaciones no excluyentes con el fotograma anterior, no causas demostradas. Retraso rAF no equivale a GPU.',
      'uiDeliveryDelay mide espera y entrega a React, no CPU de React aislada. Cero si no hubo entrega en ese cuadro.'],
  };
}
export function performanceSummaryText(report) {
  const r=compactPerformanceReport(report),s=r.summary;
  return `VORO ${r.version} (${r.build}) · ${s.seconds} s / ${s.frames} fotogramas\nFPS: ${r.session.fps} · P95: ${s.p95} ms · P99: ${r.session.p99} ms · Pico: ${s.peak} ms\nCuadros >33 ms: ${s.slowFrames} · CPU: ${s.cpu} ms\nAnimaciones: ${(r.animationSheets.bytes/1048576).toFixed(1)} MiB · ${r.animationSheets.errors} errores · ${r.animationCache.entries} poses en caché procedural\n${r.userAgent}\nPara analizar los tirones, comparte también el archivo desde Configuración.`;
}
// Delivery adapters allow native sharing to be verified without sending anything.
export async function deliverReportFile(data, adapters) {
  const name='Voro-rendimiento.txt';
  if (adapters.native) {
    const file=await adapters.write(name,data);
    await adapters.shareNative(file.uri);
    return 'prepared';
  }
  const file=new File([data],name,{type:'text/plain'});
  if (adapters.canShare(file)) {
    await adapters.shareWeb(file);
    return 'prepared';
  }
  adapters.download(file);
  return 'downloaded';
}
