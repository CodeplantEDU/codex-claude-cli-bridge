#!/usr/bin/env node
// Configure only Codex's selected provider; preserve custom endpoints and restore
// the original standard ChatGPT URL on uninstall. Used by install/uninstall.sh.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export function configureRoute(text, url, remove = false) {
  const lines = text.split('\n');
  const root = lines.slice(0, lines.findIndex(l => /^\s*\[/.test(l)) < 0 ? lines.length : lines.findIndex(l => /^\s*\[/.test(l))).join('\n');
  const selection = root.match(/^\s*model_provider\s*=\s*"([^"\n]+)"/m)?.[1];
  if (!selection && /^\s*model_provider\s*=/m.test(root)) throw new Error('Unsupported provider selection syntax; leave it unchanged.');
  const provider = selection || 'openai';
  const marker = '# codex-claude-bridge';
  if (remove) {
    return lines.map(line => {
      if (!line.includes(marker)) return line;
      const original = line.match(/ original=("(?:[^"\\]|\\.)*")\s*$/)?.[1];
      return original ? JSON.parse(original) : null;
    }).filter(line => line !== null).join('\n');
  }
  if (provider === 'openai') {
    const index = lines.findIndex(l => /^\s*openai_base_url\s*=/.test(l));
    if (index >= 0 && !lines[index].includes(marker)) throw new Error('Codex already uses an unmanaged openai_base_url; leave it unchanged.');
    const line = `openai_base_url = ${JSON.stringify(url)} ${marker}`;
    if (index < 0) lines.unshift(line); else lines[index] = line;
    return lines.join('\n');
  }
  let active = false;
  for (let i = 0; i < lines.length; i++) {
    const header = lines[i].trim();
    if (header.startsWith('[')) active = header === `[model_providers.${provider}]` || header === `[model_providers."${provider}"]`;
    if (!active || !/^\s*base_url\s*=/.test(lines[i])) continue;
    const managed = lines[i].includes(marker);
    const original = lines[i].match(/ original=("(?:[^"\\]|\\.)*")\s*$/)?.[1];
    const current = lines[i].match(/^\s*base_url\s*=\s*"([^"\n]+)"/)?.[1];
    if (!managed && current !== 'https://chatgpt.com/backend-api/codex') throw new Error('Selected provider uses a custom endpoint; leave it unchanged.');
    if (managed && !original) throw new Error('Managed provider route has no restore record.');
    lines[i] = `base_url = ${JSON.stringify(url)} ${marker} original=${original || JSON.stringify(lines[i])}`;
    return lines.join('\n');
  }
  throw new Error('Selected provider has no supported ChatGPT base_url; leave it unchanged.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const [file, url, mode] = process.argv.slice(2);
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const updated = configureRoute(original, url, mode === 'remove');
  if (mode !== 'check' && updated !== original) {
    if (fs.readFileSync(file, 'utf8') !== original) throw new Error('Codex config changed during setup; retry without overwriting it.');
    fs.copyFileSync(file, `${file}.bak-ccb-${Date.now()}`);
    fs.writeFileSync(`${file}.ccb-tmp`, updated, { mode: 0o600 });
    fs.renameSync(`${file}.ccb-tmp`, file);
  }
}
