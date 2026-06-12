import { useState } from 'react';
import { login, register } from '../services/api';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      if (isLogin) {
        const data = await login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.email);
        onLogin(data);
      } else {
        await register(email, password);
        setStatus('success');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setStatus('error:' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      {/* Glow blob */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
        transform: 'translate(-50px, -80px)'
      }} />

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '36px 36px 28px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
          borderBottom: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 26,
            boxShadow: '0 0 24px rgba(99,102,241,0.4)'
          }}>🎟️</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isLogin ? 'Sign in to book events' : 'Join EventBooking today'}
          </p>
        </div>

        <div style={{ padding: '28px 36px 36px' }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: 4, marginBottom: 24
          }}>
            {['Login', 'Register'].map(tab => (
              <button key={tab} onClick={() => { setIsLogin(tab === 'Login'); setStatus(''); }} style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                background: (tab === 'Login') === isLogin
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
                color: (tab === 'Login') === isLogin ? '#fff' : 'var(--text-secondary)',
                fontWeight: (tab === 'Login') === isLogin ? 700 : 400,
                fontSize: 14, transition: 'all 0.2s',
                boxShadow: (tab === 'Login') === isLogin ? '0 0 12px rgba(99,102,241,0.3)' : 'none'
              }}>{tab}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder={isLogin ? 'Your password' : 'Min 8 chars, 1 uppercase, 1 number, 1 symbol'} />
              {!isLogin && (
                <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  e.g. Test123! — uppercase, number and symbol required
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '12px',
              background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 15,
              boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
              transition: 'all 0.2s', marginTop: 4
            }}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {status === 'success' && (
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399', fontSize: 14, fontWeight: 600 }}>
              ✅ Account created! You can now log in.
            </div>
          )}
          {status.startsWith('error:') && (
            <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', fontSize: 14 }}>
              ❌ {status.replace('error:', '')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
