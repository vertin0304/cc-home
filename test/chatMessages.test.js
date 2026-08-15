import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendPendingTurn,
  failAssistantMessage,
  settleAssistantMessage,
} from '../src/lib/chatMessages.js';

const turn = {
  assistantId: 'assistant-1',
  createdAt: '2026-08-15T12:00:00.000Z',
  text: 'hello',
  userId: 'user-1',
};

test('发送时立即追加用户消息和一个等待占位', () => {
  const messages = appendPendingTurn([], turn);
  assert.deepEqual(messages.map(({ role, status, content }) => ({ role, status, content })), [
    { role: 'user', status: 'complete', content: 'hello' },
    { role: 'assistant', status: 'pending', content: '' },
  ]);
});

test('成功回复原位替换等待占位且不重复用户消息', () => {
  const pending = appendPendingTurn([], turn);
  const messages = settleAssistantMessage(pending, turn.assistantId, {
    reply: 'reply',
    requestId: null,
    diagnostics: null,
  }, '2026-08-15T12:00:01.000Z');

  assert.equal(messages.length, 2);
  assert.equal(messages[0].content, 'hello');
  assert.equal(messages[1].content, 'reply');
  assert.equal(messages[1].status, 'complete');
});

test('失败回复原位替换为安全错误及白名单诊断标识', () => {
  const pending = appendPendingTurn([], turn);
  const messages = failAssistantMessage(pending, turn.assistantId, {
    message: '暂时没能送达，请稍后重试。',
    requestId: '55555555-5555-4555-8555-555555555555',
    errorStage: 'gateway',
    errorCode: 'timeout',
  }, '2026-08-15T12:00:01.000Z');

  assert.equal(messages.length, 2);
  assert.equal(messages[1].status, 'error');
  assert.equal(messages[1].errorStage, 'gateway');
  assert.equal(messages[1].errorCode, 'timeout');
});
