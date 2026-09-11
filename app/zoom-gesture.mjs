import {zoomPreference} from './camera.mjs';

// Once a pinch starts, consume the whole touch sequence. A remaining finger
// must never become movement until the user lifts it and starts a new touch.
export class ZoomGesture {
  points = new Map();
  locked = false;
  distance = 0;
  span() {
    const [a,b]=this.points.values();
    return a && b ? Math.hypot(a.x-b.x,a.y-b.y) : 0;
  }
  down(id,point) {
    this.points.set(id,point);
    if(this.points.size>=2) { this.locked=true;this.distance=this.span(); }
  }
  move(id,point,factor) {
    if(!this.points.has(id))return null;
    this.points.set(id,point);
    if(!this.locked || this.points.size<2)return null;
    const distance=this.span(),before=this.distance;
    this.distance=distance;
    if(before<12 || distance<12)return null;
    return zoomPreference(factor*distance/before);
  }
  up(id) {
    this.points.delete(id);this.distance=this.span();
    if(!this.points.size)this.locked=false;
  }
  reset() { this.points.clear();this.locked=false;this.distance=0; }
}
export function wheelZoom(factor,delta,mode=0) {
  const pixels=delta*(mode===1?16:mode===2?480:1);
  return zoomPreference(factor*Math.exp(-Math.max(-120,Math.min(120,pixels))*.002));
}
