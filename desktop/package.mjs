import { packager } from '@electron/packager';
import { cp, mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RELEASE } from '../app/release.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const tools = path.join(root, 'desktop');
const output = path.join(root, 'artifact', 'windows', `${RELEASE.version}-preview.1`);
const stage = path.join(root, 'work', 'windows-package', `${RELEASE.version}-preview.1`, 'app-source');
await access(path.join(root, 'pc-dist', 'index.html'));
await mkdir(stage, { recursive: true });
await cp(path.join(root, 'pc-dist'), path.join(stage, 'game'), { recursive: true });
for (const name of ['main.cjs', 'policy.cjs', 'icon.ico']) await cp(path.join(tools, name), path.join(stage, name));
await writeFile(path.join(stage, 'package.json'), JSON.stringify({
  name: 'voro', productName: 'VORO', version: RELEASE.version, main: 'main.cjs',
  author: 'Krazel Games', description: 'VORO · Abisal', license: 'UNLICENSED',
}, null, 2));
const [appPath] = await packager({
  dir: stage, out: output, name: 'VORO', executableName: 'VORO', platform: 'win32', arch: 'x64',
  electronVersion: '44.4.3', appVersion: RELEASE.version, buildVersion: `${RELEASE.version}.1`,
  icon: path.join(tools, 'icon.ico'), asar: true, overwrite: false, prune: false,
  win32metadata: { CompanyName: 'Krazel Games', FileDescription: 'VORO · Abisal', ProductName: 'VORO' },
});
await writeFile(path.join(appPath, 'LEEME.txt'), `VORO · Abisal — ${RELEASE.version}, prueba Windows 1\r\n\r\nExtrae el ZIP completo y abre VORO.exe. No se necesita Node, navegador ni servidor.\r\nMovimiento: WASD / flechas o raton. Impulso: espacio. Pausa: Escape.\r\nPantalla completa: F11 o Alt+Enter. Cerrar: Alt+F4 o boton de la ventana.\r\nLa partida se guarda en %APPDATA%\\Krazel Games\\VORO, fuera de la carpeta del juego.\r\nVersion local de prueba sin firma digital; aun no publicada en itch.io ni Steam.\r\nMusica y licencias: Configuracion > Creditos > Ver licencias.\r\n\r\nExtract the entire ZIP and open VORO.exe. No browser or server required.\r\nMove: WASD / arrows or mouse. Dash: Space. Pause: Escape. Fullscreen: F11 / Alt+Enter.\r\nTest build, unsigned, not yet published. Music credits are available in Settings.\r\n`);
console.log(JSON.stringify({ appPath, version: RELEASE.version, desktopBuild: 1, electron: '44.4.3' }));
