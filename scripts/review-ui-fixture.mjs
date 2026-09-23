// Used only by review-checkpoint.yml; never run by a distributable build.
import fs from 'node:fs';
const file='app/page.tsx';
let source=fs.readFileSync(file,'utf8');
const anchor='    engine.current = game;';
if(!source.includes(anchor))throw Error('Fixture anchor missing');
source=source.replace(anchor,anchor+`
    // Native UI fixture: jump to the actual water-completion path, then use the real bridge.
    game.startTest(1, STAGES[1].goal, false, true, false);
    game.paused = true;
    const checkpointTimer = window.setInterval(() => {
      if (!game.assetsReady) return;
      clearInterval(checkpointTimer);
      game.testMode = false; game.paused = false; game.progress.offer = [];
      game.beginEvolution();
    }, 100);
`);
source=source.replace('      <ReviewMilestone held=', `      <span style={{position:"fixed",bottom:0,zIndex:10000}}>{"review-stage-"+state.stage}</span>
      <ReviewMilestone held=`);
fs.writeFileSync(file,source);
