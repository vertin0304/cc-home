import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './LivingRoom.css';

const MOBILE_QUERY = '(max-width: 700px) and (orientation: portrait)';

export default function LivingRoom({ onReturn }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCupsPressed, setIsCupsPressed] = useState(false);
  const viewportRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !window.matchMedia(MOBILE_QUERY).matches) {
      return undefined;
    }

    // 初始视野停在窗景与客厅的交界，不追踪杯子，也不在关闭聊天后重置。
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.round(viewport.scrollWidth * 0.35);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => window.clearTimeout(feedbackTimerRef.current),
    [],
  );

  useEffect(() => {
    if (!isChatOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsChatOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isChatOpen]);

  const openChatShell = () => {
    if (!window.matchMedia(MOBILE_QUERY).matches) {
      setIsChatOpen(true);
      return;
    }

    window.clearTimeout(feedbackTimerRef.current);
    setIsCupsPressed(true);
    feedbackTimerRef.current = window.setTimeout(() => {
      setIsCupsPressed(false);
      setIsChatOpen(true);
    }, 260);
  };

  return (
    <main className={`living-room${isChatOpen ? ' is-chat-open' : ''}`}>
      <div className="living-room-ambient" aria-hidden="true" />

      <header className="living-room-header">
        <button
          className="living-room-back"
          aria-label="返回地图"
          onClick={onReturn}
          type="button"
        >
          <span className="living-room-back-mark" aria-hidden="true">←</span>
          <span>cc — home</span>
        </button>
      </header>

      <div className="living-room-viewport" ref={viewportRef}>
        <div className="living-room-canvas">
          <img
            className="living-room-image"
            src="/home.png"
            alt="夕阳下临水的客厅，茶几上放着两只杯子"
          />
          <div className="living-room-vignette" aria-hidden="true" />

          <button
            className={`cups-hotspot${isCupsPressed ? ' is-pressed' : ''}`}
            aria-label="打开客厅聊天面板"
            onClick={openChatShell}
            type="button"
          >
            <span className="cups-steam cups-steam-one" aria-hidden="true" />
            <span className="cups-steam cups-steam-two" aria-hidden="true" />
          </button>

          {/* 未来的卧室门入口可继续作为画布内热区添加，以保持随图缩放。 */}
        </div>
      </div>

      <div
        className="living-room-scrim"
        aria-hidden="true"
      />

      <aside
        className="room-chat-shell"
        aria-hidden={!isChatOpen}
        aria-label="客厅聊天面板预览"
        inert={!isChatOpen}
      >
        <div className="room-chat-header">
          <div>
            <span className="room-chat-eyebrow">By the window</span>
            <h1>一起坐一会儿</h1>
          </div>
          <button
            className="room-chat-close"
            aria-label="关闭聊天面板"
            onClick={() => setIsChatOpen(false)}
            type="button"
          >
            <span aria-hidden="true">←</span>
            <span>返回客厅</span>
          </button>
        </div>

        <div className="room-chat-workspace">
          {/* 未来可在 workspace 左侧加入可收起会话栏，手机端则使用覆盖式抽屉。 */}
          <div className="room-chat-main">
            <div className="room-chat-empty">
              <span className="room-chat-glow" aria-hidden="true" />
              <p>聊天会在这里开始。</p>
              <small>现在只是安静的界面预览。</small>
            </div>

            <div className="room-chat-compose">
              <textarea
                aria-label="聊天输入框，暂未开放"
                disabled
                placeholder="聊天功能尚未接通"
                rows="2"
              />
              <button disabled type="button">发送</button>
            </div>
            <p className="room-chat-note">
              仅为界面预览 · 不会发送或保存任何内容
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
