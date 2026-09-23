// Test-only: finish the newborn cinematic before XCTest looks for HUD controls.
// Never executed by TestFlight or release workflows; settings UI is unmodified.
import fs from 'node:fs';
const file='app/page.tsx',anchor='    engine.current = game;';
let source=fs.readFileSync(file,'utf8');
if(!source.includes(anchor))throw Error('Missing engine fixture anchor');
source=source.replace(anchor,anchor+`
    game.startTest(0,8,false,true,false);
    game.testMode=false;game.birth=0;game.progress.offer=[];game.publish();
`);
fs.writeFileSync(file,source);
