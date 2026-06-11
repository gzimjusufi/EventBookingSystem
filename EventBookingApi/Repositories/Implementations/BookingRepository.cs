using EventBookingApi.Data;
using EventBookingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EventBookingApi.Repositories.Implementations;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _context;

    public BookingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Booking>> GetAllBookings()
    {
        return await _context.Bookings.Include(b => b.Event).ToListAsync();
    }

    public async Task<List<Booking>> GetBookingsByUser(string userId)
    {
        return await _context.Bookings
            .Include(b => b.Event)
            .Where(b => b.UserId == userId)
            .ToListAsync();
    }

    public async Task<Booking?> GetBookingById(int id)
    {
        return await _context.Bookings.Include(b => b.Event).FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task CreateBooking(Booking booking)
    {
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateBooking(Booking booking)
    {
        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Booking>> GetBookingsByEvent(int eventId)
    {
        return await _context.Bookings
            .Include(b => b.Event)
            .Where(b => b.EventId == eventId)
            .ToListAsync();
    }
}
