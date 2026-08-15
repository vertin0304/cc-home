import {
  CHAT_DIAGNOSTIC_STAGES,
  formatDiagnosticDuration,
  hasDiagnosticValue,
} from '../../lib/chatDiagnostics';

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
  const gatewayFields = [
    ['Gateway round', gateway?.round],
    ['Recent Context', gateway?.recentContextInjected, displayBoolean],
    ['Recalled', gateway?.recalledCount],
    ['Diffused', gateway?.diffusedCount],
    ['Injected', gateway?.injectedCount],
  ];
  const hasGatewayFields = gatewayFields.some(([, value]) => hasDiagnosticValue(value));
  const cacheFields = [
    ['Cache hit', usage?.promptCacheHitTokens],
    ['Cache miss', usage?.promptCacheMissTokens],
    ['Cache read', usage?.cacheReadInputTokens],
    ['Cache create', usage?.cacheCreationInputTokens],
  ];
  const hasCacheBreakdown = cacheFields.some(([, value]) => hasDiagnosticValue(value));
  const visibleStages = diagnostics
    ? CHAT_DIAGNOSTIC_STAGES.filter((name) => {
      const stage = diagnostics.stages?.[name];
      return stage && (stage.status !== 'not_started' || hasDiagnosticValue(stage.durationMs));
    })
    : [];

  return (
    <div className="main-chat-diagnostics-panel">
      <dl className="main-chat-diagnostics-grid">
        {hasDiagnosticValue(requestId) && (
          <div>
            <dt>Request ID</dt>
            <dd className="is-request-id">{requestId}</dd>
          </div>
        )}
        {hasDiagnosticValue(diagnostics?.totalDurationMs) && (
          <div>
            <dt>总耗时</dt>
            <dd>{formatDiagnosticDuration(diagnostics.totalDurationMs, true)}</dd>
          </div>
        )}
        {gatewayFields.map(([label, value, formatter]) => hasDiagnosticValue(value) && (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{formatter ? formatter(value) : value}</dd>
          </div>
        ))}
        {hasDiagnosticValue(safeErrorStage) && (
          <div><dt>错误阶段</dt><dd>{safeErrorStage}</dd></div>
        )}
        {hasDiagnosticValue(safeErrorCode) && (
          <div><dt>错误代码</dt><dd>{safeErrorCode}</dd></div>
        )}
      </dl>

      {!hasGatewayFields && (
        <p className="main-chat-diagnostics-note">该消息生成于诊断接入前</p>
      )}

      {visibleStages.length > 0 && (
        <div className="main-chat-diagnostic-stages">
          <span>阶段</span>
          <ul>
            {visibleStages.map((name) => {
              const stage = diagnostics.stages[name];
              return (
                <li key={name}>
                  <span>{STAGE_LABELS[name]}</span>
                  <strong>{STATUS_LABELS[stage.status] || '未提供'}</strong>
                  <small>{formatDiagnosticDuration(stage.durationMs, name === 'gateway')}</small>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(hasDiagnosticValue(usage?.totalTokens) || hasCacheBreakdown) && (
        <dl className="main-chat-diagnostics-grid is-usage-detail">
          {hasDiagnosticValue(usage?.totalTokens) && (
            <div><dt>总 token</dt><dd>{usage.totalTokens}</dd></div>
          )}
          {cacheFields.map(([label, value]) => hasDiagnosticValue(value) && (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      )}
      {!hasCacheBreakdown && (
        <p className="main-chat-diagnostics-note is-cache">厂商未提供缓存细分</p>
      )}
    </div>
  );
}
