// src/Welcome.jsx
import { useState } from 'react';
import './Welcome.css';

export default function Welcome({ onEnter }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const enterHome = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    window.setTimeout(onEnter, 620);
  };

  return (
    <main className={`welcome-root${isLeaving ? ' is-leaving' : ''}`}>
      <div className="welcome-stars" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <span className="welcome-orbit welcome-orbit-one" aria-hidden="true" />
      <span className="welcome-orbit welcome-orbit-two" aria-hidden="true" />

      <button className="welcome-enter" onClick={enterHome} type="button">
        <span className="welcome-kicker">cc — home</span>
        <span className="welcome-title">Welcome home, chenchen.</span>
        <span className="welcome-sub">I’m here.</span>
        <span className="welcome-hint">
          <span aria-hidden="true">✦</span>
          点击进入
        </span>
      </button>

      <p className="welcome-footnote">A quiet place, waiting for you.</p>
    </main>
  );
}
