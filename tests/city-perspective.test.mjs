import test from 'node:test';
import assert from 'node:assert/strict';
import ART from '../app/city-perspective-art.json' with {type:'json'};
import BASELINE from '../design/city-perspective-2026-09-30/gameplay-baseline.json' with {type:'json'};
import {SPECIES_BY_ID,STAGE_SPECIES} from '../app/journey-data.mjs';
import {drawJourneySprite,journeyHeading} from '../app/journey-sprites.mjs';
import {cityDirection} from '../app/city-perspective-art.mjs';
import {compactCityAtlas,StageAssets} from '../app/stage-assets.mjs';
import {animationCrop} from '../app/animation-catalog.mjs';
import WALK_AUDIT from '../design/city-walk-2026-10-01/painted-frame-audit.json' with {type:'json'};
import RIG_AUDIT from '../design/city-walk-corrections-2026-10-01/rig-audit.json' with {type:'json'};
import BEFORE from '../design/city-walk-corrections-2026-10-01/before-art.json' with {type:'json'};

test('City art replacement preserves every existing gameplay size, reward and attack',()=>{
 const current=STAGE_SPECIES[4].map(({id,r,value,requiredMass,speed,sizeFactors,kind,shot})=>({id,r,value,requiredMass,speed,sizeFactors,kind,shot}));
 assert.deepEqual(JSON.parse(JSON.stringify(current)),BASELINE);
 assert.equal(ART.length,20);
 assert.equal(ART.filter(a=>a.kind==='human').length,10);
});

test('City turns select distinct authored views without rotating bodies or using old sheets',()=>{
 for(const a of ART.filter(a=>a.kind!=='prop')){
  const s=SPECIES_BY_ID[a.id],im={complete:true,naturalWidth:a.size[0],naturalHeight:a.size[1]};
  assert.equal(s.directionalArt.views.length,4);
  for(let d=0;d<4;d++){
   const angle=d*Math.PI/2;assert.equal(journeyHeading(s.id,angle),0);
   assert.equal(cityDirection(angle-Math.PI*2),d);
   const draws=[];
   const c=new Proxy({globalAlpha:1,drawImage:(...v)=>draws.push(v),rotate:()=>assert.fail('Body must stay upright')},{get:(o,k)=>o[k]??(()=>{})});
   drawJourneySprite(c,{[s.imageAtlas]:im},s.id,s.r,0,1,1,0,{draw:()=>assert.fail('Stale sheet')},angle);
   assert.ok(draws.length>=1&&draws.length<=2);
   for(const draw of draws){
    assert.ok(a.frames.some(f=>f.direction===d&&f.crop.every((v,i)=>v===draw[i+1])));
    assert.ok(draw.slice(1).every(Number.isFinite));
   }
  }
 }
});

test('City source crops remain bounded and compact atlases retain correct source coordinates',()=>{
 for(const a of ART){
  const [w,h]=a.size;
  for(const f of a.frames){const[x,y,fw,fh]=f.crop;assert.ok(x>=0&&y>=0&&x+fw<=w&&y+fh<=h&&fw>0&&fh>0);}
  const source={naturalWidth:w,naturalHeight:h};
  const surface=compactCityAtlas(source,()=>({getContext:()=>({drawImage(){}})}));
  assert.ok(Math.max(surface.width,surface.height)<=768);
  assert.equal(surface.complete,true);
  const s=SPECIES_BY_ID[a.id],crop=animationCrop(s,surface);
  assert.ok(crop[0]+crop[2]<=surface.width+.001&&crop[1]+crop[3]<=surface.height+.001);
 }
});

test('City compact textures are released on stage changes and original decodes are cleared',async()=>{
 const atlases={},created=[];
 const loader=new StageAssets(atlases,{},()=>{},()=>{const im={complete:false,naturalWidth:1536,naturalHeight:1024,decode:async()=>{}};created.push(im);return im;},()=>({getContext:()=>({drawImage(){}})}));
 loader.setStages([4]);
 for(const im of created){if(im.src){im.onload();await Promise.resolve();}}
 assert.ok(loader.ready(4));
 const surfaces=Object.entries(atlases).filter(([k])=>k.startsWith('cityView_')).map(([,im])=>im);
 assert.equal(surfaces.length,20);
 assert.ok(created.filter(im=>im.src==='').length>=20);
 loader.setStages([0]);
 assert.ok(surfaces.every(im=>im.width===1&&im.height===1));
 assert.ok(!Object.keys(atlases).some(k=>k.startsWith('cityView_')));
 loader.destroy();
});

test('Every lateral human walk visits its full cycle and has a stable stopped pose',()=>{
 for(const a of ART.filter(a=>a.kind==='human')){
  const s=SPECIES_BY_ID[a.id],im={complete:true,naturalWidth:a.size[0],naturalHeight:a.size[1]};
  const count=a.walkRevision===8?8:4;
  assert.equal(s.directionalArt.views[0].length,count);
  assert.equal(s.directionalArt.views[2].length,count);
  assert.equal(s.directionalArt.views[1].length,2);
  assert.equal(s.directionalArt.views[3].length,2);
  for(const direction of [0,2]){
   let selected;
   const c=new Proxy({globalAlpha:1,drawImage:(...v)=>{selected=v.slice(1,5);}},{get:(o,k)=>o[k]??(()=>{})});
   const seen=new Set();
   for(let i=0;i<count;i++){
    drawJourneySprite(c,{[s.imageAtlas]:im},s.id,s.r,0,(i+.1)/count*a.walkPeriod,1,0,null,direction*Math.PI/2);
    seen.add(JSON.stringify(selected));
   }
   assert.equal(seen.size,count,`${a.id}: frozen/omitted lateral frames`);
   drawJourneySprite(c,{[s.imageAtlas]:im},s.id,s.r,0,.001,0,0,null,direction*Math.PI/2);
   const stopped=selected;
   drawJourneySprite(c,{[s.imageAtlas]:im},s.id,s.r,0,10,0,0,null,direction*Math.PI/2);
   assert.deepEqual(selected,stopped);
  }
 }
});

test('Painted lateral passing poses really close the leg silhouette, not just recolour it',()=>{
 assert.equal(WALK_AUDIT.length,10);
 for(const a of WALK_AUDIT.filter(a=>SPECIES_BY_ID[a.id].directionalArt.walkRevision!==8)){
  assert.equal(a.uniqueFrames,4);
  for(const [contact,passing]of[[0,1],[2,3]])
   assert.ok(a.poses[contact].legSpan>a.poses[passing].legSpan*1.2,`${a.id}: passing pose must differ from contact`);
  assert.deepEqual(a.preservedViews,[1,3]);
 }
});

test('Corrected walks exchange the near/far supporting leg across both halves of the cycle',()=>{
 assert.equal(RIG_AUDIT.length,6);
 for(const a of RIG_AUDIT){
  assert.equal(a.uniqueFrames,8);
  const first=a.poses[0],opposite=a.poses[4];
  assert.ok(first.near.ankle[0]>first.near.hip[0]+10);
  assert.ok(opposite.near.ankle[0]<opposite.near.hip[0]-10);
  assert.ok(first.far.ankle[0]<first.far.hip[0]-10);
  assert.ok(opposite.far.ankle[0]>opposite.far.hip[0]+10);
  for(const p of a.poses){
   assert.notEqual(p.near.stance,p.far.stance,'One supporting leg and one swinging leg');
   assert.equal(p.near.hip[0],128,'No horizontal root translation');
  }
 }
});

test('Approved civilian, shield unit and runner art and motion remain unchanged',()=>{
 for(const id of ['city-0','city-2','city-civilian-2'])
  assert.deepEqual(ART.find(a=>a.id===id),BEFORE.find(a=>a.id===id));
});
