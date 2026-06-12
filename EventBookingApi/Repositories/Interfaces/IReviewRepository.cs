using EventBookingApi.Data;

namespace EventBookingApi.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<List<Review>> GetReviewsByEvent(int eventId);
    Task<List<Review>> GetReviewsByUser(string userId);
    Task<Review?> GetReview(int eventId, string userId);
    Task CreateReview(Review review);
    Task UpdateReview(Review review);
    Task DeleteReview(int id);
    Task<double> GetAverageRating(int eventId);
}
