import { RELEASE } from '../app/release.mjs';
export function buildFlavorPlugin(){
  const development=process.env.VORO_DEVELOPMENT==='1';
  return {name:'voro-build-flavor',config(){return{define:{__VORO_DEVELOPMENT__:JSON.stringify(development)}};},
    generateBundle(){this.emitFile({type:'asset',fileName:'voro-build.json',source:JSON.stringify({...RELEASE,developmentTools:development},null,2)});}};
}
