import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatAuthError, ChatRequestError, createChatApi } from '../src/lib/chatApi.js';

function jsonResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    async json() {
      return body;
    },
  };
}

function createHarness(overrides = {}) {
  let session = { access_token: 'browser-user-token' };
  let signOutCalls = 0;
  const requests = [];
  const responses = [...(overrides.responses || [])];
  const api = createChatApi({
    baseUrl: 'https://api.example.invalid/',
    getSession: async () => session,
    refreshSession: async () => {
      if (overrides.refreshThrows) throw new Error('hidden refresh detail');
      session = overrides.refreshedSession ?? { access_token: 'refreshed-user-token' };
      return session;
    },
    signOut: async () => {
      signOutCalls += 1;
      session = null;
    },
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return responses.shift() || jsonResponse(200, { messages: [] });
    },
  });

  return { api, requests, signOutCalls: () => signOutCalls };
}

test('history 使用用户 Bearer token 且不携带 sessionId', async () => {
  const harness = createHarness({
    responses: [jsonResponse(200, { messages: [{ role: 'user', content: 'hello' }] })],
  });
  const messages = await harness.api.getHistory();

  assert.equal(messages.length, 1);
  assert.equal(harness.requests[0].url, 'https://api.example.invalid/chat/history');
  assert.equal(harness.requests[0].options.method, 'GET');
  assert.equal(
    harness.requests[0].options.headers.Authorization,
    'Bearer browser-user-token',
  );
  assert.equal(harness.requests[0].url.includes('sessionId'), false);
});

test('sendMessage 只发送 message 字段', async () => {
  const harness = createHarness({
    responses: [jsonResponse(200, { reply: 'reply' })],
  });
  const result = await harness.api.sendMessage('hello');

  assert.deepEqual(result, {
    reply: 'reply',
    requestId: null,
    diagnostics: null,
  });
  assert.deepEqual(JSON.parse(harness.requests[0].options.body), { message: 'hello' });
});

test('sendMessage 只保留白名单诊断并保留 0', async () => {
  const requestId = '22222222-2222-4222-8222-222222222222';
  const harness = createHarness({
    responses: [jsonResponse(200, {
      reply: '**reply**',
      request_id: requestId,
      diagnostics: {
        schema_version: 1,
        status: 'success',
        total_duration_ms: 0,
        stages: {
          gateway: { status: 'success', duration_ms: 0, prompt: 'hidden' },
        },
        gateway: {
          round: 0,
          recent_context_injected: false,
          recalled_count: 0,
          diffused_count: 0,
          injected_count: 0,
        },
        usage: {
          input_tokens: 0,
          cached_tokens: 0,
          output_tokens: 0,
          provider_detail: 'hidden',
        },
        prompt: 'hidden',
      },
    })],
  });

  const result = await harness.api.sendMessage('hello');
  assert.equal(result.requestId, requestId);
  assert.equal(result.diagnostics.totalDurationMs, 0);
  assert.equal(result.diagnostics.stages.gateway.durationMs, 0);
  assert.equal(result.diagnostics.gateway.round, 0);
  assert.equal(result.diagnostics.gateway.recentContextInjected, false);
  assert.equal(result.diagnostics.usage.inputTokens, 0);
  assert.equal(result.diagnostics.usage.cachedTokens, 0);
  assert.equal(result.diagnostics.usage.outputTokens, 0);
  assert.equal(JSON.stringify(result).includes('hidden'), false);
});

test('401 只刷新并重试一次', async () => {
  const harness = createHarness({
    responses: [
      jsonResponse(401, { error: 'hidden' }),
      jsonResponse(200, { messages: [] }),
    ],
  });
  await harness.api.getHistory();

  assert.equal(harness.requests.length, 2);
  assert.equal(
    harness.requests[1].options.headers.Authorization,
    'Bearer refreshed-user-token',
  );
  assert.equal(harness.signOutCalls(), 0);
});

test('刷新后仍为 401 时登出且不无限重试', async () => {
  const harness = createHarness({
    responses: [jsonResponse(401, {}), jsonResponse(401, {})],
  });

  await assert.rejects(() => harness.api.getHistory(), ChatAuthError);
  assert.equal(harness.requests.length, 2);
  assert.equal(harness.signOutCalls(), 1);
});

test('刷新失败时安全登出', async () => {
  const harness = createHarness({
    responses: [jsonResponse(401, {})],
    refreshThrows: true,
  });

  await assert.rejects(() => harness.api.getHistory(), ChatAuthError);
  assert.equal(harness.requests.length, 1);
  assert.equal(harness.signOutCalls(), 1);
});

test('网络和服务端错误只返回安全的前端错误', async () => {
  const harness = createHarness({ responses: [jsonResponse(503, { detail: 'hidden' })] });
  await assert.rejects(
    () => harness.api.sendMessage('private text'),
    (error) => error instanceof ChatRequestError && !error.message.includes('hidden'),
  );
});

test('错误响应只暴露安全 request_id、阶段和代码', async () => {
  const requestId = '33333333-3333-4333-8333-333333333333';
  const harness = createHarness({
    responses: [jsonResponse(502, {
      request_id: requestId,
      error_stage: 'gateway',
      error_code: 'upstream_timeout',
      detail: 'private upstream detail',
    })],
  });

  await assert.rejects(
    () => harness.api.sendMessage('private text'),
    (error) => (
      error instanceof ChatRequestError
      && error.requestId === requestId
      && error.errorStage === 'gateway'
      && error.errorCode === 'upstream_timeout'
      && !error.message.includes('private upstream detail')
    ),
  );
});
