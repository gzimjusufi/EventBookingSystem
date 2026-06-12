using EventBookingApi.DTOs;

namespace EventBookingApi.Services.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> GetReviewsByEvent(int eventId);
    Task<List<ReviewDto>> GetReviewsByUser(string userId);
    Task CreateOrUpdateReview(CreateReviewDto dto, string userId, string userEmail);
    Task DeleteReview(int eventId, string userId);
    Task<double> GetAverageRating(int eventId);
}
