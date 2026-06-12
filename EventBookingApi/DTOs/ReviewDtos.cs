using System.ComponentModel.DataAnnotations;

namespace EventBookingApi.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string UserEmail { get; set; }
    public int EventId { get; set; }
    public string EventTitle { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    public int EventId { get; set; }

    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; }
}

public class DashboardDto
{
    public int TotalEvents { get; set; }
    public int TotalBookings { get; set; }
    public int TotalUsers { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ConfirmedBookings { get; set; }
    public int CancelledBookings { get; set; }
    public int UpcomingEvents { get; set; }
    public double AverageRating { get; set; }
    public List<RecentBookingDto> RecentBookings { get; set; } = new();
    public List<TopEventDto> TopEvents { get; set; } = new();
}

public class RecentBookingDto
{
    public int Id { get; set; }
    public string UserEmail { get; set; }
    public string EventTitle { get; set; }
    public int NumberOfTickets { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; }
    public DateTime BookedAt { get; set; }
}

public class TopEventDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Category { get; set; }
    public int TotalBookings { get; set; }
    public decimal Revenue { get; set; }
    public double AverageRating { get; set; }
}
