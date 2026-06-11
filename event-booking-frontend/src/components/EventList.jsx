import { useState, useEffect } from 'react';
import { getAllEvents, getEventsByCategory } from '../services/api';

const CATEGORIES = ['All', 'Concert', 'Sport', 'Theatre', 'Festival', 'Conference'];

// Category colors for badges
const CAT_COLORS = {
  Concert:    { bg: '#dbeafe', color: '#1d4ed8' },
  Sport:      { bg: '#dcfce7', color: '#15803d' },
  Theatre:    { bg: '#fae8ff', color: '#7e22ce' },
  Festival:   { bg: '#ffedd5', color: '#c2410c' },
  Conference: { bg: '#f0fdf4', color: '#166534' },
};

function EventList({ onSelect }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetcher = category === 'All' ? getAllEvents() : getEventsByCategory(category);
    fetcher
      .then(data => { setEvents(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [category]);

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
          Upcoming Events
        </h1>
        <p style={{ margin: 0, color: '#64748b' }}>Browse and book tickets for events near you</p>
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍  Search by title or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 14,
            background: '#fff',
            outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '8px 16px',
              background: category === cat ? '#1e40af' : '#fff',
              color: category === cat ? '#fff' : '#374151',
              border: '1px solid ' + (category === cat ? '#1e40af' : '#e5e7eb'),
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: category === cat ? 600 : 400,
              transition: 'all 0.15s'
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading events...
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, color: '#dc2626' }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎭</div>
          <p style={{ fontSize: 16 }}>No events found.</p>
        </div>
      )}

      {/* Event cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map(event => {
          const catStyle = CAT_COLORS[event.category] || { bg: '#f3f4f6', color: '#374151' };
          const isSoldOut = event.availableTickets === 0;
          return (
            <div key={event.id} style={{
              background: '#fff',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.15s, box-shadow 0.15s',
              opacity: isSoldOut ? 0.75 : 1
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
            >
              {/* Colour strip based on category */}
              <div style={{
                height: 6,
                background: catStyle.color,
                opacity: 0.7
              }} />

              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    background: catStyle.bg, color: catStyle.color,
                    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700
                  }}>
                    {event.category.toUpperCase()}
                  </span>
                  {isSoldOut && (
                    <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                      SOLD OUT
                    </span>
                  )}
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                  {event.title}
                </h3>
                <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
                  {event.description?.slice(0, 80)}{event.description?.length > 80 ? '…' : ''}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>📍 {event.location}</span>
                  <span style={{ fontSize: 13, color: '#475569' }}>📅 {new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span style={{ fontSize: 13, color: event.availableTickets < 10 ? '#ef4444' : '#475569' }}>
                    🎫 {event.availableTickets} tickets left
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 20, color: '#059669' }}>
                    €{event.ticketPrice}
                  </span>
                  <button onClick={() => onSelect(event.id)} style={{
                    background: isSoldOut ? '#e5e7eb' : '#1e40af',
                    color: isSoldOut ? '#9ca3af' : '#fff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: 8,
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 13
                  }}>
                    {isSoldOut ? 'Sold Out' : 'View Details →'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventList;
