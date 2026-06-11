import { useState } from 'react';
import { login, register } from '../services/api';

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
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
      setStatus(`error:${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 14,
    boxSizing: 'border-box', outline: 'none'
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }}>
      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: '28px 32px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎟️</div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.8, fontSize: 14 }}>
            {isLogin ? 'Sign in to book events' : 'Join EventBooking today'}
          </p>
        </div>

        <div style={{ padding: '28px 32px' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {['Login', 'Register'].map(tab => (
              <button key={tab} onClick={() => { setIsLogin(tab === 'Login'); setStatus(''); }} style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer',
                background: (tab === 'Login') === isLogin ? '#fff' : 'transparent',
                color: (tab === 'Login') === isLogin ? '#1e40af' : '#64748b',
                fontWeight: (tab === 'Login') === isLogin ? 700 : 400,
                fontSize: 14,
                boxShadow: (tab === 'Login') === isLogin ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s'
              }}>
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder={isLogin ? 'Your password' : 'Min 8 chars, uppercase, number, symbol'}
                style={inputStyle} />
              {!isLogin && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  Requirements: 8+ characters, 1 uppercase, 1 number, 1 symbol (e.g. Test123!)
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? '#93c5fd' : '#1e40af',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15
            }}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {status === 'success' && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', color: '#15803d', fontWeight: 600, fontSize: 13 }}>
              ✅ Account created! You can now log in.
            </div>
          )}
          {status.startsWith('error:') && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13 }}>
              ❌ {status.replace('error:', '')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
