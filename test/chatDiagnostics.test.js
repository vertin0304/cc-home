import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeChatDiagnostics,
  normalizeHistoryMessage,
} from '../src/lib/chatDiagnostics.js';

test('历史 assistant 消息保留安全诊断且不保留内部正文', () => {
  const message = normalizeHistoryMessage({
    role: 'assistant',
    content: 'hello',
    created_at: '2026-08-15T12:00:00.000Z',
    request_id: '44444444-4444-4444-8444-444444444444',
    diagnostics: {
      schema_version: 1,
      status: 'success',
      total_duration_ms: 12,
      stages: {
        authentication: { status: 'success', duration_ms: 0 },
      },
      gateway: {
        round: 1,
        recent_context_injected: true,
        recalled_count: 2,
        diffused_count: 1,
        injected_count: 3,
        memory_text: 'hidden memory',
      },
      usage: { input_tokens: 10, output_tokens: 4, cached_tokens: null },
      prompt: 'hidden prompt',
    },
  }, 0);

  assert.equal(message.requestId, '44444444-4444-4444-8444-444444444444');
  assert.equal(message.diagnostics.stages.authentication.durationMs, 0);
  assert.equal(message.diagnostics.usage.cachedTokens, null);
  assert.equal(JSON.stringify(message).includes('hidden'), false);
});

test('无效诊断值归一化为 null，不把 null 与 0 混淆', () => {
  const diagnostics = normalizeChatDiagnostics({
    total_duration_ms: -1,
    gateway: { round: -1, recalled_count: 0 },
    usage: { input_tokens: 0, output_tokens: '0', cached_tokens: null },
  });

  assert.equal(diagnostics.totalDurationMs, null);
  assert.equal(diagnostics.gateway.round, null);
  assert.equal(diagnostics.gateway.recalledCount, 0);
  assert.equal(diagnostics.usage.inputTokens, 0);
  assert.equal(diagnostics.usage.outputTokens, null);
  assert.equal(diagnostics.usage.cachedTokens, null);
});
