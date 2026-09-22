const path = require('node:path');
const externalHosts = new Set(['www.instagram.com', 'creativecommons.org', 'www.scottbuckley.com.au']);
function externalAllowed(input) {
  try { const u = new URL(input); return u.protocol === 'https:' && !u.username && !u.password && !u.port && externalHosts.has(u.hostname); }
  catch { return false; }
}
function assetPath(root, input) {
  try {
    const u = new URL(input);
    if (u.protocol !== 'voro:' || u.host !== 'game' || u.username || u.password) return null;
    const name = decodeURIComponent(u.pathname);
    if (/[\\\0:]/.test(name)) return null;
    const target = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    const relative = path.relative(root, target);
    if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) return null;
    return target;
  } catch { return null; }
}
module.exports = { externalAllowed, assetPath };
