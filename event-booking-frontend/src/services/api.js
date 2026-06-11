const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ── Auth ──────────────────────────────────────────────
export async function register(email, password) {
  const res = await fetch(`${BASE_URL}/Auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Events ────────────────────────────────────────────
export async function getAllEvents() {
  const res = await fetch(`${BASE_URL}/Event`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function getUpcomingEvents() {
  const res = await fetch(`${BASE_URL}/Event/upcoming`);
  if (!res.ok) throw new Error('Failed to fetch upcoming events');
  return res.json();
}

export async function getEventById(id) {
  const res = await fetch(`${BASE_URL}/Event/${id}`);
  if (!res.ok) throw new Error('Event not found');
  return res.json();
}

export async function getEventsByCategory(category) {
  const res = await fetch(`${BASE_URL}/Event/category/${category}`);
  if (!res.ok) throw new Error('Failed to fetch events by category');
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/Event`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

export async function deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/Event/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete event');
  return res.text();
}

// ── Bookings ──────────────────────────────────────────
export async function getMyBookings() {
  const res = await fetch(`${BASE_URL}/Booking/my`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function createBooking(eventId, numberOfTickets) {
  const res = await fetch(`${BASE_URL}/Booking`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ eventId, numberOfTickets })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

export async function cancelBooking(id) {
  const res = await fetch(`${BASE_URL}/Booking/${id}/cancel`, {
    method: 'PUT',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}
