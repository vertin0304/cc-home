import ChatSettings from './ChatSettings';
import ChatSidebar from './ChatSidebar';

export default function ChatShell({
  children,
  isSettingsOpen,
  isSidebarOpen,
  onClose,
  onCloseSidebar,
  onOpenSettings,
  onSelectMainChat,
  onSignOut,
  onToggleSidebar,
}) {
  return (
    <div className="main-chat-layer" role="presentation">
      <section
        aria-labelledby="main-chat-title"
        aria-modal="true"
        className={`main-chat-panel${isSidebarOpen ? ' is-sidebar-open' : ''}`}
        role="dialog"
      >
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={onCloseSidebar}
          onOpenSettings={onOpenSettings}
          onSelectMainChat={onSelectMainChat}
        />

        <button
          aria-label="关闭历史聊天"
          className={`main-chat-sidebar-scrim${isSidebarOpen ? ' is-open' : ''}`}
          onClick={onCloseSidebar}
          tabIndex={isSidebarOpen ? 0 : -1}
          type="button"
        />

        <div className="main-chat-stage">
          <header className="main-chat-header">
            <div className="main-chat-heading-group">
              <button
                aria-expanded={isSidebarOpen}
                aria-label={isSidebarOpen ? '收起历史聊天' : '展开历史聊天'}
                className="main-chat-menu"
                onClick={onToggleSidebar}
                type="button"
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
              <div>
                <span className="main-chat-eyebrow">Our quiet room</span>
                <h1 id="main-chat-title">一起坐一会儿</h1>
              </div>
            </div>

            <div className="main-chat-actions">
              <button className="main-chat-signout" onClick={onSignOut} type="button">
                登出
              </button>
              <button
                aria-label="关闭聊天并返回客厅"
                className="main-chat-close"
                onClick={onClose}
                type="button"
              >
                <span aria-hidden="true">←</span>
                <span>返回客厅</span>
              </button>
            </div>
          </header>

          <div className="main-chat-view-stack">
            <div
              aria-hidden={isSettingsOpen}
              className={`main-chat-content${isSettingsOpen ? ' is-inactive' : ''}`}
              inert={isSettingsOpen}
            >
              {children}
            </div>
            <ChatSettings isOpen={isSettingsOpen} onBack={onSelectMainChat} />
          </div>
        </div>
      </section>
    </div>
  );
}
