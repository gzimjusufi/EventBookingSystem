using EventBookingApi.Data;

namespace EventBookingApi.Repositories.Interfaces;

public interface IBookingRepository
{
    Task<List<Booking>> GetAllBookings();
    Task<List<Booking>> GetBookingsByUser(string userId);
    Task<Booking?> GetBookingById(int id);
    Task CreateBooking(Booking booking);
    Task UpdateBooking(Booking booking);
    Task<List<Booking>> GetBookingsByEvent(int eventId);
}
