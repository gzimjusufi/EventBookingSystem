namespace EventBookingSystem.Domain.Entities;

public class Event
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime EventDate { get; set; }

    public string Location { get; set; } = string.Empty;

    public decimal TicketPrice { get; set; }

    public int TotalTickets { get; set; }

    public int AvailableTickets { get; set; }

    public ICollection<Booking> Bookings { get; set; }
        = new List<Booking>();
}