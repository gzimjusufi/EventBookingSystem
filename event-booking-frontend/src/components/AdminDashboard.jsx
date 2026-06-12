import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: color + '20', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 22
        }}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    getDashboard()
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>⏳ Loading dashboard...</div>;
  if (error)   return <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 16, color: '#f87171' }}>⚠️ {error}</div>;

  const cancelRate = data.totalBookings > 0
    ? ((data.cancelledBookings / data.totalBookings) * 100).toFixed(0)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4,
          background: 'linear-gradient(135deg, #f1f5f9, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time overview of your platform</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="🎭" label="Total Events"     value={data.totalEvents}     color="#6366f1" sub={`${data.upcomingEvents} upcoming`} />
        <StatCard icon="🎫" label="Total Bookings"   value={data.totalBookings}   color="#10b981" sub={`${data.confirmedBookings} confirmed`} />
        <StatCard icon="👥" label="Total Users"      value={data.totalUsers}      color="#3b82f6" />
        <StatCard icon="💶" label="Total Revenue"    value={`€${data.totalRevenue.toFixed(0)}`} color="#f59e0b" sub="from confirmed bookings" />
        <StatCard icon="❌" label="Cancellations"    value={data.cancelledBookings} color="#ef4444" sub={`${cancelRate}% cancel rate`} />
        <StatCard icon="⭐" label="Average Rating"   value={data.averageRating || '—'} color="#f59e0b" sub="across all reviews" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent Bookings */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>🕐 Recent Bookings</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {data.recentBookings.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>No bookings yet</p>
            ) : data.recentBookings.map(b => (
              <div key={b.id} style={{
                padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{b.eventTitle}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.userEmail} · {b.numberOfTickets} ticket(s)</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>€{b.totalPrice.toFixed(0)}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                    background: b.status === 'Confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: b.status === 'Confirmed' ? '#34d399' : '#f87171',
                    border: `1px solid ${b.status === 'Confirmed' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}>{b.status.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), transparent)' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>🏆 Top Events</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            {data.topEvents.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>No events yet</p>
            ) : data.topEvents.map((e, i) => (
              <div key={e.id} style={{
                padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>
                  {['🥇','🥈','🥉','4️⃣','5️⃣'][i]}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{e.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {e.totalBookings} bookings · {e.averageRating > 0 ? `⭐ ${e.averageRating.toFixed(1)}` : 'No reviews'}
                  </p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>€{e.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📊 Booking Status Overview</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, height: 12, background: 'var(--bg-input)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 6,
              width: data.totalBookings > 0 ? `${(data.confirmedBookings / data.totalBookings) * 100}%` : '0%',
              background: 'linear-gradient(90deg, #10b981, #34d399)'
            }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {data.confirmedBookings} confirmed / {data.cancelledBookings} cancelled
          </span>
        </div>
      </div>
    </div>
  );
}
