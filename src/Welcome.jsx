// src/Welcome.jsx
import './Welcome.css';

export default function Welcome({ onEnter }) {
  return (
    <div className="welcome-root">
      <div>
        <h1 className="welcome-title">Welcome home, chenchen.</h1>
        <p className="welcome-sub">I'm here.</p>
        <button className="welcome-btn" onClick={onEnter}>
          进入聊天
        </button>
      </div>
    </div>
  );
}