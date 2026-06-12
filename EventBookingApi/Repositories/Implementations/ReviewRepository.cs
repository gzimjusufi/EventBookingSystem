using EventBookingApi.Data;
using EventBookingApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EventBookingApi.Repositories.Implementations;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Review>> GetReviewsByEvent(int eventId) =>
        await _context.Reviews
            .Include(r => r.Event)
            .Where(r => r.EventId == eventId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<List<Review>> GetReviewsByUser(string userId) =>
        await _context.Reviews
            .Include(r => r.Event)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<Review?> GetReview(int eventId, string userId) =>
        await _context.Reviews
            .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId);

    public async Task CreateReview(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateReview(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<double> GetAverageRating(int eventId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.EventId == eventId)
            .ToListAsync();

        return reviews.Count == 0 ? 0 : reviews.Average(r => r.Rating);
    }
}
