namespace EventBookingSystem.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public ApplicationUser User { get; set; }

    public Guid EventId { get; set; }

    public Event Event { get; set; }

    public int Quantity { get; set; }

    public DateTime BookingDate { get; set; }

    public string Status { get; set; } = "Active";
}