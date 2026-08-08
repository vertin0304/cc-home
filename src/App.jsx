import { useCallback, useEffect, useMemo, useState } from 'react';
import Chat from './Chat';
import HomeMap from './HomeMap';
import LivingRoom from './LivingRoom';
import Welcome from './Welcome';
import LoginLayer from './components/auth/LoginLayer';
import { createChatApi } from './lib/chatApi';
import { supabase, supabaseConfigError } from './lib/supabaseClient';

const routes = new Set(['/', '/map', '/home']);

function currentPath() {
  return routes.has(window.location.pathname) ? window.location.pathname : '/';
}

function App() {
  const [path, setPath] = useState(currentPath);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(() => !supabase);
  const [loginOpen, setLoginOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      setAuthReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) setSession(nextSession);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const navigate = useCallback((nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPath(nextPath);
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setChatOpen(false);
  }, []);

  const chatApi = useMemo(
    () =>
      createChatApi({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        getSession: async () => {
          if (!supabase) return null;
          const { data } = await supabase.auth.getSession();
          return data.session;
        },
        refreshSession: async () => {
          if (!supabase) return null;
          const { data, error } = await supabase.auth.refreshSession();
          return error ? null : data.session;
        },
        signOut,
      }),
    [signOut],
  );

  const openChat = () => {
    if (!authReady || !session) {
      setLoginOpen(true);
      return;
    }
    setChatOpen(true);
  };

  const signIn = async (email, password) => {
    if (!supabase) return { ok: false };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session) return { ok: false };

      setSession(data.session);
      setLoginOpen(false);
      setChatOpen(true);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  const requireLogin = () => {
    setChatOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      {path === '/' && <Welcome onEnter={() => navigate('/map')} />}
      {path === '/map' && (
        <HomeMap
          onOpenHome={() => navigate('/home')}
          onReturn={() => navigate('/')}
        />
      )}
      {path === '/home' && (
        <LivingRoom
          onOpenChat={openChat}
          onReturn={() => navigate('/map')}
        />
      )}

      <LoginLayer
        configError={supabaseConfigError}
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignIn={signIn}
      />
      <Chat
        key={session?.user?.id || 'signed-out'}
        api={chatApi}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onRequireLogin={requireLogin}
        onSignOut={signOut}
        userId={session?.user?.id || null}
      />
    </>
  );
}

export default App;
