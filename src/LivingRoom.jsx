import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './LivingRoom.css';

const MOBILE_QUERY = '(max-width: 700px) and (orientation: portrait)';

export default function LivingRoom({ onReturn, onOpenChat }) {
  const [pressedTarget, setPressedTarget] = useState(null);
  const viewportRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !window.matchMedia(MOBILE_QUERY).matches) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.round(viewport.scrollWidth * 0.35);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => window.clearTimeout(feedbackTimerRef.current),
    [],
  );

  const activate = (target, action) => {
    if (!window.matchMedia(MOBILE_QUERY).matches) {
      action();
      return;
    }

    window.clearTimeout(feedbackTimerRef.current);
    setPressedTarget(target);
    feedbackTimerRef.current = window.setTimeout(() => {
      setPressedTarget(null);
      action();
    }, 260);
  };

  return (
    <main className="living-room">
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
            className={`cups-hotspot${pressedTarget === 'cups' ? ' is-pressed' : ''}`}
            aria-label="通过情侣水杯打开主聊天"
            onClick={() => activate('cups', onOpenChat)}
            type="button"
          >
            <span className="cups-steam cups-steam-one" aria-hidden="true" />
            <span className="cups-steam cups-steam-two" aria-hidden="true" />
          </button>

        </div>
      </div>
    </main>
  );
}
