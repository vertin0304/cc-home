// src/App.jsx
import { useState } from 'react';
import Welcome from './Welcome';
import Chat from './Chat';

function App() {
  const [page, setPage] = useState('welcome');

  return (
    <>
      {page === 'welcome' ? (
        <Welcome onEnter={() => setPage('chat')} />
      ) : (
        <Chat />
      )}
    </>
  );
}

export default App;