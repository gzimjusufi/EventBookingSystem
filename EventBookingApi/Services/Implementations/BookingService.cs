using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Repositories.Interfaces;
using EventBookingApi.Services.Interfaces;

namespace EventBookingApi.Services.Implementations;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IEventRepository _eventRepository;

    public BookingService(IBookingRepository bookingRepository, IEventRepository eventRepository)
    {
        _bookingRepository = bookingRepository;
        _eventRepository = eventRepository;
    }

    public async Task<List<BookingDto>> GetAllBookings()
    {
        var bookings = await _bookingRepository.GetAllBookings();
        return bookings.Select(MapToDto).ToList();
    }

    public async Task<List<BookingDto>> GetBookingsByUser(string userId)
    {
        var bookings = await _bookingRepository.GetBookingsByUser(userId);
        return bookings.Select(MapToDto).ToList();
    }

    public async Task<BookingDto?> GetBookingById(int id)
    {
        var booking = await _bookingRepository.GetBookingById(id);
        return booking == null ? null : MapToDto(booking);
    }

    public async Task CreateBooking(CreateBookingDto dto, string userId)
    {
        var evt = await _eventRepository.GetEventById(dto.EventId)
            ?? throw new Exception("Event not found.");

        if (evt.EventDate <= DateTime.UtcNow)
            throw new Exception("Cannot book a past event.");

        if (dto.NumberOfTickets <= 0)
            throw new Exception("Number of tickets must be at least 1.");

        if (evt.AvailableTickets < dto.NumberOfTickets)
            throw new Exception($"Only {evt.AvailableTickets} tickets available.");

        evt.AvailableTickets -= dto.NumberOfTickets;
        await _eventRepository.UpdateEvent(evt);

        var booking = new Booking
        {
            UserId = userId,
            EventId = dto.EventId,
            NumberOfTickets = dto.NumberOfTickets,
            TotalPrice = evt.TicketPrice * dto.NumberOfTickets,
            Status = "Confirmed",
            BookedAt = DateTime.UtcNow
        };

        await _bookingRepository.CreateBooking(booking);
    }

    public async Task CancelBooking(int id, string userId)
    {
        var booking = await _bookingRepository.GetBookingById(id)
            ?? throw new Exception("Booking not found.");

        if (booking.UserId != userId)
            throw new Exception("You can only cancel your own bookings.");

        if (booking.Status == "Cancelled")
            throw new Exception("Booking is already cancelled.");

        // Return tickets to event
        var evt = await _eventRepository.GetEventById(booking.EventId);
        if (evt != null)
        {
            evt.AvailableTickets += booking.NumberOfTickets;
            await _eventRepository.UpdateEvent(evt);
        }

        booking.Status = "Cancelled";
        await _bookingRepository.UpdateBooking(booking);
    }

    public async Task<List<BookingDto>> GetBookingsByEvent(int eventId)
    {
        var bookings = await _bookingRepository.GetBookingsByEvent(eventId);
        return bookings.Select(MapToDto).ToList();
    }

    private static BookingDto MapToDto(Booking b) => new()
    {
        Id = b.Id,
        UserId = b.UserId,
        EventId = b.EventId,
        EventTitle = b.Event?.Title ?? "",
        NumberOfTickets = b.NumberOfTickets,
        TotalPrice = b.TotalPrice,
        Status = b.Status,
        BookedAt = b.BookedAt
    };
}
