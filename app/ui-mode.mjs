export const UI_MODE_KEY='voro-ui-mode-v1';
export function readUiMode(storage){try{return storage?.getItem(UI_MODE_KEY)==='final'?'final':'development';}catch{return 'development';}}
export function writeUiMode(storage,mode){try{storage?.setItem(UI_MODE_KEY,mode==='final'?'final':'development');return !!storage;}catch{return false;}}
export function initialUiMode(storage, search='') {
  const requested = new URLSearchParams(search).get('ui');
  if (requested === 'development' || requested === 'final') return requested;
  // Legacy development preferences must not restore retired menus at launch.
  return 'final';
}
