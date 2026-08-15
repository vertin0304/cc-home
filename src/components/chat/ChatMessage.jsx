import ReactMarkdown from 'react-markdown';
import ChatDiagnostics from './ChatDiagnostics';

const localTime = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : localTime.format(date);
}

function displayToken(value) {
  return value === null || value === undefined ? '未提供' : value;
}

export default function ChatMessage({ message }) {
  const time = formatTime(message.createdAt);
  const usage = message.diagnostics?.usage;

  if (message.role === 'user') {
    return (
      <article className="main-chat-message is-user">
        <div className="main-chat-user-bubble">{message.content}</div>
        {time && <time dateTime={message.createdAt}>{time}</time>}
      </article>
    );
  }

  return (
    <article className={`main-chat-message is-assistant is-${message.status}`}>
      {message.status === 'pending' ? (
        <div className="main-chat-waiting" role="status">
          <span aria-hidden="true" />
          <span>正在回复</span>
        </div>
      ) : (
        <div
          className={`main-chat-assistant-body${message.status === 'error' ? ' is-error' : ''}`}
          role={message.status === 'error' ? 'alert' : undefined}
        >
          {message.status === 'error' ? message.content : (
            <ReactMarkdown skipHtml>{message.content}</ReactMarkdown>
          )}
        </div>
      )}

      {message.status !== 'pending' && (
        <footer className="main-chat-message-meta">
          <div className="main-chat-message-summary">
            {time && <time dateTime={message.createdAt}>{time}</time>}
            <span>输入 {displayToken(usage?.inputTokens)}</span>
            <span>Cache {displayToken(usage?.cachedTokens)}</span>
            <span>输出 {displayToken(usage?.outputTokens)}</span>
          </div>
          <details className="main-chat-diagnostics">
            <summary>详情</summary>
            <ChatDiagnostics
              diagnostics={message.diagnostics}
              errorCode={message.errorCode}
              errorStage={message.errorStage}
              requestId={message.requestId}
            />
          </details>
        </footer>
      )}
    </article>
  );
}
