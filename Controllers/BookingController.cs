using EventBookingSystem.Domain.Entities;
using EventBookingSystem.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventBookingSystem.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{eventId}")]
        public async Task<IActionResult> Book(
            Guid eventId,
            int quantity)
        {
            var ev =
                await _context.Events.FindAsync(eventId);

            if (ev == null)
                return NotFound();

            if (ev.AvailableTickets < quantity)
                return BadRequest("Not enough tickets");

            ev.AvailableTickets -= quantity;

            var booking = new Booking
            {
                EventId = eventId,
                Quantity = quantity,
                UserId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier)!,
                BookingDate = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);

            await _context.SaveChangesAsync();

            return Ok(booking);
        }
    }
}
