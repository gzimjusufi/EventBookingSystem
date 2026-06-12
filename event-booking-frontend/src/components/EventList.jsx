import { useState, useEffect } from 'react';
import { getAllEvents, getEventsByCategory } from '../services/api';

const CATEGORIES = ['All', 'Concert', 'Sport', 'Theatre', 'Festival', 'Conference'];

const CAT_COLORS = {
  Concert:    { accent: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)'  },
  Sport:      { accent: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  Theatre:    { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)'  },
  Festival:   { accent: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  Conference: { accent: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
};

function EventCard({ event, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const cat = CAT_COLORS[event.category] || { accent: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' };
  const isSoldOut = event.availableTickets === 0;
  const isLowStock = event.availableTickets > 0 && event.availableTickets <= 10;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? cat.border : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cat.border}` : 'var(--shadow-sm)',
        opacity: isSoldOut ? 0.6 : 1,
        cursor: 'pointer'
      }}
      onClick={() => onSelect(event.id)}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.accent}, transparent)` }} />

      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{
            background: cat.bg, color: cat.accent,
            border: `1px solid ${cat.border}`,
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
          }}>
            {event.category.toUpperCase()}
          </span>
          {isSoldOut && (
            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.3)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              SOLD OUT
            </span>
          )}
          {isLowStock && !isSoldOut && (
            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.3)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
              ALMOST GONE
            </span>
          )}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
          {[
            ['📍', event.location],
            ['📅', new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
            ['🎫', `${event.availableTickets} of ${event.totalTickets} tickets left`],
          ].map(([icon, text]) => (
            <span key={icon} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{icon} {text}</span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 22, color: '#34d399' }}>€{event.ticketPrice}</span>
          <button style={{
            background: isSoldOut ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${cat.accent}, ${cat.accent}cc)`,
            color: isSoldOut ? 'var(--text-muted)' : '#fff',
            border: 'none', padding: '8px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            boxShadow: isSoldOut ? 'none' : `0 0 12px ${cat.accent}40`,
            cursor: isSoldOut ? 'not-allowed' : 'pointer'
          }}>
            {isSoldOut ? 'Sold Out' : 'View →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventList({ onSelect }) {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    setLoading(true);
    (category === 'All' ? getAllEvents() : getEventsByCategory(category))
      .then(data => { setEvents(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [category]);

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <div style={{
        textAlign: 'center', marginBottom: 48, padding: '20px 0 8px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <h1 style={{
          fontSize: 42, fontWeight: 900, letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #f1f5f9 30%, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 12
        }}>
          Discover Events
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
          Browse concerts, sports, theatre and more — book your tickets in seconds
        </p>

        {/* Search */}
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events or locations..."
            style={{ paddingLeft: 40, background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 18px',
            background: category === cat ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-card)',
            color: category === cat ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${category === cat ? 'transparent' : 'var(--border)'}`,
            borderRadius: 20, fontSize: 13, fontWeight: category === cat ? 700 : 400,
            transition: 'all 0.15s',
            boxShadow: category === cat ? '0 0 12px rgba(99,102,241,0.3)' : 'none'
          }}>{cat}</button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
          Loading events...
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: 16, color: '#f87171' }}>⚠️ {error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎭</div>
          <p style={{ fontSize: 16 }}>No events found.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map(event => (
          <EventCard key={event.id} event={event} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
