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
  const reply = await harness.api.sendMessage('hello');

  assert.equal(reply, 'reply');
  assert.deepEqual(JSON.parse(harness.requests[0].options.body), { message: 'hello' });
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
