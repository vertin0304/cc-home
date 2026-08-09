import { useLayoutEffect, useRef } from 'react';
import SceneHotspot from './components/scene/SceneHotspot';
import './Bedroom.css';

const MOBILE_QUERY = '(max-width: 700px) and (orientation: portrait)';

export default function Bedroom({
  getInitialScrollRatio,
  onOpenChat,
  onReturn,
  onScrollPositionChange,
}) {
  const viewportRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !window.matchMedia(MOBILE_QUERY).matches) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollLeft = Math.round(maxScroll * getInitialScrollRatio());
    });
    return () => window.cancelAnimationFrame(frame);
  }, [getInitialScrollRatio]);

  const rememberScrollPosition = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    onScrollPositionChange(maxScroll ? viewport.scrollLeft / maxScroll : 0);
  };

  return (
    <main className="bedroom">
      <div className="bedroom-ambient" aria-hidden="true" />

      <header className="bedroom-header">
        <button
          aria-label="返回客厅"
          className="bedroom-back"
          onClick={onReturn}
          type="button"
        >
          <span className="bedroom-back-mark" aria-hidden="true">←</span>
          <span>返回客厅</span>
        </button>
      </header>

      <div
        className="bedroom-viewport"
        onScroll={rememberScrollPosition}
        ref={viewportRef}
      >
        <div className="bedroom-canvas">
          <img
            alt="夜色中的卧室，床头柜上放着闹钟和两部手机"
            className="bedroom-image"
            src="/bedroom.png"
          />
          <div className="bedroom-vignette" aria-hidden="true" />

          <SceneHotspot
            ariaLabel="打开聊天"
            className="bedroom-hotspot bedroom-phones-hotspot"
            onActivate={onOpenChat}
          />

          <SceneHotspot
            ariaLabel="闹钟功能暂未开放"
            className="bedroom-hotspot bedroom-clock-hotspot"
          />
        </div>
      </div>
    </main>
  );
}
