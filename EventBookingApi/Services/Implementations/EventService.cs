using AutoMapper;
using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Repositories.Interfaces;
using EventBookingApi.Services.Interfaces;

namespace EventBookingApi.Services.Implementations;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;

    public EventService(IEventRepository eventRepository, IMapper mapper)
    {
        _eventRepository = eventRepository;
        _mapper = mapper;
    }

    public async Task<List<EventDto>> GetAllEvents()
    {
        var events = await _eventRepository.GetAllEvents();
        return _mapper.Map<List<EventDto>>(events);
    }

    public async Task<EventDto?> GetEventById(int id)
    {
        var evt = await _eventRepository.GetEventById(id);
        return evt == null ? null : _mapper.Map<EventDto>(evt);
    }

    public async Task CreateEvent(CreateEventDto dto)
    {
        if (dto.EventDate <= DateTime.UtcNow)
            throw new Exception("Event date must be in the future.");

        if (dto.TotalTickets <= 0)
            throw new Exception("Total tickets must be greater than zero.");

        if (dto.TicketPrice < 0)
            throw new Exception("Ticket price cannot be negative.");

        var evt = new Event
        {
            Title = dto.Title,
            Description = dto.Description,
            Location = dto.Location,
            EventDate = DateTime.SpecifyKind(dto.EventDate, DateTimeKind.Utc),
            TicketPrice = dto.TicketPrice,
            TotalTickets = dto.TotalTickets,
            AvailableTickets = dto.TotalTickets,
            Category = dto.Category,
            CreatedAt = DateTime.UtcNow
        };

        await _eventRepository.CreateEvent(evt);
    }

    public async Task UpdateEvent(int id, UpdateEventDto dto)
    {
        var evt = await _eventRepository.GetEventById(id)
            ?? throw new Exception("Event not found.");

        // Calculate how many tickets are already booked
        var bookedTickets = evt.TotalTickets - evt.AvailableTickets;

        // Prevent setting totalTickets below already booked amount
        if (dto.TotalTickets < bookedTickets)
            throw new Exception($"Cannot set total tickets below {bookedTickets} — that many are already booked.");

        if (dto.EventDate <= DateTime.UtcNow.AddDays(2))
            throw new Exception("Event date must be at least 2 days in the future.");

        evt.Title = dto.Title;
        evt.Description = dto.Description;
        evt.Location = dto.Location;
        evt.EventDate = dto.EventDate;
        evt.TicketPrice = dto.TicketPrice;
        evt.TotalTickets = dto.TotalTickets;
        evt.AvailableTickets = dto.TotalTickets - bookedTickets; 
        evt.Category = dto.Category;

        await _eventRepository.UpdateEvent(evt);
    }

    public async Task DeleteEvent(int id)
    {
        await _eventRepository.DeleteEvent(id);
    }

    public async Task<List<EventDto>> GetEventsByCategory(string category)
    {
        var events = await _eventRepository.GetEventsByCategory(category);
        return _mapper.Map<List<EventDto>>(events);
    }

    public async Task<List<EventDto>> GetUpcomingEvents()
    {
        var events = await _eventRepository.GetUpcomingEvents();
        return _mapper.Map<List<EventDto>>(events);
    }
}
