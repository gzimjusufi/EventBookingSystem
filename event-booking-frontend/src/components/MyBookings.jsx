import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    getMyBookings()
      .then(data => { setBookings(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setStatus('✅ Booking cancelled successfully.');
      load();
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
  };

  const confirmed = bookings.filter(b => b.status === 'Confirmed');
  const cancelled = bookings.filter(b => b.status === 'Cancelled');

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>⏳ Loading your bookings...</div>;
  if (error) return <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, color: '#dc2626' }}>⚠️ {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>My Bookings</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Manage your event tickets</p>
      </div>

      {status && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 10,
          background: status.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          color: status.startsWith('✅') ? '#15803d' : '#dc2626',
          fontWeight: 600, border: `1px solid ${status.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`
        }}>
          {status}
        </div>
      )}

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
          <p style={{ color: '#64748b', fontSize: 16 }}>You haven't booked any events yet.</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Bookings', value: bookings.length, color: '#1e40af', bg: '#eff6ff' },
              { label: 'Confirmed', value: confirmed.length, color: '#15803d', bg: '#f0fdf4' },
              { label: 'Cancelled', value: cancelled.length, color: '#dc2626', bg: '#fef2f2' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Booking cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map(booking => (
              <div key={booking.id} style={{
                background: '#fff',
                borderRadius: 12,
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                opacity: booking.status === 'Cancelled' ? 0.6 : 1
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{booking.eventTitle}</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: booking.status === 'Confirmed' ? '#dcfce7' : '#fee2e2',
                      color: booking.status === 'Confirmed' ? '#15803d' : '#dc2626'
                    }}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16 }}>
                    <span>🎫 {booking.numberOfTickets} ticket(s)</span>
                    <span>💶 €{booking.totalPrice.toFixed(2)}</span>
                    <span>📅 {new Date(booking.bookedAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                {booking.status === 'Confirmed' && (
                  <button onClick={() => handleCancel(booking.id)} style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    padding: '8px 18px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13
                  }}>
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyBookings;
