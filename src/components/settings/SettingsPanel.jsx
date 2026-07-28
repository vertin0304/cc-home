import ChatIcon from '../chat/ChatIcon';

export default function SettingsPanel({
  isOpen,
  theme,
  config,
  availableModels,
  isLoading,
  onClose,
  onThemeChange,
  onConfigChange,
  onLoadModels,
  onSave,
}) {
  return (
    <div
      className={`settings-overlay ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="settings-panel" aria-label="设置">
        <header className="settings-header">
          <div>
            <span className="panel-eyebrow">Workspace</span>
            <h2>设置</h2>
          </div>
          <button className="panel-close" onClick={onClose} aria-label="关闭设置">
            <ChatIcon name="close" />
          </button>
        </header>

        <div className="settings-section">
          <div className="settings-section-title">
            <h3>AI 模型配置</h3>
            <p>连接兼容的后端服务。</p>
          </div>

          <label className="field">
            <span>Base URL</span>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(event) => onConfigChange('baseUrl', event.target.value)}
              placeholder="https://api.example.com/v1"
            />
          </label>

          <label className="field">
            <span>API Key</span>
            <input
              type="password"
              value={config.apiKey}
              onChange={(event) => onConfigChange('apiKey', event.target.value)}
              placeholder="sk-..."
            />
          </label>

          <button
            className="secondary-button"
            onClick={onLoadModels}
            disabled={isLoading}
          >
            {isLoading ? '正在加载…' : '加载模型列表'}
          </button>

          <label className="field">
            <span>选择模型</span>
            <select
              value={config.model}
              onChange={(event) => onConfigChange('model', event.target.value)}
            >
              {availableModels.length === 0 && (
                <option value="">请先加载模型列表</option>
              )}
              {availableModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>管理员 Token</span>
            <input
              type="password"
              value={config.adminToken}
              onChange={(event) =>
                onConfigChange('adminToken', event.target.value)
              }
              placeholder="输入管理员 Token"
            />
          </label>

          <button className="primary-button" onClick={onSave}>
            保存配置
          </button>
        </div>

        <div className="settings-section appearance-section">
          <div className="settings-section-title">
            <h3>外观</h3>
            <p>选择适合当前环境的界面主题。</p>
          </div>
          <div className="theme-switch" aria-label="界面主题">
            <button
              className={theme === 'light' ? 'is-active' : ''}
              onClick={() => onThemeChange('light')}
            >
              浅色
            </button>
            <button
              className={theme === 'dark' ? 'is-active' : ''}
              onClick={() => onThemeChange('dark')}
            >
              深色
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
