import { useEffect, useRef } from 'react';
import ChatIcon from './ChatIcon';

export default function ChatComposer({
  value,
  isTyping,
  onChange,
  onSend,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div className="composer-area">
      <div className="composer-shell">
        <textarea
          ref={inputRef}
          rows="1"
          placeholder="输入消息…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />

        <div className="composer-footer">
          <span className="composer-hint">Enter 发送 · Shift + Enter 换行</span>
          <button
            className="send-button"
            onClick={onSend}
            disabled={!value.trim() || isTyping}
            aria-label="发送消息"
          >
            <ChatIcon name="send" size={17} />
          </button>
        </div>
      </div>
      <p className="composer-note">AI 可能会出错，请核对重要信息。</p>
    </div>
  );
}
