import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ChatMessage from './components/chat/ChatMessage';
import ChatShell from './components/chat/ChatShell';
import { ChatAuthError, ChatRequestError } from './lib/chatApi';
import { normalizeHistoryMessage } from './lib/chatDiagnostics';
import {
  appendPendingTurn,
  failAssistantMessage,
  settleAssistantMessage,
} from './lib/chatMessages';
import './Chat.css';

export default function Chat({
  api,
  isOpen,
  userId,
  onClose,
  onRequireLogin,
  onSignOut,
  returnLabel,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [historyState, setHistoryState] = useState('idle');
  const [historyError, setHistoryError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('chat');
  const messageListRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const turnSequenceRef = useRef(0);
  const sendInFlightRef = useRef(false);

  const resetShell = useCallback(() => {
    setIsSidebarOpen(false);
    setActiveView('chat');
  }, []);

  const closeChat = useCallback(() => {
    if (messageListRef.current) {
      scrollPositionRef.current = messageListRef.current.scrollTop;
    }
    resetShell();
    onClose();
  }, [onClose, resetShell]);

  const requireLogin = useCallback(() => {
    resetShell();
    onRequireLogin();
  }, [onRequireLogin, resetShell]);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    setHistoryState('loading');
    setHistoryError('');
    try {
      const history = await api.getHistory();
      setMessages(history.map(normalizeHistoryMessage).filter(Boolean));
      setHistoryState('ready');
    } catch (error) {
      if (error instanceof ChatAuthError) {
        requireLogin();
        return;
      }
      setHistoryState('error');
      setHistoryError('暂时没有取回聊天记录。');
    }
  }, [api, requireLogin, userId]);

  useEffect(() => {
    if (!isOpen || !userId || historyState !== 'idle') return undefined;
    const timer = window.setTimeout(loadHistory, 0);
    return () => window.clearTimeout(timer);
  }, [historyState, isOpen, loadHistory, userId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return;
      }
      if (activeView === 'settings') {
        setActiveView('chat');
        return;
      }
      closeChat();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activeView, closeChat, isOpen, isSidebarOpen]);

  useLayoutEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList || !shouldStickToBottomRef.current) return;
    messageList.scrollTop = messageList.scrollHeight;
    scrollPositionRef.current = messageList.scrollTop;
  }, [messages]);

  useLayoutEffect(() => {
    if (!isOpen || !messageListRef.current) return undefined;
    const frame = window.requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = scrollPositionRef.current;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const send = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sendInFlightRef.current || historyState === 'loading') return;

    const createdAt = new Date().toISOString();
    const turnId = `${Date.now()}-${turnSequenceRef.current += 1}`;
    const userMessageId = `user-${turnId}`;
    const assistantMessageId = `assistant-${turnId}`;

    sendInFlightRef.current = true;
    setIsSending(true);
    setInput('');
    shouldStickToBottomRef.current = true;
    setMessages((current) => appendPendingTurn(current, {
      assistantId: assistantMessageId,
      createdAt,
      text,
      userId: userMessageId,
    }));

    try {
      const result = await api.sendMessage(text);
      setMessages((current) => settleAssistantMessage(
        current,
        assistantMessageId,
        result,
        new Date().toISOString(),
      ));
    } catch (error) {
      const safeError = error instanceof ChatAuthError || error instanceof ChatRequestError
        ? error
        : new ChatRequestError();
      setMessages((current) => failAssistantMessage(
        current,
        assistantMessageId,
        safeError,
        new Date().toISOString(),
      ));
      if (error instanceof ChatAuthError) {
        requireLogin();
      }
    } finally {
      sendInFlightRef.current = false;
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ChatShell
      api={api}
      isSettingsOpen={activeView === 'settings'}
      isSidebarOpen={isSidebarOpen}
      onClose={closeChat}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      onOpenSettings={() => {
        setActiveView('settings');
        setIsSidebarOpen(false);
      }}
      onRequireLogin={requireLogin}
      onSelectMainChat={() => {
        setActiveView('chat');
        setIsSidebarOpen(false);
      }}
      onSignOut={onSignOut}
      onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      returnLabel={returnLabel}
      userId={userId}
    >
      <div
        className="main-chat-messages"
        onScroll={(event) => {
          const messageList = event.currentTarget;
          scrollPositionRef.current = messageList.scrollTop;
          shouldStickToBottomRef.current = (
            messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight
          ) < 72;
        }}
        ref={messageListRef}
      >
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
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <form className="main-chat-composer" onSubmit={send}>
        <div className="main-chat-compose-row">
          <textarea
            aria-label="输入消息"
            disabled={historyState === 'loading'}
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
    </ChatShell>
  );
}
