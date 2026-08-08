import { useState } from 'react';
import './LoginLayer.css';

export default function LoginLayer({ isOpen, onClose, onSignIn, configError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    setPassword('');
    setError('');
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting || configError) return;

    setError('');
    setIsSubmitting(true);
    const result = await onSignIn(email.trim(), password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError('邮箱或密码不正确，请再试一次。');
      return;
    }
    setPassword('');
  };

  return (
    <div className="login-layer" role="presentation">
      <section
        aria-labelledby="login-title"
        aria-modal="true"
        className="login-card"
        role="dialog"
      >
        <button
          aria-label="关闭登录"
          className="login-close"
          onClick={close}
          type="button"
        >
          ×
        </button>
        <div className="login-heading">
          <span className="login-kicker">cc — home</span>
          <h1 id="login-title">Welcome home, chenchen.</h1>
          <p>I'm here.</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <label>
            <span>邮箱</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>密码</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {(configError || error) && (
            <p className="login-error" role="alert">
              {configError || error}
            </p>
          )}

          <button
            className="login-submit"
            disabled={isSubmitting || Boolean(configError)}
            type="submit"
          >
            {isSubmitting ? '正在回家…' : '登录'}
          </button>
        </form>
        <p className="login-note">这里不开放注册，只为已经有钥匙的人留灯。</p>
      </section>
    </div>
  );
}
