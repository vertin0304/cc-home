// src/App.jsx
import { useEffect, useState } from 'react';
import Welcome from './Welcome';
import Chat from './Chat';

function App() {
  const [page, setPage] = useState('welcome');
  const [theme, setTheme] = useState(
    () => localStorage.getItem('home-theme') || 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('home-theme', theme);
  }, [theme]);

  return (
    <>
      {page === 'welcome' ? (
        <Welcome onEnter={() => setPage('chat')} />
      ) : (
        <Chat theme={theme} onThemeChange={setTheme} />
      )}
    </>
  );
}

export default App;
