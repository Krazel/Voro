import { LivingMenuArt } from './living-menu-art';

// Recompose the original approved plate, without generating or baking new art.
const panel = [.02, .21, .96, .48] as const;
const button = [.22, .78, .56, .145] as const;
function Surface({name,crop}:{name:string;crop:readonly number[]}) {
  return <div className={'landscape-surface '+name} aria-hidden="true">
    <svg viewBox={`${crop[0]*941} ${crop[1]*1672} ${crop[2]*941} ${crop[3]*1672}`} preserveAspectRatio="none">
      <image href="./ui/approved/settings-plate.png" width="941" height="1672" />
    </svg>
    <LivingMenuArt journey={false} crop={crop} />
  </div>;
}
export function LandscapeMenuArt() {
  return <><Surface name="landscape-panel-surface" crop={panel}/><Surface name="landscape-button-surface" crop={button}/></>;
}
