import fs from 'node:fs';

const EFFORT_LEVELS = [
  { effort: 'low', description: 'Fastest; light thinking' },
  { effort: 'medium', description: 'Balanced speed and depth' },
  { effort: 'high', description: 'Deeper thinking for harder tasks' },
  { effort: 'xhigh', description: 'Extra-deep thinking' },
  { effort: 'max', description: 'Maximum thinking budget' },
];

// Minimal entry used only if the GPT catalog can't be fetched to clone from.
const FALLBACK_TEMPLATE = {
  shell_type: 'shell_command',
  visibility: 'list',
  supported_in_api: true,
  priority: 100,
  availability_nux: null,
  upgrade: null,
  base_instructions: '',
  supports_reasoning_summaries: true,
  support_verbosity: false,
  default_verbosity: null,
  apply_patch_tool_type: 'freeform',
  truncation_policy: { mode: 'tokens', limit: 10000 },
  supports_parallel_tool_calls: true,
  experimental_supported_tools: [],
};

export function claudeEntries(config, state, template, maxPriority = 0) {
  const base = template || FALLBACK_TEMPLATE;
  return config.models.map((m, i) => {
    const entry = structuredClone(base);
    const contextWindow = state.contextWindow(m.slug) || m.contextWindow || config.defaultContextWindow;
    Object.assign(entry, {
      slug: m.slug,
      display_name: m.displayName,
      description: m.description,
      default_reasoning_level: m.defaultEffort || 'high',
      supported_reasoning_levels: EFFORT_LEVELS,
      visibility: m.hidden ? 'hide' : 'list', // Retired versions still route existing chats without keeping an old button in the picker or bar.
      supported_in_api: true,
      priority: (m.priority ?? maxPriority + 1 + i),
      upgrade: null,
      availability_nux: null,
      additional_speed_tiers: [],
      service_tiers: [],
      context_window: contextWindow,
      max_context_window: contextWindow,
      input_modalities: ['text', 'image'],
      supports_reasoning_effort_updates: false,
      // Classic request shape (tools in `tools`, prompt in `instructions`), not responses-lite.
      use_responses_lite: false,
    });
    for (const k of ['default_service_tier', 'available_access_programs', 'auto_compact_token_limit', 'guardian']) {
      delete entry[k];
    }
    return entry;
  });
}

export function pickTemplate(models) {
  if (!Array.isArray(models) || !models.length) return null;
  const listed = models.filter((m) => m.visibility === 'list');
  const pool = listed.length ? listed : models;
  return pool.slice().sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0];
}

/** Reads a user-edited order file: one model slug per line, '#' starts a comment. */
export function readModelOrder(file) {
  if (!file) return [];
  try {
    return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function mergeCatalog(config, state, upstreamModels, order = readModelOrder(config.modelOrderFile)) {
  const hiddenModels = new Set(config.hiddenModels || []);
  const gpt = (upstreamModels || [])
    .filter((m) => !config.models.some((c) => c.slug === m.slug))
    .map((m) => hiddenModels.has(m.slug) ? { ...m, visibility: 'hide' } : m);
  const maxPriority = Math.max(0, ...gpt.map((m) => m.priority ?? 0));
  const merged = [...gpt, ...claudeEntries(config, state, pickTemplate(gpt), maxPriority)];
  // Listed models go first in the file's order; unlisted ones keep their place after them.
  for (const m of merged) {
    const i = order.indexOf(m.slug);
    if (i >= 0) m.priority = -10000 + i;
  }
  return merged;
}

export function fallbackGptModel(config, state) {
  if (config.fallbackModel) return config.fallbackModel;
  const t = pickTemplate(state.upstreamModels() || []);
  return t?.slug || 'gpt-5.5';
}
