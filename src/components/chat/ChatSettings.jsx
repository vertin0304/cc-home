import { useCallback, useEffect, useState } from 'react';
import { ChatAuthError } from '../../lib/chatApi';

export default function ChatSettings({ api, isOpen, onBack, onRequireLogin, userId }) {
  const [loadState, setLoadState] = useState('idle');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [savingModel, setSavingModel] = useState('');
  const [notice, setNotice] = useState('');

  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    setLoadState('loading');
    setNotice('');
    try {
      const preferences = await api.getModelPreferences();
      setModels(preferences.models);
      setSelectedModel(preferences.selectedModel);
      setLoadState('ready');
    } catch (error) {
      if (error instanceof ChatAuthError) {
        onRequireLogin();
        return;
      }
      setLoadState('error');
      setNotice('暂时没能取回模型设置。');
    }
  }, [api, onRequireLogin, userId]);

  useEffect(() => {
    if (!isOpen || !userId || loadState !== 'idle') return undefined;
    const timer = window.setTimeout(loadPreferences, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, loadPreferences, loadState, userId]);

  const chooseModel = async (model) => {
    if (model === selectedModel || savingModel) return;
    setSavingModel(model);
    setNotice('');
    try {
      await api.setModelPreference(model);
      setSelectedModel(model);
      setNotice('已经为之后的聊天换好了。');
    } catch (error) {
      if (error instanceof ChatAuthError) {
        onRequireLogin();
        return;
      }
      setNotice('这次没有保存成功，请稍后再试。');
    } finally {
      setSavingModel('');
    }
  };

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

      <div className="main-chat-settings-body">
        <div className="main-chat-settings-intro">
          <span aria-hidden="true">✦</span>
          <div>
            <h3>聊天模型</h3>
            <p>选择会跟着账号保存，在不同设备上也保持一致。</p>
          </div>
        </div>

        {loadState === 'loading' && (
          <div className="main-chat-settings-status" role="status">
            <span aria-hidden="true" />
            正在看看现在的选择…
          </div>
        )}

        {loadState === 'error' && (
          <div className="main-chat-settings-error" role="alert">
            <p>{notice}</p>
            <button onClick={loadPreferences} type="button">重新读取</button>
          </div>
        )}

        {loadState === 'ready' && (
          <fieldset className="main-chat-model-options" disabled={Boolean(savingModel)}>
            <legend className="sr-only">选择聊天模型</legend>
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              const isSaving = model.id === savingModel;
              return (
                <button
                  aria-pressed={isSelected}
                  className={`main-chat-model-option${isSelected ? ' is-selected' : ''}`}
                  key={model.id}
                  onClick={() => chooseModel(model.id)}
                  type="button"
                >
                  <span className="main-chat-model-mark" aria-hidden="true" />
                  <span>
                    <strong>{model.label}</strong>
                    <small>{model.description}</small>
                  </span>
                  <em>{isSaving ? '保存中…' : isSelected ? '正在使用' : '选择'}</em>
                </button>
              );
            })}
          </fieldset>
        )}

        {loadState === 'ready' && notice && (
          <p className="main-chat-settings-notice" aria-live="polite">{notice}</p>
        )}

        <p className="main-chat-settings-footnote">
          这里只保存公开模型名称。供应商地址与密钥始终留在服务端。
        </p>
      </div>
    </section>
  );
}
