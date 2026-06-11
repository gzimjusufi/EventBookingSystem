import { useState, useEffect } from 'react';
import { getEventById, createBooking } from '../services/api';

function EventDetail({ id, isLoggedIn, onBack }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [bookingStatus, setBookingStatus] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    getEventById(id)
      .then(data => { setEvent(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { setBookingStatus('Please log in to book tickets.'); return; }
    setBookingStatus('Booking...');
    try {
      await createBooking(id, tickets);
      setBookingStatus(`✅ Successfully booked ${tickets} ticket(s)!`);
      load(); // refresh available count
    } catch (err) {
      setBookingStatus(`❌ ${err.message}`);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>⏳ Loading...</div>;
  if (error) return <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, color: '#dc2626' }}>⚠️ {error}</div>;
  if (!event) return null;

  const isSoldOut = event.availableTickets === 0;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: '#1e40af',
        cursor: 'pointer', fontSize: 14, fontWeight: 600,
        marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 4
      }}>
        ← Back to Events
      </button>

      {/* Event card */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        {/* Header strip */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', padding: '28px 28px 24px', color: '#fff' }}>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700
          }}>
            {event.category.toUpperCase()}
          </span>
          <h1 style={{ margin: '12px 0 4px', fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
            {event.title}
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>{event.description}</p>
        </div>

        <div style={{ padding: 28 }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            {[
              { icon: '📍', label: 'Location', value: event.location },
              { icon: '📅', label: 'Date & Time', value: new Date(event.eventDate).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }) },
              { icon: '🎫', label: 'Available Tickets', value: `${event.availableTickets} / ${event.totalTickets}`, color: event.availableTickets < 10 ? '#ef4444' : undefined },
              { icon: '💶', label: 'Price per Ticket', value: `€${event.ticketPrice}`, color: '#059669' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{icon} {label}</div>
                <div style={{ fontWeight: 700, color: color || '#0f172a', fontSize: 15 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Booking form */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              🎟️ Book Your Tickets
            </h3>

            {!isLoggedIn ? (
              <p style={{ color: '#64748b', margin: 0 }}>
                Please <strong>log in</strong> to book tickets for this event.
              </p>
            ) : isSoldOut ? (
              <p style={{ color: '#dc2626', fontWeight: 600, margin: 0 }}>This event is sold out.</p>
            ) : (
              <form onSubmit={handleBook}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>
                      Number of tickets
                    </label>
                    <input
                      type="number" min={1} max={event.availableTickets}
                      value={tickets}
                      onChange={e => setTickets(Math.max(1, Math.min(event.availableTickets, Number(e.target.value))))}
                      style={{ width: 70, padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total</div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: '#059669' }}>
                      €{(event.ticketPrice * tickets).toFixed(2)}
                    </div>
                  </div>
                  <button type="submit" style={{
                    marginLeft: 'auto',
                    background: '#1e40af',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 15
                  }}>
                    Book Now
                  </button>
                </div>
              </form>
            )}

            {bookingStatus && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 8,
                background: bookingStatus.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
                color: bookingStatus.startsWith('✅') ? '#15803d' : '#dc2626',
                fontWeight: 600,
                fontSize: 14
              }}>
                {bookingStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
