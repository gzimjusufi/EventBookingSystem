using System.ComponentModel.DataAnnotations;

namespace EventBookingApi.DTOs;

public class EventDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime EventDate { get; set; }
    public decimal TicketPrice { get; set; }
    public int TotalTickets { get; set; }
    public int AvailableTickets { get; set; }
    public string Category { get; set; }
}

public class CreateEventDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime EventDate { get; set; }
    public decimal TicketPrice { get; set; }
    public int TotalTickets { get; set; }
    public string Category { get; set; }
}

public class UpdateEventDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime EventDate { get; set; }
    public decimal TicketPrice { get; set; }
    public int TotalTickets { get; set; }
    public string Category { get; set; }
}

public class BookingDto
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int EventId { get; set; }
    public string EventTitle { get; set; }
    public int NumberOfTickets { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; }
    public DateTime BookedAt { get; set; }
}

public class CreateBookingDto
{
    public int EventId { get; set; }
    public int NumberOfTickets { get; set; }
}

public class RegistrationRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}

public class LoginRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class LoginResponseDto
{
    public string Token { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
}
