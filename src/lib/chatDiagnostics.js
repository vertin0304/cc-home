export const CHAT_DIAGNOSTIC_STAGES = [
  'authentication',
  'main_session',
  'history',
  'gateway',
  'message_save',
];

const STAGE_STATUSES = new Set([
  'not_started',
  'success',
  'failure',
  'degraded',
  'skipped',
]);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function nonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function hasDiagnosticValue(value) {
  return value !== null && value !== undefined;
}

export function formatDiagnosticDuration(value, preferSeconds = false) {
  if (!hasDiagnosticValue(value)) return '未提供';
  if (preferSeconds && value > 1000) {
    const seconds = value / 1000;
    const precision = seconds >= 10 ? 1 : 2;
    return `${Number(seconds.toFixed(precision))} 秒`;
  }
  return `${value} ms`;
}

export function normalizeRequestId(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

export function normalizeDiagnosticIdentifier(value) {
  return typeof value === 'string' && /^[a-z][a-z0-9_:-]{0,63}$/.test(value)
    ? value
    : null;
}

export function normalizeChatDiagnostics(value) {
  if (!isRecord(value)) return null;

  const rawStages = isRecord(value.stages) ? value.stages : {};
  const stages = Object.fromEntries(CHAT_DIAGNOSTIC_STAGES.map((name) => {
    const stage = isRecord(rawStages[name]) ? rawStages[name] : {};
    return [name, {
      status: STAGE_STATUSES.has(stage.status) ? stage.status : 'not_started',
      durationMs: nonNegativeNumber(stage.duration_ms),
    }];
  }));
  const gateway = isRecord(value.gateway) ? value.gateway : {};
  const usage = isRecord(value.usage) ? value.usage : {};

  return {
    schemaVersion: value.schema_version === 1 ? 1 : null,
    status: value.status === 'error' ? 'error' : 'success',
    totalDurationMs: nonNegativeNumber(value.total_duration_ms),
    stages,
    gateway: {
      round: nonNegativeInteger(gateway.round),
      recentContextInjected: typeof gateway.recent_context_injected === 'boolean'
        ? gateway.recent_context_injected
        : null,
      recalledCount: nonNegativeInteger(gateway.recalled_count),
      diffusedCount: nonNegativeInteger(gateway.diffused_count),
      injectedCount: nonNegativeInteger(gateway.injected_count),
      errorStage: normalizeDiagnosticIdentifier(gateway.error_stage),
      errorCode: normalizeDiagnosticIdentifier(gateway.error_code),
    },
    usage: {
      inputTokens: nonNegativeInteger(usage.input_tokens),
      outputTokens: nonNegativeInteger(usage.output_tokens),
      totalTokens: nonNegativeInteger(usage.total_tokens),
      cachedTokens: nonNegativeInteger(usage.cached_tokens),
      promptCacheHitTokens: nonNegativeInteger(usage.prompt_cache_hit_tokens),
      promptCacheMissTokens: nonNegativeInteger(usage.prompt_cache_miss_tokens),
      cacheReadInputTokens: nonNegativeInteger(usage.cache_read_input_tokens),
      cacheCreationInputTokens: nonNegativeInteger(usage.cache_creation_input_tokens),
    },
  };
}

export function normalizeHistoryMessage(message, index) {
  if (
    !isRecord(message)
    || !['user', 'assistant'].includes(message.role)
    || typeof message.content !== 'string'
  ) {
    return null;
  }

  const createdAt = message.createdAt || message.created_at || null;
  return {
    id: `${createdAt || 'message'}-${message.role}-${index}`,
    role: message.role,
    content: message.content,
    createdAt,
    status: 'complete',
    requestId: message.role === 'assistant'
      ? normalizeRequestId(message.request_id)
      : null,
    diagnostics: message.role === 'assistant'
      ? normalizeChatDiagnostics(message.diagnostics)
      : null,
    errorStage: null,
    errorCode: null,
  };
}
