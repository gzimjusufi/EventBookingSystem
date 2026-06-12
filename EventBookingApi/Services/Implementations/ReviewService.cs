using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Repositories.Interfaces;
using EventBookingApi.Services.Interfaces;

namespace EventBookingApi.Services.Implementations;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IBookingRepository _bookingRepository;

    public ReviewService(
        IReviewRepository reviewRepository,
        IEventRepository eventRepository,
        IBookingRepository bookingRepository)
    {
        _reviewRepository = reviewRepository;
        _eventRepository = eventRepository;
        _bookingRepository = bookingRepository;
    }

    public async Task<List<ReviewDto>> GetReviewsByEvent(int eventId)
    {
        var reviews = await _reviewRepository.GetReviewsByEvent(eventId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetReviewsByUser(string userId)
    {
        var reviews = await _reviewRepository.GetReviewsByUser(userId);
        return reviews.Select(MapToDto).ToList();
    }

    public async Task CreateOrUpdateReview(CreateReviewDto dto, string userId, string userEmail)
    {
        // Verify the event exists
        var evt = await _eventRepository.GetEventById(dto.EventId)
            ?? throw new Exception("Event not found.");

        // Only allow reviews for past events
        if (evt.EventDate > DateTime.UtcNow)
            throw new Exception("You can only review events that have already taken place.");

        // Check user has a confirmed booking for this event
        var bookings = await _bookingRepository.GetBookingsByUser(userId);
        var hasBooking = bookings.Any(b => b.EventId == dto.EventId && b.Status == "Confirmed");
        if (!hasBooking)
            throw new Exception("You can only review events you have attended.");

        // Create or update (one review per user per event)
        var existing = await _reviewRepository.GetReview(dto.EventId, userId);
        if (existing != null)
        {
            existing.Rating  = dto.Rating;
            existing.Comment = dto.Comment;
            await _reviewRepository.UpdateReview(existing);
        }
        else
        {
            var review = new Review
            {
                UserId    = userId,
                UserEmail = userEmail,
                EventId   = dto.EventId,
                Rating    = dto.Rating,
                Comment   = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };
            await _reviewRepository.CreateReview(review);
        }
    }

    public async Task DeleteReview(int eventId, string userId)
    {
        var review = await _reviewRepository.GetReview(eventId, userId)
            ?? throw new Exception("Review not found.");
        await _reviewRepository.DeleteReview(review.Id);
    }

    public async Task<double> GetAverageRating(int eventId) =>
        await _reviewRepository.GetAverageRating(eventId);

    private static ReviewDto MapToDto(Review r) => new()
    {
        Id         = r.Id,
        UserId     = r.UserId,
        UserEmail  = r.UserEmail,
        EventId    = r.EventId,
        EventTitle = r.Event?.Title ?? "",
        Rating     = r.Rating,
        Comment    = r.Comment,
        CreatedAt  = r.CreatedAt
    };
}
