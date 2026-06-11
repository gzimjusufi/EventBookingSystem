import { useState } from 'react';
import AuthPage from './components/AuthPage';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import MyBookings from './components/MyBookings';
import AddEvent from './components/AddEvent';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rawRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const role = Array.isArray(rawRole) ? rawRole : [rawRole];
      return { token, email, role };
    } catch {
      return null;
    }
  });

  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  const handleLogin = (data) => {
    try {
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const rawRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const role = Array.isArray(rawRole) ? rawRole : [rawRole];
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      setUser({ token: data.token, email: data.email, role });
      setView('list');
    } catch {
      setView('list');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
    setView('list');
  };

  const openDetail = (id) => {
    setSelectedId(id);
    setView('detail');
  };

  const isAdmin = user?.role?.includes('Admin');

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: '#fff',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        height: 64,
        boxShadow: '0 2px 12px rgba(30,64,175,0.4)'
      }}>
        <span
          onClick={() => setView('list')}
          style={{ fontWeight: 800, fontSize: 20, marginRight: 24, cursor: 'pointer', letterSpacing: '-0.5px' }}
        >
          🎟️ EventBooking
        </span>

        {['list', ...(user ? ['myBookings'] : []), ...(isAdmin ? ['addEvent'] : [])].map(v => {
          const labels = { list: 'Events', myBookings: 'My Bookings', addEvent: '+ Add Event' };
          return (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: '#fff',
              border: view === v ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
              padding: '7px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: view === v ? 700 : 400,
              transition: 'all 0.15s'
            }}>
              {labels[v]}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>👤</span>
                <span>{user.email}</span>
                {isAdmin && (
                  <span style={{
                    background: '#fbbf24',
                    color: '#92400e',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10
                  }}>ADMIN</span>
                )}
              </div>
              <button onClick={handleLogout} style={{
                background: 'rgba(239,68,68,0.85)',
                color: '#fff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
              }}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setView('auth')} style={{
              background: '#fff',
              color: '#1e40af',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14
            }}>
              Login / Register
            </button>
          )}
        </div>
      </nav>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        {view === 'auth'       && <AuthPage onLogin={handleLogin} />}
        {view === 'list'       && <EventList onSelect={openDetail} />}
        {view === 'detail'     && <EventDetail id={selectedId} isLoggedIn={!!user} onBack={() => setView('list')} />}
        {view === 'myBookings' && user && <MyBookings />}
        {view === 'addEvent'   && isAdmin && <AddEvent onCreated={() => setView('list')} />}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: '#94a3b8',
        fontSize: 13,
        borderTop: '1px solid #e2e8f0',
        marginTop: 48
      }}>
        EventBooking System © 2026 — Gezim Jusufi & Metin Memeti · SEEU
      </footer>
    </div>
  );
}

export default App;
