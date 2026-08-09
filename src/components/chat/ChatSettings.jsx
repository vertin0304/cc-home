export default function ChatSettings({ isOpen, onBack }) {
  return (
    <section
      aria-hidden={!isOpen}
      aria-labelledby="chat-settings-title"
      className={`main-chat-settings${isOpen ? ' is-open' : ''}`}
      inert={!isOpen}
    >
      <header className="main-chat-settings-header">
        <button onClick={onBack} type="button">
          <span aria-hidden="true">←</span>
          <span>返回聊天</span>
        </button>
        <div>
          <span>Preferences</span>
          <h2 id="chat-settings-title">设置</h2>
        </div>
      </header>

      <div className="main-chat-settings-placeholder">
        <span aria-hidden="true">✦</span>
        <h3>这里会慢慢布置好。</h3>
        <p>模型与更多设置将在后续接入。</p>
      </div>
    </section>
  );
}
