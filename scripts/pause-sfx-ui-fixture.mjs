// Test-only entry into ordinary pause. Never executed by the distribution workflow.
import fs from 'node:fs';
const file='app/page.tsx';
let source=fs.readFileSync(file,'utf8');
const anchor='    engine.current = game;';
if(!source.includes(anchor))throw Error('Fixture anchor missing');
source=source.replace(anchor,anchor+`
    game.startTest(0, 20, false, true, false);
    game.paused=true;game.testMode=false;game.progress.offer=[];game.publish();
`);
source=source.replace('      <ReviewMilestone held=', `
      <button style={{position:"fixed",bottom:24,zIndex:10000}} onClick={async event=>{
        const button=event.currentTarget,game=engine.current!;
        game.initAudio();await game.sfx?.unlock();await game.audio?.resume();
        const before=game.sfx?.stats().played??0;
        for(let i=0;i<5;i++){game.sfx?.playIngest();await new Promise(resolve=>setTimeout(resolve,360));}
        button.textContent="ingest-audio-"+game.sfx?.stats().decoded+"-"+((game.sfx?.stats().played??0)-before);
      }}>Check ingest audio</button>
      <ReviewMilestone held=`);
fs.writeFileSync(file,source);
