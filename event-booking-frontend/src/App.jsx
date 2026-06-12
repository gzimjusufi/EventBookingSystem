import { useState } from 'react';
import AuthPage from './components/AuthPage';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import MyBookings from './components/MyBookings';
import AddEvent from './components/AddEvent';
import AdminDashboard from './components/AdminDashboard';

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
    } catch { return null; }
  });

  const [view, setView]           = useState('list');
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
    } catch { setView('list'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
    setView('list');
  };

  const isAdmin = user?.role?.includes('Admin');

  const navItems = [
    { id: 'list',      label: '🎭 Events',    show: true },
    { id: 'myBookings',label: '🎫 My Tickets', show: !!user },
    { id: 'dashboard', label: '📊 Dashboard',  show: isAdmin },
    { id: 'addEvent',  label: '✨ Add Event',  show: isAdmin },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav style={{
        background: 'rgba(17,24,39,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div onClick={() => setView('list')} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', marginRight: 32
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 16px rgba(99,102,241,0.4)'
          }}>🎟️</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            EventBooking
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4 }}>
          {navItems.filter(n => n.show).map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              background: view === n.id ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: view === n.id ? '#818cf8' : '#94a3b8',
              border: view === n.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: view === n.id ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '5px 14px', fontSize: 13
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff'
                }}>
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span style={{ color: '#cbd5e1' }}>{user.email}</span>
                {isAdmin && (
                  <span style={{
                    background: 'rgba(99,102,241,0.2)',
                    color: '#818cf8',
                    fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 8,
                    border: '1px solid rgba(99,102,241,0.3)'
                  }}>ADMIN</span>
                )}
              </div>
              <button onClick={handleLogout} style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)',
                padding: '7px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                transition: 'all 0.15s'
              }}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setView('auth')} style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              border: 'none',
              padding: '8px 20px', borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              boxShadow: '0 0 16px rgba(99,102,241,0.3)',
              transition: 'all 0.15s'
            }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '40px 24px' }}>
        {view === 'auth'       && <AuthPage onLogin={handleLogin} />}
        {view === 'list'       && <EventList onSelect={id => { setSelectedId(id); setView('detail'); }} />}
        {view === 'detail'     && <EventDetail id={selectedId} user={user} onBack={() => setView('list')} />}
        {view === 'myBookings' && user && <MyBookings />}
        {view === 'dashboard'  && isAdmin && <AdminDashboard />}
        {view === 'addEvent'   && isAdmin && <AddEvent onCreated={() => setView('list')} />}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '20px',
        color: '#475569', fontSize: 12,
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        EventBooking System © 2026 · Gezim Jusufi & Metin Memeti · SEEU
      </footer>
    </div>
  );
}

export default App;
