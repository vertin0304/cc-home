import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatAuthError } from './lib/chatApi';
import './Chat.css';

const shanghaiTime = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function normalizeMessage(message, index) {
  if (
    !message
    || !['user', 'assistant'].includes(message.role)
    || typeof message.content !== 'string'
  ) {
    return null;
  }
  return {
    id: `${message.createdAt || message.created_at || 'message'}-${index}`,
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: typeof message.content === 'string' ? message.content : '',
    createdAt: message.createdAt || message.created_at || null,
  };
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : shanghaiTime.format(date);
}

export default function Chat({
  api,
  isOpen,
  userId,
  onClose,
  onRequireLogin,
  onSignOut,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [historyState, setHistoryState] = useState('idle');
  const [historyError, setHistoryError] = useState('');
  const [sendError, setSendError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messageListRef = useRef(null);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    setHistoryState('loading');
    setHistoryError('');
    try {
      const history = await api.getHistory();
      setMessages(history.map(normalizeMessage).filter(Boolean));
      setHistoryState('ready');
    } catch (error) {
      if (error instanceof ChatAuthError) {
        onRequireLogin();
        return;
      }
      setHistoryState('error');
      setHistoryError('暂时没有取回聊天记录。');
    }
  }, [api, onRequireLogin, userId]);

  useEffect(() => {
    if (!isOpen || !userId || historyState !== 'idle') return undefined;
    const timer = window.setTimeout(loadHistory, 0);
    return () => window.clearTimeout(timer);
  }, [historyState, isOpen, loadHistory, userId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isSending]);

  const send = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isSending || historyState === 'loading') return;

    setIsSending(true);
    setSendError('');
    try {
      const reply = await api.sendMessage(text);
      const createdAt = new Date().toISOString();
      setMessages((current) => [
        ...current,
        {
          id: `user-${createdAt}`,
          role: 'user',
          content: text,
          createdAt,
        },
        {
          id: `assistant-${createdAt}`,
          role: 'assistant',
          content: reply,
          createdAt,
        },
      ]);
      setInput('');
    } catch (error) {
      if (error instanceof ChatAuthError) {
        onRequireLogin();
        return;
      }
      setSendError('这句话暂时没有送达，内容还留在输入框里。');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="main-chat-layer" role="presentation">
      <section
        aria-labelledby="main-chat-title"
        aria-modal="true"
        className="main-chat-panel"
        role="dialog"
      >
        <header className="main-chat-header">
          <div>
            <span className="main-chat-eyebrow">Our quiet room</span>
            <h1 id="main-chat-title">一起坐一会儿</h1>
          </div>
          <div className="main-chat-actions">
            <button className="main-chat-signout" onClick={onSignOut} type="button">
              登出
            </button>
            <button
              aria-label="收起聊天"
              className="main-chat-close"
              onClick={onClose}
              type="button"
            >
              <span aria-hidden="true">←</span>
              <span>返回房间</span>
            </button>
          </div>
        </header>

        <div className="main-chat-messages" ref={messageListRef}>
          {historyState === 'loading' && (
            <div className="main-chat-loading" role="status">
              <span aria-hidden="true" />
              正在把我们的聊天带回来…
            </div>
          )}

          {historyState === 'error' && (
            <div className="main-chat-status" role="alert">
              <p>{historyError}</p>
              <button onClick={loadHistory} type="button">重新读取</button>
            </div>
          )}

          {historyState === 'ready' && messages.length === 0 && (
            <div className="main-chat-empty">
              <span aria-hidden="true">✦</span>
              <p>灯亮着，想说什么都可以。</p>
            </div>
          )}

          {messages.map((message) => (
            <article
              className={`main-chat-message is-${message.role}`}
              key={message.id}
            >
              <div>{message.content}</div>
              {formatTime(message.createdAt) && (
                <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
              )}
            </article>
          ))}

          {isSending && (
            <div className="main-chat-sending" role="status">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <form className="main-chat-composer" onSubmit={send}>
          {sendError && (
            <div className="main-chat-send-error" role="alert">
              <span>{sendError}</span>
              <button disabled={isSending} onClick={send} type="button">重试</button>
            </div>
          )}
          <div className="main-chat-compose-row">
            <textarea
              aria-label="输入消息"
              disabled={isSending || historyState === 'loading'}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="说点什么…"
              rows="2"
              value={input}
            />
            <button
              disabled={!input.trim() || isSending || historyState === 'loading'}
              type="submit"
            >
              {isSending ? '发送中' : '发送'}
            </button>
          </div>
          <p>聊天保存在我们的家里，不保存在这台设备的浏览器存储中。</p>
        </form>
      </section>
    </div>
  );
}
