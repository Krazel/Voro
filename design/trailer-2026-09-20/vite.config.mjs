import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
export default defineConfig({root:path.join(root,'design/trailer-2026-09-20'),publicDir:path.join(root,'public'),server:{host:'127.0.0.1',port:5196,fs:{allow:[root]}},plugins:[{name:'capture-output',configureServer(server){server.middlewares.use('/save-trailer-stream', (req,res)=>{if(req.method!=='POST'){res.statusCode=405;res.end();return;}const file=fs.createWriteStream(path.join(root,'design/trailer-2026-09-20/gameplay.h264'));req.pipe(file);file.on('finish',()=>res.end('saved'));});}}]});

