import { useState } from 'react';
import { createEvent } from '../services/api';

const CATEGORIES = ['Concert', 'Sport', 'Theatre', 'Festival', 'Conference'];

export default function AddEvent({ onCreated }) {
  const [form, setForm]     = useState({ title: '', description: '', location: '', eventDate: '', ticketPrice: '', totalTickets: '', category: 'Concert' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      await createEvent({
        ...form,
        ticketPrice:  parseFloat(form.ticketPrice),
        totalTickets: parseInt(form.totalTickets),
        eventDate:    new Date(form.eventDate).toISOString(),
      });
      setStatus('success');
      setForm({ title: '', description: '', location: '', eventDate: '', ticketPrice: '', totalTickets: '', category: 'Concert' });
    } catch (err) {
      setStatus('error:' + err.message);
    } finally { setLoading(false); }
  };

  const label = (text) => (
    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
      {text}
    </label>
  );

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4,
          background: 'linear-gradient(135deg, #f1f5f9, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create Event
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Add a new event for users to discover and book</p>
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
            <input name="eventDate" type="datetime-local" value={form.eventDate} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              {label('Ticket Price (€) *')}
              <input name="ticketPrice" type="number" min="0" step="0.01" value={form.ticketPrice} onChange={handleChange} required placeholder="0.00" />
            </div>
            <div>
              {label('Total Tickets *')}
              <input name="totalTickets" type="number" min="1" value={form.totalTickets} onChange={handleChange} required placeholder="100" />
            </div>
          </div>

          <div>
            {label('Description')}
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the event..." style={{ resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '13px',
            background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: 15,
            boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
            transition: 'all 0.2s'
          }}>
            {loading ? 'Creating...' : '✨ Create Event'}
          </button>
        </form>

        {status === 'success' && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399', fontWeight: 600 }}>
            ✅ Event created!{' '}
            <button onClick={onCreated} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>
              View all events
            </button>
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
