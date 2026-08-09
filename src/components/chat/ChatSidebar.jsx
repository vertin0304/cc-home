export default function ChatSidebar({
  isOpen,
  onClose,
  onOpenSettings,
  onSelectMainChat,
}) {
  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="聊天侧边栏"
      className="main-chat-sidebar"
      inert={!isOpen}
    >
      <div className="main-chat-sidebar-heading">
        <div>
          <span>Conversations</span>
          <h2>历史聊天</h2>
        </div>
        <button
          aria-label="收起历史聊天"
          className="main-chat-sidebar-close"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
      </div>

      <nav aria-label="聊天列表" className="main-chat-sidebar-list">
        <button
          aria-current="page"
          className="main-chat-conversation is-current"
          onClick={onSelectMainChat}
          type="button"
        >
          <span className="main-chat-conversation-mark" aria-hidden="true" />
          <span>
            <strong>主聊天</strong>
            <small>当前聊天</small>
          </span>
        </button>
      </nav>

      <button
        className="main-chat-settings-entry"
        onClick={onOpenSettings}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z" />
          <path d="M19 13.6a7.7 7.7 0 0 0 0-3.2l2-1.5-2-3.4-2.4 1a8.2 8.2 0 0 0-2.8-1.6L13.5 2h-4l-.4 2.9a8.2 8.2 0 0 0-2.8 1.6l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3.2l-2 1.5 2 3.4 2.4-1a8.2 8.2 0 0 0 2.8 1.6l.4 2.9h4l.4-2.9a8.2 8.2 0 0 0 2.8-1.6l2.4 1 2-3.4-2.1-1.5Z" />
        </svg>
        <span>设置</span>
      </button>
    </aside>
  );
}
