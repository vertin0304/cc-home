import ChatIcon from './ChatIcon';

function getPreview(messages) {
  if (!messages?.length) return '还没有消息';

  const lastMessage = messages[messages.length - 1].content;
  const cleanText = lastMessage
    .replace(/\.{3,}/g, '…')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText.length > 24 ? `${cleanText.slice(0, 24)}…` : cleanText;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  isOpen,
  onClose,
  onNewChat,
  onOpenConversation,
  onOpenSettings,
}) {
  return (
    <>
      <button
        className={`sidebar-mask ${isOpen ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-label="关闭侧边栏"
      />

      <aside className={`conversation-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="workspace-brand">
          <span className="brand-mark" aria-hidden="true">C</span>
          <div>
            <strong>CC Home</strong>
            <span>Private AI Workspace</span>
          </div>
        </div>

        <button className="new-chat-button" onClick={onNewChat}>
          <ChatIcon name="plus" size={17} />
          <span>新建对话</span>
        </button>

        <div className="conversation-section">
          <div className="section-label">最近对话</div>
          <nav className="conversation-list" aria-label="最近对话">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`conversation-item ${
                  conversation.id === activeId ? 'is-active' : ''
                }`}
                onClick={() => onOpenConversation(conversation.id)}
              >
                <span className="conversation-title">{conversation.title}</span>
                <span className="conversation-preview">
                  {getPreview(conversation.messages)}
                </span>
                <span className="conversation-time">{conversation.time}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-settings" onClick={onOpenSettings}>
            <ChatIcon name="settings" size={17} />
            <span>设置</span>
          </button>
        </div>
      </aside>
    </>
  );
}
