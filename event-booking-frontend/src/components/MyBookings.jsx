import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [status, setStatus]     = useState('');

  const load = () => {
    setLoading(true);
    getMyBookings()
      .then(data => { setBookings(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setStatus('success');
      load();
    } catch (err) { setStatus('error:' + err.message); }
  };

  const confirmed  = bookings.filter(b => b.status === 'Confirmed');
  const cancelled  = bookings.filter(b => b.status === 'Cancelled');
  const totalSpent = confirmed.reduce((s, b) => s + b.totalPrice, 0);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>⏳ Loading...</div>;
  if (error)   return <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 16, color: '#f87171' }}>⚠️ {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4,
          background: 'linear-gradient(135deg, #f1f5f9, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Tickets
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>All your event bookings in one place</p>
      </div>

      {status === 'success' && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          color: '#34d399', fontWeight: 600 }}>✅ Booking cancelled.</div>
      )}
      {status.startsWith?.('error:') && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171' }}>{status.replace('error:', '')}</div>
      )}

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎫</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>No bookings yet.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Bookings', value: bookings.length, color: '#6366f1' },
              { label: 'Confirmed',      value: confirmed.length,  color: '#10b981' },
              { label: 'Total Spent',    value: `€${totalSpent.toFixed(0)}`, color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'var(--bg-card)', border: `1px solid ${color}30`,
                borderRadius: 'var(--radius-lg)', padding: '16px 20px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Booking list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(b => (
              <div key={b.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '18px 22px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
                opacity: b.status === 'Cancelled' ? 0.55 : 1,
                borderLeft: `3px solid ${b.status === 'Confirmed' ? '#10b981' : '#ef4444'}`
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{b.eventTitle}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: b.status === 'Confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: b.status === 'Confirmed' ? '#34d399' : '#f87171',
                      border: `1px solid ${b.status === 'Confirmed' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}>{b.status.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>🎫 {b.numberOfTickets} ticket(s)</span>
                    <span>💶 €{b.totalPrice.toFixed(2)}</span>
                    <span>📅 {new Date(b.bookedAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                {b.status === 'Confirmed' && (
                  <button onClick={() => handleCancel(b.id)} style={{
                    background: 'rgba(239,68,68,0.1)', color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                    padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13
                  }}>Cancel</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
