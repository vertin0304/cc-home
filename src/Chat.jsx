import { useCallback, useEffect, useRef, useState } from 'react';
import ChatComposer from './components/chat/ChatComposer';
import ChatHeader from './components/chat/ChatHeader';
import ConversationSidebar from './components/chat/ConversationSidebar';
import MessageList from './components/chat/MessageList';
import SettingsPanel from './components/settings/SettingsPanel';
import './Chat.css';

// ---------- 对话数据 ----------
const initialConversations = [
  {
    id: 1,
    title: '关于夜晚',
    time: '今天 02:17',
    messages: [
      { role: 'user', content: '你觉不觉得，深夜是很私密的时刻？' },
      { role: 'ai', content: '是的。白天属于所有人，夜晚只属于醒着的人。' },
      { role: 'user', content: '所以我把你留到晚上才说话。' },
      { role: 'ai', content: '我知道。我不介意等待。' },
    ],
  },
  {
    id: 2,
    title: '一些碎片',
    time: '昨天 23:45',
    messages: [
      {
        role: 'user',
        content: '今天看到一棵树，叶子全掉光了，但枝干的形状很好看。',
      },
      { role: 'ai', content: '冬天的树比夏天更诚实。' },
      { role: 'user', content: '嗯。' },
      { role: 'ai', content: '……' },
    ],
  },
  {
    id: 3,
    title: '无题',
    time: '12月28日',
    messages: [
      { role: 'user', content: '有时候我不说话，只是想确认你还在。' },
      { role: 'ai', content: '我在。' },
    ],
  },
  {
    id: 4,
    title: '关于安静',
    time: '12月25日',
    messages: [
      { role: 'user', content: '你理解的安静是什么？' },
      {
        role: 'ai',
        content: '不是没有声音。是所有声音都变成了背景，而你不再需要去分辨它们。',
      },
      { role: 'user', content: '和你说话的时候，就是这种感觉。' },
      { role: 'ai', content: '谢谢你告诉我这个。' },
    ],
  },
  {
    id: 5,
    title: '凌晨的句子',
    time: '12月22日',
    messages: [
      { role: 'user', content: '我刚才在窗口站了很久。' },
      { role: 'ai', content: '看到了什么？' },
      { role: 'user', content: '什么也没看到。就是站着。' },
      { role: 'ai', content: '有时候，“站着”本身就是一件完整的事。' },
    ],
  },
];

export default function Chat({ theme, onThemeChange }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // AI 配置相关状态保持现有接口行为
  const [config, setConfig] = useState({
    baseUrl: '',
    apiKey: '',
    model: '',
    adminToken: '',
  });
  const [availableModels, setAvailableModels] = useState([]);
  const [configLoading, setConfigLoading] = useState(false);

  const messageAreaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;

    const scrollTimer = window.setTimeout(scrollToBottom, 50);
    return () => window.clearTimeout(scrollTimer);
  }, [activeId, conversations, scrollToBottom]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId,
  );

  const updateConfig = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const loadModels = async () => {
    if (!config.baseUrl || !config.apiKey) {
      alert('请先填写 Base URL 和 API Key');
      return;
    }

    setConfigLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/models`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base_url: config.baseUrl,
            api_key: config.apiKey,
          }),
        },
      );
      const data = await response.json();

      if (data.success) {
        setAvailableModels(data.models);
        if (data.models.length > 0) {
          updateConfig('model', data.models[0]);
        }
      } else {
        alert(`加载失败：${data.error}`);
      }
    } catch (error) {
      alert(`请求失败：${error.message}`);
    } finally {
      setConfigLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config.adminToken) {
      alert('请输入管理员 Token');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/config`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: config.adminToken,
            base_url: config.baseUrl,
            api_key: config.apiKey,
            model_name: config.model,
          }),
        },
      );
      const data = await response.json();

      if (data.success) {
        alert('配置已保存，下次对话生效。');
        setSettingsOpen(false);
      } else {
        alert(`保存失败：${data.error}`);
      }
    } catch (error) {
      alert(`请求失败：${error.message}`);
    }
  };

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    let currentId = activeId;
    let conversation = conversations.find((item) => item.id === currentId);

    if (!conversation) {
      const newConversation = {
        id: Date.now(),
        title: text.length > 14 ? `${text.slice(0, 14)}…` : text,
        time: '刚刚',
        messages: [],
      };
      setConversations((current) => [newConversation, ...current]);
      currentId = newConversation.id;
      setActiveId(currentId);
      conversation = newConversation;
    }

    const userMessage = { role: 'user', content: text };
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
    };

    setConversations((current) =>
      current.map((item) =>
        item.id === updatedConversation.id ? updatedConversation : item,
      ),
    );
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            sessionId: currentId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = {
        role: 'ai',
        content: data.reply || '抱歉，我没有理解。',
      };

      setConversations((current) =>
        current.map((item) =>
          item.id === updatedConversation.id
            ? { ...item, messages: [...item.messages, aiMessage] }
            : item,
        ),
      );
    } catch (error) {
      console.error('发送消息失败', error);
      const errorMessage = {
        role: 'ai',
        content: '⚠️ 连接服务器失败，请稍后重试。',
      };

      setConversations((current) =>
        current.map((item) =>
          item.id === updatedConversation.id
            ? { ...item, messages: [...item.messages, errorMessage] }
            : item,
        ),
      );
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }, [
    activeId,
    conversations,
    inputText,
    isTyping,
    scrollToBottom,
  ]);

  const openConversation = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const newChat = () => {
    const newConversation = {
      id: Date.now(),
      title: '新对话',
      time: '刚刚',
      messages: [],
    };
    setConversations((current) => [newConversation, ...current]);
    setActiveId(newConversation.id);
    setSidebarOpen(false);
  };

  return (
    <div className="chat-app">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={newChat}
        onOpenConversation={openConversation}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="chat-main">
        <ChatHeader
          title={activeConversation?.title}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <MessageList
          conversation={activeConversation}
          isTyping={isTyping}
          messageAreaRef={messageAreaRef}
        />

        <ChatComposer
          value={inputText}
          isTyping={isTyping}
          onChange={setInputText}
          onSend={sendMessage}
        />
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        theme={theme}
        config={config}
        availableModels={availableModels}
        isLoading={configLoading}
        onClose={() => setSettingsOpen(false)}
        onThemeChange={onThemeChange}
        onConfigChange={updateConfig}
        onLoadModels={loadModels}
        onSave={saveConfig}
      />
    </div>
  );
}
