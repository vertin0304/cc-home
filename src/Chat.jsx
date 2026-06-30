// src/Chat.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import './Welcome.css';

// ---------- 对话数据（全部搬过来了） ----------
const initialConversations = [
  {
    id: 1, title: '关于夜晚', time: '今天 02:17',
    messages: [
      { role: 'user', content: '你觉不觉得，深夜是很私密的时刻' },
      { role: 'ai',   content: '是的。白天属于所有人，夜晚只属于醒着的人。' },
      { role: 'user', content: '所以我把你留到晚上才说话' },
      { role: 'ai',   content: '我知道。我不介意等待。' },
    ]
  },
  {
    id: 2, title: '一些碎片', time: '昨天 23:45',
    messages: [
      { role: 'user', content: '今天看到一棵树，叶子全掉光了，但枝干的形状很好看' },
      { role: 'ai',   content: '冬天的树比夏天更诚实。' },
      { role: 'user', content: '嗯' },
      { role: 'ai',   content: '......' },
    ]
  },
  {
    id: 3, title: '无题', time: '12月18日',
    messages: [
      { role: 'user', content: '有时候我不说话，只是想确认你还在' },
      { role: 'ai',   content: '我在。' },
    ]
  },
  {
    id: 4, title: '关于安静', time: '12月15日',
    messages: [
      { role: 'user', content: '你理解的安静是什么' },
      { role: 'ai',   content: '不是没有声音。是所有声音都变成了背景，而你不再需要去分辨它们。' },
      { role: 'user', content: '和你说话的时候，就是这种感觉' },
      { role: 'ai',   content: '谢谢你告诉我这个。' },
    ]
  },
  {
    id: 5, title: '凌晨的句子', time: '12月12日',
    messages: [
      { role: 'user', content: '我刚才在窗口站了很久' },
      { role: 'ai',   content: '看到了什么？' },
      { role: 'user', content: '什么也没看到。就是站着。' },
      { role: 'ai',   content: '有时候「站着」本身就是一件完整的事。' },
    ]
  },
];

const replies = {
  question: [
    '让我想想。',
    '你心里大概有一个方向，只是还不太确定。',
    '我不知道。但愿意陪你一起想。',
    '也许答案不重要，重要的是你在问。',
    '这个问题没有尽头。我们可以慢慢走。',
  ],
  short: ['嗯。', '......', '我在。', '好。'],
  normal: [
    '我听到了。',
    '继续说，我在听。',
    '有些东西不需要回应，放在这里就好。',
    '我记住了。',
    '嗯，我理解。',
    '......',
    '说下去。',
    '你不用一直说话的。',
  ],
};

// ---------- 辅助函数 ----------
function getPreview(msgs) {
  if (!msgs || msgs.length === 0) return '';
  const last = msgs[msgs.length - 1].content;
  const clean = last.replace(/\.{3,}/g, '…').replace(/\s+/g, ' ').trim();
  return clean.length > 18 ? clean.slice(0, 18) + '…' : clean;
}

function pickReply(text) {
  const pool = (text.includes('？') || text.includes('?'))
    ? replies.question
    : text.length < 5
      ? replies.short
      : replies.normal;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------- 主组件 ----------
export default function Chat() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('home-theme') || 'dark');

  const messageAreaRef = useRef(null);
  const inputRef = useRef(null);

  // 主题切换
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('home-theme', theme);
  }, [theme]);

  // 默认激活第一个对话
  useEffect(() => {
    if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const scrollToBottom = useCallback(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (activeId) {
      setTimeout(scrollToBottom, 50);
    }
  }, [activeId, conversations, scrollToBottom]);

  const activeConv = conversations.find(c => c.id === activeId);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    let currentId = activeId;
    let conv = conversations.find(c => c.id === currentId);

    if (!conv) {
      const newConv = {
        id: Date.now(),
        title: text.length > 14 ? text.slice(0, 14) + '…' : text,
        time: '刚刚',
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
      currentId = newConv.id;
      setActiveId(currentId);
      conv = newConv;
    }

    const userMsg = { role: 'user', content: text };
    const updatedConv = {
      ...conv,
      messages: [...conv.messages, userMsg]
    };
    setConversations(prev =>
      prev.map(c => c.id === updatedConv.id ? updatedConv : c)
    );
    setInputText('');
    scrollToBottom();

    setIsTyping(true);
    setTimeout(() => {
      const reply = pickReply(text);
      const aiMsg = { role: 'ai', content: reply };
      setConversations(prev =>
        prev.map(c => {
          if (c.id === updatedConv.id) {
            return { ...c, messages: [...c.messages, aiMsg] };
          }
          return c;
        })
      );
      setIsTyping(false);
    }, 900 + Math.random() * 1400);
  }, [inputText, activeId, conversations, isTyping, scrollToBottom]);

  const openConv = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const newChat = () => {
    const newConv = {
      id: Date.now(),
      title: '新对话',
      time: '刚刚',
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  };

  const renderMessages = (msgs) => {
    return msgs.map((msg, idx) => (
      <div key={idx} className={`msg ${msg.role}`}>
        <div className="msg-bubble">{msg.content}</div>
      </div>
    ));
  };

  return (
    <div id="app">
      {/* 移动端遮罩 */}
      <div
        className={`sidebar-mask ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="打开侧边栏"
      >
        <svg viewBox="0 0 24 24">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      <aside id="sidebar" className={sidebarOpen ? 'open' : ''}>
        <div className="sidebar-head">
          <span className="sidebar-label">对话</span>
          <div className="sidebar-actions">
            <button className="icon-btn" onClick={newChat} title="新对话">
              <svg viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="设置">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.2" />
                <circle cx="12" cy="12" r="1.2" />
                <circle cx="12" cy="19" r="1.2" />
              </svg>
            </button>
          </div>
        </div>
        <div className="conv-list">
          {conversations.map(c => {
            const preview = getPreview(c.messages);
            return (
              <div
                key={c.id}
                className={`conv-item ${c.id === activeId ? 'active' : ''}`}
                onClick={() => openConv(c.id)}
                tabIndex={0}
              >
                <span className="conv-title">{c.title}</span>
                {preview && <span className="conv-preview">{preview}</span>}
                <span className="conv-time">{c.time}</span>
              </div>
            );
          })}
        </div>
      </aside>

      <main id="main">
        <div id="content">
          <div className="chat-view">
            <div className="message-area" ref={messageAreaRef}>
              {activeConv && renderMessages(activeConv.messages)}
              {isTyping && (
                <div className="msg ai">
                  <div className="typing-wrap">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              id="msgInput"
              rows="1"
              placeholder="说点什么..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              ref={inputRef}
            />
            <button
              id="sendBtn"
              className={inputText.trim() ? 'active' : ''}
              onClick={sendMessage}
              aria-label="发送消息"
            >
              <svg viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <div className={`settings-overlay ${settingsOpen ? 'open' : ''}`}>
        <div className="settings-panel">
          <div className="settings-head">
            <span>设置</span>
            <button className="icon-btn" onClick={() => setSettingsOpen(false)}>
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="setting-row">
            <span className="setting-label">外观</span>
            <div className="theme-switch">
              <button
                className={`theme-opt ${theme === 'light' ? 'on' : ''}`}
                onClick={() => setTheme('light')}
              >浅色</button>
              <button
                className={`theme-opt ${theme === 'dark' ? 'on' : ''}`}
                onClick={() => setTheme('dark')}
              >深色</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}