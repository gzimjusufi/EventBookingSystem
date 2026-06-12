import { useState } from 'react';
import { updateEvent } from '../services/api';

const CATEGORIES = ['Concert', 'Sport', 'Theatre', 'Festival', 'Conference'];

function toLocalDatetimeValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const minDateValue = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 16);
};

export default function EditEvent({ event, onUpdated, onCancel }) {
  const bookedTickets = event.totalTickets - event.availableTickets;

  const [form, setForm] = useState({
    title:        event.title        ?? '',
    description:  event.description  ?? '',
    location:     event.location     ?? '',
    eventDate:    toLocalDatetimeValue(event.eventDate),
    ticketPrice:  event.ticketPrice  ?? '',
    totalTickets: event.totalTickets ?? '',
    category:     event.category     ?? 'Concert',
  });
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      await updateEvent(event.id, {
        ...form,
        ticketPrice:  parseFloat(form.ticketPrice),
        totalTickets: parseInt(form.totalTickets),
        eventDate:    new Date(form.eventDate).toISOString(),
      });
      setStatus('success');
      setTimeout(() => onUpdated(), 1200);
    } catch (err) {
      setStatus('error:' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const label = text => (
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
      {text}
    </label>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4,
          background: 'linear-gradient(135deg, #f1f5f9, #f59e0b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Edit Event
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update the details for <strong style={{ color: 'var(--text-primary)' }}>{event.title}</strong></p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>
            {label('Event Title *')}
            <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Rock Night 2026" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              {label('Location *')}
              <input name="location" value={form.location} onChange={handleChange} required placeholder="City, Venue" />
            </div>
            <div>
              {label('Category *')}
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            {label('Date & Time *')}
            <input
              name="eventDate"
              type="datetime-local"
              value={form.eventDate}
              onChange={handleChange}
              min={minDateValue()}
              required
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Must be at least 2 days from today.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              {label('Ticket Price (€) *')}
              <input name="ticketPrice" type="number" min="0" step="0.01" value={form.ticketPrice} onChange={handleChange} required placeholder="0.00" />
            </div>
            <div>
              {label('Total Tickets *')}
              <input
                name="totalTickets"
                type="number"
                min={bookedTickets}
                value={form.totalTickets}
                onChange={handleChange}
                required
                placeholder="100"
              />
              {bookedTickets > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {bookedTickets} already booked — minimum is {bookedTickets}.
                </p>
              )}
            </div>
          </div>

          <div>
            {label('Description')}
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Describe the event..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '13px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: '13px',
              background: loading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 700, fontSize: 15,
              boxShadow: loading ? 'none' : '0 0 20px rgba(245,158,11,0.3)',
              transition: 'all 0.2s', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>

        {status === 'success' && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399', fontWeight: 600 }}>
            ✅ Event updated! Redirecting...
          </div>
        )}
        {status.startsWith('error:') && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            ❌ {status.replace('error:', '')}
          </div>
        )}
      </div>
    </div>
  );
}