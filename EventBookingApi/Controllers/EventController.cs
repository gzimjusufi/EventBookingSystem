using EventBookingApi.DTOs;
using EventBookingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventBookingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    public async Task<ActionResult<List<EventDto>>> GetAllEvents()
    {
        return Ok(await _eventService.GetAllEvents());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventDto>> GetEventById(int id)
    {
        var evt = await _eventService.GetEventById(id);
        if (evt == null) return NotFound("Event not found.");
        return Ok(evt);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<EventDto>>> GetUpcomingEvents()
    {
        return Ok(await _eventService.GetUpcomingEvents());
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<List<EventDto>>> GetEventsByCategory(string category)
    {
        return Ok(await _eventService.GetEventsByCategory(category));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<string>> CreateEvent(CreateEventDto dto)
    {
        try
        {
            await _eventService.CreateEvent(dto);
            return Ok("Event created successfully.");
        }
        catch (Exception e)
        {
            return BadRequest(new ProblemDetails { Detail = e.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<string>> UpdateEvent(int id, UpdateEventDto dto)
    {
        try
        {
            await _eventService.UpdateEvent(id, dto);
            return Ok("Event updated successfully.");
        }
        catch (Exception e)
        {
            return BadRequest(new ProblemDetails { Detail = e.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<string>> DeleteEvent(int id)
    {
        await _eventService.DeleteEvent(id);
        return Ok("Event deleted successfully.");
    }
}
