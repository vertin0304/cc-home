import {
  normalizeChatDiagnostics,
  normalizeDiagnosticIdentifier,
  normalizeRequestId,
} from './chatDiagnostics.js';
import {
  isKnownModelAlias,
  normalizeModelPreferences,
} from './modelPreferences.js';

export class ChatAuthError extends Error {
  constructor() {
    super('登录状态已失效，请重新登录。');
    this.name = 'ChatAuthError';
  }
}

export class ChatRequestError extends Error {
  constructor(message = '暂时没能送达，请稍后重试。', details = {}) {
    super(message);
    this.name = 'ChatRequestError';
    this.requestId = normalizeRequestId(details.requestId);
    this.errorStage = normalizeDiagnosticIdentifier(details.errorStage);
    this.errorCode = normalizeDiagnosticIdentifier(details.errorCode);
  }
}

function trimBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createChatApi({
  baseUrl,
  getSession,
  refreshSession,
  signOut,
  fetchImpl = fetch,
}) {
  const apiBaseUrl = trimBaseUrl(baseUrl);

  async function authorizedRequest(path, options = {}, mayRefresh = true) {
    const session = await getSession();
    const accessToken = session?.access_token;
    if (!accessToken) throw new ChatAuthError();
    if (!apiBaseUrl) throw new ChatRequestError('聊天服务尚未配置。');

    let response;
    try {
      response = await fetchImpl(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...(options.headers || {}),
        },
      });
    } catch {
      throw new ChatRequestError();
    }

    if (response.status === 401) {
      if (mayRefresh) {
        let refreshedSession;
        try {
          refreshedSession = await refreshSession();
        } catch {
          // 统一按刷新失败处理，不向界面暴露 SDK 错误。
        }
        if (refreshedSession?.access_token) {
          return authorizedRequest(path, options, false);
        }
      }
      try {
        await signOut();
      } catch {
        // 本地状态仍由调用方清理，不向界面泄露 SDK 错误。
      }
      throw new ChatAuthError();
    }

    const data = await safeJson(response);
    if (!response.ok) {
      throw new ChatRequestError(undefined, {
        requestId: data?.request_id,
        errorStage: data?.error_stage,
        errorCode: data?.error_code,
      });
    }
    return data;
  }

  return {
    async getModelPreferences() {
      const data = await authorizedRequest('/chat/models', { method: 'GET' });
      const preferences = normalizeModelPreferences(data);
      if (!preferences) throw new ChatRequestError('模型设置暂时不可用。');
      return preferences;
    },

    async setModelPreference(model) {
      if (!isKnownModelAlias(model)) {
        throw new ChatRequestError('这个模型选项暂时不可用。');
      }
      const data = await authorizedRequest('/chat/preferences/model', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      if (data?.selected_model !== model) {
        throw new ChatRequestError('模型设置暂时不可用。');
      }
      return model;
    },

    async getHistory() {
      const data = await authorizedRequest('/chat/history', { method: 'GET' });
      return Array.isArray(data?.messages) ? data.messages : [];
    },

    async sendMessage(message) {
      const data = await authorizedRequest('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (typeof data?.reply !== 'string' || !data.reply.trim()) {
        throw new ChatRequestError();
      }
      return {
        reply: data.reply,
        requestId: normalizeRequestId(data.request_id),
        diagnostics: normalizeChatDiagnostics(data.diagnostics),
      };
    },
  };
}
