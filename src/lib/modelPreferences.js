const MODEL_DETAILS = Object.freeze({
  'cc-home-default': Object.freeze({
    label: '默认模型',
    description: '沿用现在熟悉的聊天方式。',
  }),
  'cc-home-claude-sonnet': Object.freeze({
    label: 'Claude Sonnet',
    description: '轻快均衡，适合日常聊天。',
  }),
  'cc-home-claude-opus': Object.freeze({
    label: 'Claude Opus',
    description: '更适合需要耐心展开的复杂话题。',
  }),
});

export function isKnownModelAlias(value) {
  return typeof value === 'string' && Object.hasOwn(MODEL_DETAILS, value);
}

export function normalizeModelPreferences(payload) {
  const seen = new Set();
  const models = (Array.isArray(payload?.models) ? payload.models : [])
    .map((item) => item?.id)
    .filter((id) => {
      if (!isKnownModelAlias(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((id) => ({ id, ...MODEL_DETAILS[id] }));

  const defaultModel = isKnownModelAlias(payload?.default_model)
    && models.some((model) => model.id === payload.default_model)
    ? payload.default_model
    : null;
  const selectedModel = isKnownModelAlias(payload?.selected_model)
    && models.some((model) => model.id === payload.selected_model)
    ? payload.selected_model
    : defaultModel;

  if (!models.length || !defaultModel || !selectedModel) return null;
  return { models, defaultModel, selectedModel };
}
