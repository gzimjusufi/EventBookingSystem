using EventBookingSystem.Domain.Entities;
using EventBookingSystem.DTOs.Event;
using EventBookingSystem.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventBookingSystem.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventsController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Events.ToListAsync());
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateEventDto dto)
        {
            var ev = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                EventDate = dto.EventDate,
                Location = dto.Location,
                TicketPrice = dto.TicketPrice,
                TotalTickets = dto.TotalTickets,
                AvailableTickets = dto.TotalTickets
            };

            _context.Events.Add(ev);

            await _context.SaveChangesAsync();

            return Ok(ev);
        }
    }
}
