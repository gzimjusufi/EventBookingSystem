using EventBookingApi.DTOs;

namespace EventBookingApi.Services.Interfaces;

public interface IBookingService
{
    Task<List<BookingDto>> GetAllBookings();
    Task<List<BookingDto>> GetBookingsByUser(string userId);
    Task<BookingDto?> GetBookingById(int id);
    Task CreateBooking(CreateBookingDto dto, string userId);
    Task CancelBooking(int id, string userId);
    Task<List<BookingDto>> GetBookingsByEvent(int eventId);
}
