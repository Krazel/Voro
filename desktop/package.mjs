import { packager } from '@electron/packager';
import { cp, mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RELEASE } from '../app/release.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const tools = path.join(root, 'desktop');
const desktopVersion=RELEASE.version.split('.').length===2 ? `${RELEASE.version}.0` : RELEASE.version;
const { gameVersion, preview } = JSON.parse(await readFile(path.join(tools,'release.json'),'utf8'));
if(gameVersion!==RELEASE.version || !Number.isInteger(preview) || preview<1)throw new Error('Invalid desktop release');
const output = path.join(root, 'artifact', 'windows', `${RELEASE.version}-preview.${preview}`);
const stage = path.join(root, 'work', 'windows-package', `${RELEASE.version}-preview.${preview}`, 'app-source');
await access(path.join(root, 'pc-dist', 'index.html'));
await mkdir(stage, { recursive: true });
await cp(path.join(root, 'pc-dist'), path.join(stage, 'game'), { recursive: true });
for (const name of ['main.cjs', 'policy.cjs', 'icon.ico']) await cp(path.join(tools, name), path.join(stage, name));
await writeFile(path.join(stage, 'package.json'), JSON.stringify({
  name: 'voro', productName: 'VORO', version: desktopVersion, main: 'main.cjs',
  author: 'Krazel Games', description: 'VORO · Abisal', license: 'UNLICENSED',
}, null, 2));
const [appPath] = await packager({
  dir: stage, out: output, name: 'VORO', executableName: 'VORO', platform: 'win32', arch: 'x64',
  electronZipDir: process.env.VORO_ELECTRON_ZIP_DIR, electronVersion: '44.4.3', appVersion: desktopVersion, buildVersion: `${RELEASE.version}.${preview}`,
  icon: path.join(tools, 'icon.ico'), asar: true, overwrite: false, prune: false,
  win32metadata: { CompanyName: 'Krazel Games', FileDescription: 'VORO · Abisal', ProductName: 'VORO' },
});
await writeFile(path.join(appPath, 'LEEME.txt'), (await readFile(path.join(tools, 'LEEME.txt'), 'utf8')).replaceAll('{{VERSION}}', RELEASE.version));
console.log(JSON.stringify({ appPath, version: RELEASE.version, desktopBuild: preview, electron: '44.4.3' }));
