using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventBookingApi.Data;

/// <summary>
/// Represents a user review and rating for an event.
/// </summary>
public class Review
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [Required]
    public string UserEmail { get; set; }

    [Required]
    public int EventId { get; set; }

    [ForeignKey("EventId")]
    public Event Event { get; set; }

    /// <summary>Rating from 1 to 5 stars.</summary>
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
