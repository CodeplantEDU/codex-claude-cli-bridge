// Starts the bridge only when nothing is listening on its port; safe to run repeatedly.
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = path.join(root, '.runtime');
const listening = await new Promise((resolve) => {
  const s = net.connect(18787, '127.0.0.1', () => { s.end(); resolve(true); });
  s.on('error', () => resolve(false));
  s.setTimeout(2000, () => { s.destroy(); resolve(false); });
});
if (!listening) {
  const out = fs.openSync(path.join(home, 'bridge.log'), 'a');
  spawn(process.execPath, [path.join(root, 'src', 'server.js')], {
    env: { ...process.env, CODEX_CLAUDE_BRIDGE_HOME: home }, cwd: root,
    detached: true, windowsHide: true, stdio: ['ignore', out, out],
  }).unref();
}
