import { useEffect, useRef, useState } from 'react';

const MOBILE_QUERY = '(max-width: 700px) and (orientation: portrait)';
const DRAG_THRESHOLD = 10;

export default function SceneHotspot({
  ariaLabel,
  children,
  className,
  feedbackDelay = 240,
  onActivate,
}) {
  const [isPressed, setIsPressed] = useState(false);
  const pointerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  useEffect(
    () => () => window.clearTimeout(feedbackTimerRef.current),
    [],
  );

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') return;
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      dragged: false,
    };
  };

  const handlePointerMove = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.dragged) return;
    if (
      Math.abs(event.clientX - pointer.x) > DRAG_THRESHOLD
      || Math.abs(event.clientY - pointer.y) > DRAG_THRESHOLD
    ) {
      pointer.dragged = true;
    }
  };

  const handleClick = (event) => {
    const wasDragged = pointerRef.current?.dragged;
    pointerRef.current = null;
    if (wasDragged) {
      event.preventDefault();
      return;
    }

    const isTouchActivation = event.detail !== 0
      && window.matchMedia(MOBILE_QUERY).matches;
    if (!isTouchActivation) {
      onActivate?.();
      return;
    }

    window.clearTimeout(feedbackTimerRef.current);
    setIsPressed(true);
    feedbackTimerRef.current = window.setTimeout(() => {
      setIsPressed(false);
      onActivate?.();
    }, feedbackDelay);
  };

  return (
    <button
      aria-label={ariaLabel}
      className={`${className}${isPressed ? ' is-pressed' : ''}`}
      onClick={handleClick}
      onPointerCancel={() => {
        if (pointerRef.current) pointerRef.current.dragged = true;
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      type="button"
    >
      {children}
    </button>
  );
}
