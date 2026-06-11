using EventBookingApi.DTOs;

namespace EventBookingApi.Services.Interfaces;

public interface IEventService
{
    Task<List<EventDto>> GetAllEvents();
    Task<EventDto?> GetEventById(int id);
    Task CreateEvent(CreateEventDto dto);
    Task UpdateEvent(int id, UpdateEventDto dto);
    Task DeleteEvent(int id);
    Task<List<EventDto>> GetEventsByCategory(string category);
    Task<List<EventDto>> GetUpcomingEvents();
}
