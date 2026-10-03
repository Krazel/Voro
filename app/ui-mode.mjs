// Retained for compatibility with earlier saves; the shipped game has one UI.
export const UI_MODE_KEY='voro-ui-mode-v1';
export const initialUiMode=()=> 'final';
export const readUiMode=()=> 'final';
export function writeUiMode(storage){try{storage?.removeItem(UI_MODE_KEY);return !!storage;}catch{return false;}}
