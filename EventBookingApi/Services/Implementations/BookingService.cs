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

        // 1. Max 4 tickets per user per event
        var existingBookings = await _bookingRepository.GetBookingsByEvent(dto.EventId);
        var userTicketsForEvent = existingBookings
            .Where(b => b.UserId == userId && b.Status != "Cancelled")
            .Sum(b => b.NumberOfTickets);

        if (userTicketsForEvent + dto.NumberOfTickets > 4)
            throw new Exception($"You can only hold up to 4 tickets per event. You already have {userTicketsForEvent}.");

        // 2. No overlapping events on the same day
        var userBookings = await _bookingRepository.GetBookingsByUser(userId);
        bool hasConflict = userBookings.Any(b =>
            b.Status != "Cancelled" &&
            b.EventId != dto.EventId &&
            b.Event != null &&
            b.Event.EventDate.Date == evt.EventDate.Date &&
            Math.Abs((b.Event.EventDate - evt.EventDate).TotalHours) < 2
        );

        if (hasConflict)
            throw new Exception("You already have a booking for another event within 2 hours of this one.");

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
