using System.Security.Claims;
using EventBookingApi.DTOs;
using EventBookingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventBookingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>Get all reviews for a specific event.</summary>
    [HttpGet("event/{eventId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetReviewsByEvent(int eventId)
    {
        return Ok(await _reviewService.GetReviewsByEvent(eventId));
    }

    /// <summary>Get all reviews written by the logged-in user.</summary>
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<List<ReviewDto>>> GetMyReviews()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        return Ok(await _reviewService.GetReviewsByUser(userId));
    }

    /// <summary>Get average rating for an event.</summary>
    [HttpGet("event/{eventId}/rating")]
    public async Task<ActionResult<double>> GetAverageRating(int eventId)
    {
        return Ok(await _reviewService.GetAverageRating(eventId));
    }

    /// <summary>Submit or update a review for an event.</summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<string>> CreateOrUpdateReview(CreateReviewDto dto)
    {
        var userId    = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userEmail = User.FindFirstValue(ClaimTypes.Email)
                     ?? User.FindFirstValue(ClaimTypes.Name)
                     ?? "Unknown";

        if (userId == null) return Unauthorized();

        try
        {
            await _reviewService.CreateOrUpdateReview(dto, userId, userEmail);
            return Ok("Review submitted successfully.");
        }
        catch (Exception e)
        {
            return BadRequest(new ProblemDetails { Detail = e.Message });
        }
    }

    /// <summary>Delete your review for an event.</summary>
    [HttpDelete("event/{eventId}")]
    [Authorize]
    public async Task<ActionResult<string>> DeleteReview(int eventId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            await _reviewService.DeleteReview(eventId, userId);
            return Ok("Review deleted.");
        }
        catch (Exception e)
        {
            return BadRequest(new ProblemDetails { Detail = e.Message });
        }
    }
}
