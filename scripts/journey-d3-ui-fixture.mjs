// Simulator-only completed run. The release workflow never executes this file.
import fs from 'node:fs';
const file='app/page.tsx';
let source=fs.readFileSync(file,'utf8');
const anchor='    engine.current = game;';
if(!source.includes(anchor))throw Error('Fixture anchor missing');
source=source.replace(anchor,anchor+`
    game.startTest(9, 220, false, true, false);
    game.progress.completed=true;game.ending=0;game.progress.offer=[];game.birth=0;
    game.progress.totalEaten=2345;game.life.eaten=0;
    game.progress.totalTime=4680;game.life.elapsed=0;game.progress.level=47;
    game.testMode=false;game.publish();
`);
fs.writeFileSync(file,source);
