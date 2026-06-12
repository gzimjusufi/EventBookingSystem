import { useState, useEffect } from 'react';
import { getEventById, createBooking, getReviewsByEvent, submitReview, deleteReview } from '../services/api';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? 16 : 24,
            cursor: readonly ? 'default' : 'pointer',
            color: star <= (hovered || value) ? '#f59e0b' : 'var(--text-muted)',
            transition: 'color 0.1s'
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function EventDetail({ id, user, onBack }) {
  const [event, setEvent]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [tickets, setTickets]           = useState(1);
  const [bookingStatus, setBookingStatus] = useState('');
  const [reviews, setReviews]           = useState([]);
  const [rating, setRating]             = useState(5);
  const [comment, setComment]           = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [tab, setTab]                   = useState('details'); // details | reviews

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [evt, revs] = await Promise.all([getEventById(id), getReviewsByEvent(id)]);
      setEvent(evt); setReviews(revs);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { setBookingStatus('error:Please log in to book tickets.'); return; }
    setBookingStatus('loading');
    try {
      await createBooking(id, tickets);
      setBookingStatus('success');
      load();
    } catch (err) { setBookingStatus('error:' + err.message); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewStatus('loading');
    try {
      await submitReview(id, rating, comment);
      setReviewStatus('success');
      setComment('');
      const revs = await getReviewsByEvent(id);
      setReviews(revs);
    } catch (err) { setReviewStatus('error:' + err.message); }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(id);
      const revs = await getReviewsByEvent(id);
      setReviews(revs);
      setReviewStatus('');
    } catch (err) { setReviewStatus('error:' + err.message); }
  };

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const isSoldOut = event?.availableTickets === 0;
  const userReview = reviews.find(r => r.userId === user?.id || r.userEmail === user?.email);

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>⏳ Loading...</div>;
  if (error)   return <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 16, color: '#f87171' }}>⚠️ {error}</div>;
  if (!event)  return null;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: 'var(--accent)',
        fontSize: 14, fontWeight: 600, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 6, padding: 0
      }}>← Back to Events</button>

      {/* Header card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{
              background: 'rgba(99,102,241,0.2)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)',
              padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700
            }}>{event.category.toUpperCase()}</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: '12px 0 8px', color: 'var(--text-primary)' }}>
              {event.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{event.description}</p>
          </div>
          {avgRating && (
            <div style={{ textAlign: 'center', background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fbbf24' }}>{avgRating}</div>
              <StarRating value={Math.round(avgRating)} readonly />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{reviews.length} reviews</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24,
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
        {['details', 'reviews'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px', border: 'none', borderRadius: 9,
            background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
            fontWeight: tab === t ? 700 : 400, fontSize: 14, transition: 'all 0.2s',
            boxShadow: tab === t ? '0 0 12px rgba(99,102,241,0.3)' : 'none'
          }}>
            {t === 'details' ? '📋 Details & Book' : `⭐ Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '📍', label: 'Location', value: event.location },
              { icon: '📅', label: 'Date & Time', value: new Date(event.eventDate).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }) },
              { icon: '🎫', label: 'Available', value: `${event.availableTickets} / ${event.totalTickets} tickets`, color: event.availableTickets < 10 ? '#f87171' : undefined },
              { icon: '💶', label: 'Price', value: `€${event.ticketPrice} per ticket`, color: '#34d399' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{icon} {label}</div>
                <div style={{ fontWeight: 700, color: color || 'var(--text-primary)', fontSize: 15 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Booking */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>🎟️ Book Tickets</h3>
            {!user ? (
              <p style={{ color: 'var(--text-secondary)' }}>Please <strong style={{ color: 'var(--accent)' }}>sign in</strong> to book tickets.</p>
            ) : isSoldOut ? (
              <p style={{ color: '#f87171', fontWeight: 600 }}>This event is sold out.</p>
            ) : (
              <form onSubmit={handleBook} style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Tickets</label>
                  <input type="number" min={1} max={event.availableTickets} value={tickets}
                    onChange={e => setTickets(Math.max(1, Math.min(event.availableTickets, Number(e.target.value))))}
                    style={{ width: 80 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
                  <div style={{ fontWeight: 800, fontSize: 24, color: '#34d399' }}>€{(event.ticketPrice * tickets).toFixed(2)}</div>
                </div>
                <button type="submit" style={{
                  padding: '11px 28px', marginLeft: 'auto',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: 15,
                  boxShadow: '0 0 20px rgba(99,102,241,0.3)'
                }}>Book Now</button>
              </form>
            )}
            {bookingStatus === 'success' && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399', fontWeight: 600 }}>✅ Booking confirmed!</div>
            )}
            {bookingStatus.startsWith?.('error:') && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171' }}>{bookingStatus.replace('error:', '')}</div>
            )}
          </div>
        </>
      )}

      {tab === 'reviews' && (
        <div>
          {/* Submit review */}
          {user && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>
                {userReview ? '✏️ Update Your Review' : '⭐ Write a Review'}
              </h3>
              <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Your Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Comment</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    rows={3} placeholder="Share your experience..." />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
                    boxShadow: '0 0 12px rgba(99,102,241,0.3)'
                  }}>Submit Review</button>
                  {userReview && (
                    <button type="button" onClick={handleDeleteReview} style={{
                      padding: '10px 20px',
                      background: 'rgba(239,68,68,0.1)', color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontWeight: 600
                    }}>Delete</button>
                  )}
                </div>
              </form>
              {reviewStatus === 'success' && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399', fontWeight: 600 }}>✅ Review submitted!</div>
              )}
              {reviewStatus.startsWith?.('error:') && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171' }}>{reviewStatus.replace('error:', '')}</div>
              )}
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff'
                      }}>{r.userEmail?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{r.userEmail}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={r.rating} readonly />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
