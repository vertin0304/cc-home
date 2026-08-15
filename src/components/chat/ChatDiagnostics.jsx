import { CHAT_DIAGNOSTIC_STAGES } from '../../lib/chatDiagnostics';

const STAGE_LABELS = {
  authentication: '身份验证',
  main_session: '主会话',
  history: '最近历史',
  gateway: 'Gateway',
  message_save: '消息保存',
};

const STATUS_LABELS = {
  not_started: '未开始',
  success: '成功',
  failure: '失败',
  degraded: '降级',
  skipped: '跳过',
};

function displayValue(value, suffix = '') {
  return value === null || value === undefined ? '未提供' : `${value}${suffix}`;
}

function displayBoolean(value) {
  if (value === true) return '已注入';
  if (value === false) return '未注入';
  return '未提供';
}

export default function ChatDiagnostics({
  diagnostics,
  errorCode,
  errorStage,
  requestId,
}) {
  const gateway = diagnostics?.gateway;
  const usage = diagnostics?.usage;
  const safeErrorStage = errorStage || gateway?.errorStage || null;
  const safeErrorCode = errorCode || gateway?.errorCode || null;

  return (
    <div className="main-chat-diagnostics-panel">
      <dl className="main-chat-diagnostics-grid">
        <div>
          <dt>Request ID</dt>
          <dd className="is-request-id">{displayValue(requestId)}</dd>
        </div>
        <div>
          <dt>总耗时</dt>
          <dd>{displayValue(diagnostics?.totalDurationMs, ' ms')}</dd>
        </div>
        <div>
          <dt>Gateway round</dt>
          <dd>{displayValue(gateway?.round)}</dd>
        </div>
        <div>
          <dt>Recent Context</dt>
          <dd>{displayBoolean(gateway?.recentContextInjected)}</dd>
        </div>
        <div>
          <dt>Recalled</dt>
          <dd>{displayValue(gateway?.recalledCount)}</dd>
        </div>
        <div>
          <dt>Diffused</dt>
          <dd>{displayValue(gateway?.diffusedCount)}</dd>
        </div>
        <div>
          <dt>Injected</dt>
          <dd>{displayValue(gateway?.injectedCount)}</dd>
        </div>
        <div>
          <dt>错误阶段</dt>
          <dd>{displayValue(safeErrorStage)}</dd>
        </div>
        <div>
          <dt>错误代码</dt>
          <dd>{displayValue(safeErrorCode)}</dd>
        </div>
      </dl>

      <div className="main-chat-diagnostic-stages">
        <span>阶段</span>
        <ul>
          {CHAT_DIAGNOSTIC_STAGES.map((name) => {
            const stage = diagnostics?.stages?.[name];
            return (
              <li key={name}>
                <span>{STAGE_LABELS[name]}</span>
                <strong>{STATUS_LABELS[stage?.status] || '未提供'}</strong>
                <small>{displayValue(stage?.durationMs, ' ms')}</small>
              </li>
            );
          })}
        </ul>
      </div>

      <dl className="main-chat-diagnostics-grid is-usage-detail">
        <div><dt>总 token</dt><dd>{displayValue(usage?.totalTokens)}</dd></div>
        <div><dt>Cache hit</dt><dd>{displayValue(usage?.promptCacheHitTokens)}</dd></div>
        <div><dt>Cache miss</dt><dd>{displayValue(usage?.promptCacheMissTokens)}</dd></div>
        <div><dt>Cache read</dt><dd>{displayValue(usage?.cacheReadInputTokens)}</dd></div>
        <div><dt>Cache create</dt><dd>{displayValue(usage?.cacheCreationInputTokens)}</dd></div>
      </dl>
    </div>
  );
}
