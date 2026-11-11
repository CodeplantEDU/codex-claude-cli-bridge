// Adds newly published Claude models to the bridge picker after a real CLI check.
// Source: Anthropic's public model overview page. Usage: node scripts/update-models.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = process.env.CODEX_CLAUDE_BRIDGE_HOME || path.join(root, '.runtime');
const configPath = path.join(home, 'config.json');
const SOURCE = 'https://platform.claude.com/docs/en/about-claude/models/overview.md';
const dryRun = process.argv.includes('--dry-run');
const log = (msg) => console.log(`${new Date().toISOString()} [models] ${msg}`);

export function displayName(id) {
  const m = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?$/.exec(id);
  if (!m) return null;
  return `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}${m[3] ? '.' + m[3] : ''}`;
}

function probe(claudePath, id) {
  return new Promise((resolve) => {
    execFile(claudePath, ['-p', '--model', id, '--tools', '', '--output-format', 'json', 'Reply with exactly OK.'],
      { timeout: 120000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }, (err, stdout) => {
        if (err) return resolve(false);
        try { const r = JSON.parse(stdout); resolve(!r.is_error && /OK/.test(String(r.result))); } catch { resolve(false); }
      }).stdin?.end();
  });
}

async function main() {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const models = config.models || JSON.parse(fs.readFileSync(path.join(root, 'src', 'models.json'), 'utf8'));
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`model page returned ${res.status}`);
  const ids = [...new Set((await res.text()).match(/claude-[a-z]+-\d+(?:-\d{1,2})?(?![\w-])/g) || [])];
  const known = new Set(models.map((m) => m.claudeModel));
  const fresh = ids.filter((id) => !known.has(id) && displayName(id));
  log(`published: ${ids.join(', ') || 'none'}; new: ${fresh.join(', ') || 'none'}`);
  const added = [];
  for (const id of fresh) {
    if (!(await probe(config.claudePath || 'claude', id))) { log(`skipped ${id}: Claude CLI check failed`); continue; }
    added.push({ slug: id, displayName: displayName(id), claudeModel: id, description: `Claude ${displayName(id)}, running through your Claude Code CLI.` });
  }
  if (!added.length || dryRun) return log(dryRun ? `dry run; would add ${added.map((m) => m.slug).join(', ') || 'nothing'}` : 'no change');
  fs.copyFileSync(configPath, `${configPath}.bak`);
  const next = { ...config, models: [...models, ...added] };
  fs.writeFileSync(`${configPath}.tmp`, JSON.stringify(next, null, 2));
  fs.renameSync(`${configPath}.tmp`, configPath);
  if (config.modelOrderFile && fs.existsSync(config.modelOrderFile)) { // New models appear in the user's order file so they can be moved.
    const text = fs.readFileSync(config.modelOrderFile, 'utf8');
    fs.writeFileSync(config.modelOrderFile, text.replace(/\s*$/, '\r\n') + added.map((m) => m.slug).join('\r\n') + '\r\n');
  }
  log(`added ${added.map((m) => m.slug).join(', ')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { log(`failed: ${e.message}`); process.exitCode = 1; });
}
