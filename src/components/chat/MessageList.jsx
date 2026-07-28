export default function MessageList({
  conversation,
  isTyping,
  messageAreaRef,
}) {
  const messages = conversation?.messages || [];

  return (
    <div className="message-area" ref={messageAreaRef}>
      <div className="message-column">
        {messages.length === 0 && !isTyping ? (
          <div className="empty-chat">
            <span className="empty-chat-mark" aria-hidden="true">C</span>
            <h2>开始一段新的对话</h2>
            <p>这里是你安静、私人的 AI 工作空间。</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`message-row ${message.role}`}
            >
              <div className="message-meta">
                {message.role === 'user' ? '你' : 'AI'}
              </div>
              <div className="message-bubble">{message.content}</div>
            </article>
          ))
        )}

        {isTyping && (
          <article className="message-row ai">
            <div className="message-meta">AI</div>
            <div className="message-bubble typing-indicator" aria-label="AI 正在回复">
              <span />
              <span />
              <span />
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
