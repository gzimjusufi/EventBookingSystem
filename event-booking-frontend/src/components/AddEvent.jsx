import { useState } from 'react';
import { createEvent } from '../services/api';

const CATEGORIES = ['Concert', 'Sport', 'Theatre', 'Festival', 'Conference'];

function AddEvent({ onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    eventDate: '', ticketPrice: '', totalTickets: '', category: 'Concert',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      await createEvent({
        ...form,
        ticketPrice: parseFloat(form.ticketPrice),
        totalTickets: parseInt(form.totalTickets),
        eventDate: new Date(form.eventDate).toISOString(),
      });
      setStatus('success');
      setForm({ title: '', description: '', location: '', eventDate: '', ticketPrice: '', totalTickets: '', category: 'Concert' });
    } catch (err) {
      setStatus(`error:${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 14,
    boxSizing: 'border-box', outline: 'none', background: '#fff'
  };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Add New Event</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Create a new event for users to book</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 18 }}>

            <div>
              <label style={labelStyle}>Event Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Rock Night at SEEU" required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Location *</label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="City, Venue" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Date & Time *</label>
              <input name="eventDate" type="datetime-local" value={form.eventDate}
                onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Ticket Price (€) *</label>
                <input name="ticketPrice" type="number" min="0" step="0.01"
                  value={form.ticketPrice} onChange={handleChange}
                  placeholder="0.00" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Total Tickets *</label>
                <input name="totalTickets" type="number" min="1"
                  value={form.totalTickets} onChange={handleChange}
                  placeholder="100" required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe the event..."
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? '#93c5fd' : '#1e40af',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15
            }}>
              {loading ? 'Creating...' : '✨ Create Event'}
            </button>
          </div>
        </form>

        {status === 'success' && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: '#f0fdf4', color: '#15803d', fontWeight: 600, border: '1px solid #bbf7d0' }}>
            ✅ Event created successfully!{' '}
            <button onClick={onCreated} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>
              View all events
            </button>
          </div>
        )}
        {status.startsWith('error:') && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontWeight: 600, border: '1px solid #fecaca' }}>
            ❌ {status.replace('error:', '')}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddEvent;
