export const UI_MODE_KEY='voro-ui-mode-v1';
export function readUiMode(storage){try{return storage?.getItem(UI_MODE_KEY)==='final'?'final':'development';}catch{return 'development';}}
export function writeUiMode(storage,mode){try{storage?.setItem(UI_MODE_KEY,mode==='final'?'final':'development');return !!storage;}catch{return false;}}
