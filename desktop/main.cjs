const { app, BrowserWindow, Menu, protocol, session, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const { assetPath, externalAllowed } = require('./policy.cjs');

app.setName('VORO');
// Stable across versions and independent of the extracted ZIP location.
app.setPath('userData', process.env.VORO_QA_PROFILE || path.join(app.getPath('appData'), 'Krazel Games', 'VORO'));
app.setAppUserModelId('com.krazelgames.voro');
protocol.registerSchemesAsPrivileged([{ scheme: 'voro', privileges: {
  standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true,
} }]);
let win;
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } });
  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    const root = path.join(__dirname, 'game');
    protocol.handle('voro', async request => {
      const file = assetPath(root, request.url);
      if (!file || !['GET', 'HEAD'].includes(request.method)) return new Response('Forbidden', { status: 403 });
      try {
        const stat = await fs.promises.stat(file);
        if (!stat.isFile()) return new Response('Not found', { status: 404 });
        const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif', '.jpg':'image/jpeg', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.woff2':'font/woff2', '.ttf':'font/ttf' };
        const headers = new Headers({'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':String(stat.size)});
        headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'");
        return new Response(request.method === 'HEAD' ? null : Readable.toWeb(fs.createReadStream(file)), { status: 200, headers });
      } catch { return new Response('Not found', { status: 404 }); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      callback({ cancel: !/^(voro:|blob:|data:)/.test(details.url) });
    });
    win = new BrowserWindow({
      title: 'VORO · Abisal', width: 1440, height: 900, minWidth: 800, minHeight: 600,
      backgroundColor: '#001018', show: false, autoHideMenuBar: true,
      icon: path.join(__dirname, 'icon.ico'),
      webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true },
    });
    const openExternal = url => { if (externalAllowed(url)) void shell.openExternal(url); };
    win.webContents.setWindowOpenHandler(({ url }) => { openExternal(url); return { action: 'deny' }; });
    win.webContents.on('will-navigate', (event, url) => {
      if (url !== 'voro://game/') { event.preventDefault(); openExternal(url); }
    });
    win.webContents.on('will-attach-webview', event => event.preventDefault());
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && (input.key === 'F11' || (input.alt && input.key === 'Enter'))) {
        event.preventDefault(); win.setFullScreen(!win.isFullScreen());
      }
    });
    win.once('ready-to-show', () => { if (!process.env.VORO_QA_PROFILE) { win.maximize(); win.show(); } });
    win.on('closed', () => { win = null; });
    await win.loadURL('voro://game/');
  }).catch(error => { dialog.showErrorBox('VORO', String(error)); app.quit(); });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', () => { if (app.isReady()) session.defaultSession.flushStorageData(); });
}
