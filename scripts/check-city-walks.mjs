import{createRequire}from'node:module';
import{writeFileSync,mkdirSync}from'node:fs';
import{createHash}from'node:crypto';
import{spawnSync}from'node:child_process';
import{SPECIES_BY_ID,ATLAS_URLS}from'../app/journey-data.mjs';
import{drawJourneySprite}from'../app/journey-sprites.mjs';
import ART from'../app/city-perspective-art.json'with{type:'json'};
const{createCanvas,loadImage}=createRequire(process.env.VORO_CANVAS_RUNTIME)('@napi-rs/canvas');
const out='design/city-walk-2026-10-01',frameDir='work/city-walk-video';mkdirSync(frameDir,{recursive:true});
const ids=ART.filter(a=>a.walkPeriod).map(a=>a.id),images={},rows=[];
for(const id of ids){const s=SPECIES_BY_ID[id];images[s.imageAtlas]=await loadImage('public/'+ATLAS_URLS[s.imageAtlas].slice(2));}
const proof=createCanvas(1200,900),p=proof.getContext('2d');p.fillStyle='#83958d';p.fillRect(0,0,1200,900);
for(let n=0;n<ids.length;n++){
 const s=SPECIES_BY_ID[ids[n]],hashes=new Set(),upperHashes=[],tiny=createCanvas(128,160),c=tiny.getContext('2d'),count=s.directionalArt.views[0].length;
 for(let i=0;i<count;i++){
  c.clearRect(0,0,128,160);c.save();c.translate(64,80);
  drawJourneySprite(c,images,s.id,130/s.directionalArt.heightPerRadius,0,(i+.01)/count*s.directionalArt.walkPeriod,1,0,null,0);c.restore();
  hashes.add(createHash('sha256').update(c.getImageData(0,0,128,160).data).digest('hex'));
  if(i===0||i===count/2)upperHashes.push(createHash('sha256').update(c.getImageData(0,10,128,65).data).digest('hex'));
  if(i%(count/4)===0)p.drawImage(tiny,(n%2)*600+i/(count/4)*140,Math.floor(n/2)*180);
 }
 if(hashes.size!==count)throw Error(`${s.id}: duplicate walk frames`);
 const upperBodyMoves=upperHashes[0]!==upperHashes[1];
 if(['city-civilian-0','city-civilian-1','city-civilian-4'].includes(s.id)&&!upperBodyMoves)throw Error(`${s.id}: frozen upper body across opposite steps`);
 const art=s.directionalArt;
 const old=await loadImage(`public/inhabitants/city-perspective/${s.id}-walk-v3.webp`);
 const oldCanvas=createCanvas(1024,256),kept=createCanvas(1024,256);
 oldCanvas.getContext('2d').drawImage(old,0,256,1024,256,0,0,1024,256);
 kept.getContext('2d').drawImage(images[s.imageAtlas],0,art.size[1]-256,1024,256,0,0,1024,256);
 const pixelHash=canvas=>createHash('sha256').update(canvas.getContext('2d').getImageData(0,0,1024,256).data).digest('hex');
 if(pixelHash(oldCanvas)!==pixelHash(kept))throw Error(`${s.id}: front/back pixels changed`);
 rows.push({id:s.id,uniqueFrames:hashes.size,frameCount:count,frontBackPixelsIdentical:true,upperBodyMoves});
 p.fillStyle='#142d26';p.font='13px sans-serif';p.fillText(s.name,(n%2)*600+10,Math.floor(n/2)*180+171);
}
writeFileSync(out+'/quarter-poses.png',proof.toBuffer('image/png'));
const video=createCanvas(1000,700),c=video.getContext('2d');
for(let f=0;f<120;f++){
 c.fillStyle='#83958d';c.fillRect(0,0,1000,700);c.fillStyle='#142d26';c.font='24px sans-serif';c.fillText('VORO · ciclos laterales · 10 personajes',24,35);
 for(let n=0;n<ids.length;n++){
  const s=SPECIES_BY_ID[ids[n]],x=100+(n%5)*200,y=185+Math.floor(n/5)*320;
  c.save();c.translate(x,y);drawJourneySprite(c,images,s.id,220/s.directionalArt.heightPerRadius,0,(f+.01)/30,1,0,null,0);c.restore();
  c.fillStyle='#142d26';c.textAlign='center';c.font='15px sans-serif';c.fillText(s.name,x,y+143);
 }
 writeFileSync(`${frameDir}/${String(f).padStart(3,'0')}.png`,video.toBuffer('image/png'));
}
const ff='work/audio-audit-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';
const result=spawnSync(ff,['-y','-v','error','-framerate','30','-i',frameDir+'/%03d.png','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-movflags','+faststart',out+'/walks.mp4'],{stdio:'inherit'});
if(result.status!==0)throw Error('Video export failed');
writeFileSync(out+'/frame-verification.json',JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows));
