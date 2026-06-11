using EventBookingApi.Data;
using EventBookingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EventBookingApi.Repositories.Implementations;

public class EventRepository : IEventRepository
{
    private readonly AppDbContext _context;

    public EventRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Event>> GetAllEvents()
    {
        return await _context.Events.ToListAsync();
    }

    public async Task<Event?> GetEventById(int id)
    {
        return await _context.Events.FindAsync(id);
    }

    public async Task CreateEvent(Event evt)
    {
        _context.Events.Add(evt);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateEvent(Event evt)
    {
        _context.Events.Update(evt);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteEvent(int id)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt != null)
        {
            _context.Events.Remove(evt);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<Event>> GetEventsByCategory(string category)
    {
        return await _context.Events
            .Where(e => e.Category.ToLower() == category.ToLower())
            .ToListAsync();
    }

    public async Task<List<Event>> GetUpcomingEvents()
    {
        return await _context.Events
            .Where(e => e.EventDate > DateTime.UtcNow)
            .OrderBy(e => e.EventDate)
            .ToListAsync();
    }
}
