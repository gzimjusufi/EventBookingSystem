using System.Security.Claims;
using EventBookingApi.DTOs;
using EventBookingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventBookingApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<BookingDto>>> GetAllBookings()
    {
        return Ok(await _bookingService.GetAllBookings());
    }

    [HttpGet("my")]
    public async Task<ActionResult<List<BookingDto>>> GetMyBookings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        return Ok(await _bookingService.GetBookingsByUser(userId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetBookingById(int id)
    {
        var booking = await _bookingService.GetBookingById(id);
        if (booking == null) return NotFound("Booking not found.");
        return Ok(booking);
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateBooking(CreateBookingDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            await _bookingService.CreateBooking(dto, userId);
            return Ok("Booking confirmed successfully.");
        }
        catch (Exception e)
        {
            return BadRequest(new ProblemDetails { Detail = e.Message });
        }
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<string>> CancelBooking(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            await _bookingService.CancelBooking(id, userId);
            return Ok("Booking cancelled successfully.");
        }
        catch (Exception e)
        {
            return BadRequest(new ProblemDetails { Detail = e.Message });
        }
    }

    [HttpGet("event/{eventId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<BookingDto>>> GetBookingsByEvent(int eventId)
    {
        return Ok(await _bookingService.GetBookingsByEvent(eventId));
    }
}
