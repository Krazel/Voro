import {readFileSync,readdirSync,unlinkSync,writeFileSync} from 'node:fs';
import {resolve,sep} from 'node:path';
const root=resolve('public/animation-sheets');
const used=new Set(Object.values(JSON.parse(readFileSync('app/animation-sheets.json'))).flatMap(v=>Object.values(v).map(m=>m.url.split('/').at(-1))));
const removed=[];
for(const name of readdirSync(root)){
 if(used.has(name))continue;
 if(!/^[a-f0-9]{16}\.webp$/.test(name))throw new Error(`Unexpected file: ${name}`);
 const target=resolve(root,name);if(!target.startsWith(root+sep))throw new Error('Outside animation directory');
 removed.push(name);unlinkSync(target);
}
writeFileSync('design/asset-improvements-2026-09-28/obsolete-sheets.json',JSON.stringify(removed,null,2));
console.log({removed:removed.length,retained:used.size});
