import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isKnownModelAlias,
  normalizeModelPreferences,
} from '../src/lib/modelPreferences.js';

test('只接受第一版三个公开模型别名', () => {
  assert.equal(isKnownModelAlias('cc-home-default'), true);
  assert.equal(isKnownModelAlias('cc-home-claude-sonnet'), true);
  assert.equal(isKnownModelAlias('cc-home-claude-opus'), true);
  assert.equal(isKnownModelAlias('anthropic/claude-sonnet-4.6'), false);
  assert.equal(isKnownModelAlias('https://provider.invalid'), false);
});

test('模型偏好响应缺少安全默认值时判为不可用', () => {
  assert.equal(normalizeModelPreferences({ models: [] }), null);
  assert.equal(normalizeModelPreferences({
    models: [{ id: 'cc-home-claude-sonnet' }],
    selected_model: 'cc-home-claude-sonnet',
    default_model: 'cc-home-default',
  }), null);
});
