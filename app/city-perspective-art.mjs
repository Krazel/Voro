import ART from './city-perspective-art.json' with { type: 'json' };

// Stable species IDs and gameplay radii keep existing saves and balance intact.
export function applyCityPerspectiveArt(byId, urls) {
  for (const a of ART) {
    const s = byId[a.id];
    const oldAspect = s.crop[3] / s.crop[2];
    const key = `cityView_${a.id}`;
    urls[key] = `./inhabitants/city-perspective/${a.file||a.id+'.png'}`;
    s.imageAtlas = key;
    s.animationCropRevision = (a.walkRevision||(a.walkPeriod?6:4))+(a.registrationRevision||0)*100+(a.verticalRevision||0)*1000;
    s.artProfile = {family:'prop',rigid:true,period:1.2,revision:s.animationCropRevision,
      crop:a.frames[0].crop,
      description:'Vista elevada con cámara fija y orientación coherente con la ciudad.'};
    if (a.kind === 'prop') {
      s.crop = a.frames[0].crop;
      s.fixedHeading = 0;
      s.artScale = Math.min(1, oldAspect / (s.crop[3]/s.crop[2]));
      if(s.id==='city-matter-palm') Object.assign(s.artProfile,{family:'plant',rigid:false,amount:.025,period:8});
    } else {
      s.directionalArt = {...a, views:[0,1,2,3].map(d=>a.frames.filter(f=>f.direction===d)),
        heightPerRadius:s.motion==='walker'?20/s.r:undefined};
    }
  }
}

export function cityDirection(heading) {
  return ((Math.round(heading / (Math.PI/2)) % 4) + 4) % 4;
}

// Authored turns preserve the upright projection; never rotate these cutouts.
// Lateral walks use painted contact/passing poses; one image draw per human.
export function drawCityDirectional(c, image, s, r, seed, time, activity, hurt, heading) {
  const a=s.directionalArt;
  if (!image || !(image.naturalWidth || image.width)) return;
  const direction=cityDirection(heading);
  const frames=a.views[direction];
  if (!frames.length) return;
  const phase=time*(a.kind==='human'?9:3)*Math.max(.25,activity)+seed;
  const walking=a.kind==='human'&&time>0&&activity>0;
  const lateral=!!a.walkPeriod&&(direction===0||direction===2);
  const tick=lateral?(time*Math.max(.25,activity)/a.walkPeriod+seed/(Math.PI*2))*frames.length:phase/Math.PI;
  const pose=walking&&frames.length>1?((Math.floor(tick)%frames.length)+frames.length)%frames.length:0;
  const size=a.kind==='human'?r*a.heightPerRadius:r*2;
  const unit=size/(a.kind==='human'?a.referenceHeight:a.referenceSpan);
  const alpha=c.globalAlpha;
  c.save();
  if(walking&&!a.registrationRevision)c.translate(0,-Math.abs(Math.sin(lateral?tick/frames.length*Math.PI*2:phase))*size*(lateral?.006:.018));
  else if(a.kind==='rotor')c.translate(0,Math.sin(phase)*r*.025);
  // Common foot/centre registration prevents the sprite jumping between views.
  {
    const f=frames[pose], [x,y,w,h]=f.crop;
    c.globalAlpha=alpha;
    if(f.flipX)c.scale(-1,1);
    const sx=image.sourceScaleX||1,sy=image.sourceScaleY||1;
    const frameUnit=unit*(f.registration?.scale||1);
    c.drawImage(image,x*sx,y*sy,w*sx,h*sy,-f.anchor[0]*frameUnit,-f.anchor[1]*frameUnit,w*frameUnit,h*frameUnit);
    if(f.rotor) {
      const [hx,hy,rx,ry]=f.rotor,px=(hx-f.anchor[0])*unit,py=(hy-f.anchor[1])*unit;
      // The rotor spins in the horizontal world plane, projected as an ellipse.
      // The cabin and skids never rotate with it. No generated mesh or cache.
      c.fillStyle='rgba(143,149,139,.09)';c.beginPath();c.ellipse(px,py,rx*unit,ry*unit,0,0,Math.PI*2);c.fill();
      c.lineWidth=Math.max(.6,r*.025);c.strokeStyle='rgba(43,48,43,.42)';
      for(let blade=0;blade<4;blade++) {
        const angle=time*43+seed+blade*Math.PI/2;
        c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(angle)*rx*unit,py+Math.sin(angle)*ry*unit);c.stroke();
      }
    }
  }
  if(hurt>0) {
    c.globalAlpha=alpha*Math.min(.28,hurt*.28);
    c.fillStyle='#ffd6ae';
    c.beginPath();c.ellipse(0,0,r*.7,r*.4,0,0,Math.PI*2);c.fill();
  }
  c.restore();
}
