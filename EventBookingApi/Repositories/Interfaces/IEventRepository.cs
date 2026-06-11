using EventBookingApi.Data;

namespace EventBookingApi.Repositories.Interfaces;

public interface IEventRepository
{
    Task<List<Event>> GetAllEvents();
    Task<Event?> GetEventById(int id);
    Task CreateEvent(Event evt);
    Task UpdateEvent(Event evt);
    Task DeleteEvent(int id);
    Task<List<Event>> GetEventsByCategory(string category);
    Task<List<Event>> GetUpcomingEvents();
}
