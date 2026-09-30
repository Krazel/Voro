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
 const s=SPECIES_BY_ID[ids[n]],hashes=new Set(),tiny=createCanvas(128,160),c=tiny.getContext('2d');
 for(let i=0;i<4;i++){
  c.clearRect(0,0,128,160);c.save();c.translate(64,80);
  drawJourneySprite(c,images,s.id,130/s.directionalArt.heightPerRadius,0,(i+.01)/4*s.directionalArt.walkPeriod,1,0,null,0);c.restore();
  hashes.add(createHash('sha256').update(c.getImageData(0,0,128,160).data).digest('hex'));
  p.drawImage(tiny,(n%2)*600+i*140,Math.floor(n/2)*180);
 }
 if(hashes.size!==4)throw Error(`${s.id}: duplicate walk frames`);
 rows.push({id:s.id,uniqueFrames:hashes.size,frameCount:4});
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
