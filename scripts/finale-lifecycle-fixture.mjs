// Native QA only. The release/TestFlight pipeline never invokes this fixture.
import fs from 'node:fs';
const file='app/page.tsx',anchor='    engine.current = game;';
let source=fs.readFileSync(file,'utf8');if(!source.includes(anchor))throw Error('Missing fixture anchor');
source=source.replace(anchor,anchor+`
    const checkpoint=document.createElement('p');checkpoint.style.cssText='position:fixed;top:0;left:0;font-size:8px;z-index:99999;color:#888';document.body.append(checkpoint);
    const emit=game.emit;game.emit=(state)=>{emit(state);checkpoint.textContent='Finale checkpoint '+(state.started?'started':'intro')+' paused '+state.paused+' remaining '+Math.ceil(state.ending);};
    if(!game.progress.completed){
      game.startTest(9,230,false,true,true);game.testMode=false;game.birth=0;game.progress.offer=[];
      game.beginUniverseFinale();game.ending=17;game.progress.finaleRemaining=17;game.save();game.publish();
    } else game.publish();
`);
fs.writeFileSync(file,source);
