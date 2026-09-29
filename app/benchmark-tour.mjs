// Scheduling only: the real engine, renderer and frame monitor do the work.
export class BenchmarkTour {
  constructor(plan, {seconds=5, warmupMs=1000, loadTimeoutMs=30000}={}) {
    this.plan=plan;this.seconds=seconds;this.warmupMs=warmupMs;this.loadTimeoutMs=loadTimeoutMs;
    this.index=-1;this.state='next';this.last=null;this.elapsed=0;this.loadingMs=0;
    this.motionMs=0;this.lastDash=0;this.results=[];this.status='running';
  }
  get current(){return this.plan[this.index];}
  tick(stamp,{active,ready,error}) {
    if(!active){this.last=null;return null;}
    const dt=this.last===null?0:Math.max(0,stamp-this.last);this.last=stamp;
    if(this.state==='next'){
      if(++this.index>=this.plan.length)return 'finish';
      this.state='loading';this.elapsed=this.loadingMs=this.motionMs=this.lastDash=0;
      return 'enter';
    }
    if(this.state==='loading'){
      this.loadingMs+=dt;
      if(error)return 'asset-error';
      if(!ready)return this.loadingMs>=this.loadTimeoutMs?'load-timeout':null;
      this.state='warmup';this.elapsed=0;return null;
    }
    if(this.state==='warmup'){
      if(!ready){this.state='loading';return null;}
      this.elapsed+=dt;this.motionMs+=dt;
      if(this.elapsed>=this.warmupMs){this.state='recording';return 'record';}
    } else if(this.state==='recording') this.motionMs+=dt;
    return null;
  }
  movement(){const t=this.motionMs/1000;return {x:Math.cos(.4+Math.sin(t*.2)*.65),y:Math.sin(.4+Math.sin(t*.2)*.65)};}
  dashDue(){const n=this.motionMs<2000?0:1+Math.floor((this.motionMs-2000)/9000);if(n>this.lastDash){this.lastDash=n;return true;}return false;}
  /** @param {string} status @param {any} [report] */
  complete(status,report=null){this.results.push({...this.current,status,loadingMs:Math.round(this.loadingMs),report});this.state='next';}
}

export function tourReport(tour,metadata,status) {
  const reports=tour.results.flatMap(x=>x.report?.summary?[x.report]:[]);
  const frames=reports.reduce((n,r)=>n+r.summary.frames,0);
  // Use measured duration rather than averaging per-scene FPS.
  const ms=reports.reduce((n,r)=>n+(r.captureMs??r.summary.frames*1000/(r.session.fps||r.summary.fps||1)),0);
  return {...metadata,format:'voro-performance-tour-v1',status,mode:tour.mode||'performance',
    protocol:{secondsPerSize:tour.mode==='audio'?null:tour.seconds,sizes:tour.mode==='audio'?['entry']:['entry','grown'],warmupMs:tour.warmupMs,
      automaticMovement:true,firstDashAfterSeconds:2,dashAttemptEverySeconds:9,invulnerable:true,upgrades:[],automaticEvolution:false,
      freshRasterBudgetPerSize:true,loadingTimeoutMs:tour.loadTimeoutMs},
    planned:tour.plan.length,finished:tour.results.length,
    summary:{frames,seconds:Math.round(ms/1000),fps:ms?+(frames*1000/ms).toFixed(1):0,
      slowFrames:reports.reduce((n,r)=>n+r.summary.slowFrames,0)},
    results:tour.results,
    ...(tour.mode==='audio'?{audioProtocol:{version:1,tracks:12,secondsPerTrack:8,finalSeconds:10,sampleIntervalMs:100,
      effects:['ingest-1','ingest-2','ingest-3','ingest-4','ingest-5','damage','shield','chime','evolve','final'],
      musicOnlyBaseline:'menu',musicCrossfades:true,manualGlitchMarks:true,
      limitation:'Diagnostic observations do not guarantee identification of an audible hardware/OS glitch.'}}:{}),
    notes:tour.mode==='audio'?[
      'Fragmentos de las doce pistas, crossfades y efectos reales durante movimiento automático. No reproduce canciones enteras ni prueba su bucle final.',
      'Efectos de comida espontáneos silenciados durante esta prueba para identificar las cinco muestras programadas.',
      'Unos 104 segundos más cargas, pausas y calentamiento. No modifica la partida ni envía datos automáticamente.',
      'El muestreo de señal es intermitente y anterior al altavoz; no demuestra por sí solo la causa de un chasquido. No graba el micrófono.'
    ]:['Prueba controlada en el motor real. No mide GPU directamente.',
      'Cada entorno se prueba al entrar y con mayor biomasa, sin mejoras, sin muerte ni menús de adaptación.',
      'Carga y calentamiento se separan de la medición; pausas y segundo plano no cuentan.',
      'La escena se reinicia entre tamaños. No prueba la animación de transición ni el final del universo.',
      'No modifica el progreso de la campaña ni envía datos automáticamente.']};
}
