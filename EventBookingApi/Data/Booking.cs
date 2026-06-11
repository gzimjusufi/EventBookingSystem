using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventBookingApi.Data;

public class Booking
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [Required]
    public int EventId { get; set; }

    [ForeignKey("EventId")]
    public Event Event { get; set; }

    [Required]
    public int NumberOfTickets { get; set; }

    [Required]
    public decimal TotalPrice { get; set; }

    public string Status { get; set; } = "Confirmed"; // Confirmed, Cancelled

    public DateTime BookedAt { get; set; } = DateTime.UtcNow;
}
