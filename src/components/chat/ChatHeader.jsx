import ChatIcon from './ChatIcon';

export default function ChatHeader({
  title,
  onOpenSidebar,
  onOpenSettings,
}) {
  return (
    <header className="chat-header">
      <button
        className="header-icon-button mobile-menu-button"
        onClick={onOpenSidebar}
        aria-label="打开侧边栏"
      >
        <ChatIcon name="menu" />
      </button>

      <div className="chat-heading">
        <span className="chat-eyebrow">私人 AI 工作空间</span>
        <h1>{title || '新对话'}</h1>
      </div>

      <div className="header-status">
        <span className="status-dot" aria-hidden="true" />
        <span>就绪</span>
      </div>

      <button
        className="header-icon-button mobile-settings-button"
        onClick={onOpenSettings}
        aria-label="打开设置"
      >
        <ChatIcon name="settings" />
      </button>
    </header>
  );
}
