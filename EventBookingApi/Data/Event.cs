using System.ComponentModel.DataAnnotations;

namespace EventBookingApi.Data;

public class Event
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; }

    [Required]
    public string Location { get; set; }

    [Required]
    public DateTime EventDate { get; set; }

    [Required]
    public decimal TicketPrice { get; set; }

    [Required]
    public int TotalTickets { get; set; }

    public int AvailableTickets { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } // Concert, Sport, Theatre, etc.

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
