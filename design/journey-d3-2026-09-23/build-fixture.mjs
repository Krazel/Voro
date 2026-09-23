import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const original=fs.readFileSync('app/page.tsx');
try {
 execFileSync(process.execPath,['scripts/journey-d3-ui-fixture.mjs']);
 execFileSync('cmd.exe',['/d','/s','/c','npm run build:mobile'],{stdio:'inherit'});
} finally {fs.writeFileSync('app/page.tsx',original);}
