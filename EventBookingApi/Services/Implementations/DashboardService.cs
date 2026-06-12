using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EventBookingApi.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;

    public DashboardService(AppDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<DashboardDto> GetDashboard()
    {
        var now = DateTime.UtcNow;

        var totalEvents      = await _context.Events.CountAsync();
        var totalBookings    = await _context.Bookings.CountAsync();
        var confirmedBookings = await _context.Bookings.CountAsync(b => b.Status == "Confirmed");
        var cancelledBookings = await _context.Bookings.CountAsync(b => b.Status == "Cancelled");
        var upcomingEvents   = await _context.Events.CountAsync(e => e.EventDate > now);
        var totalRevenue     = await _context.Bookings
            .Where(b => b.Status == "Confirmed")
            .SumAsync(b => b.TotalPrice);
        var totalUsers       = _userManager.Users.Count();
        var avgRating        = await _context.Reviews.AnyAsync()
            ? await _context.Reviews.AverageAsync(r => (double)r.Rating)
            : 0;

        // Recent 5 bookings
        var recentBookings = await _context.Bookings
            .Include(b => b.Event)
            .OrderByDescending(b => b.BookedAt)
            .Take(5)
            .ToListAsync();

        // Top 5 events by bookings
        var topEvents = await _context.Events
            .Select(e => new TopEventDto
            {
                Id           = e.Id,
                Title        = e.Title,
                Category     = e.Category,
                TotalBookings = e.Id > 0
                    ? _context.Bookings.Count(b => b.EventId == e.Id && b.Status == "Confirmed")
                    : 0,
                Revenue = e.Id > 0
                    ? _context.Bookings
                        .Where(b => b.EventId == e.Id && b.Status == "Confirmed")
                        .Sum(b => b.TotalPrice)
                    : 0,
                AverageRating = _context.Reviews.Any(r => r.EventId == e.Id)
                    ? _context.Reviews.Where(r => r.EventId == e.Id).Average(r => (double)r.Rating)
                    : 0
            })
            .OrderByDescending(e => e.TotalBookings)
            .Take(5)
            .ToListAsync();

        // Get user emails for recent bookings
        var recentBookingDtos = new List<RecentBookingDto>();
        foreach (var b in recentBookings)
        {
            var user = await _userManager.FindByIdAsync(b.UserId);
            recentBookingDtos.Add(new RecentBookingDto
            {
                Id              = b.Id,
                UserEmail       = user?.Email ?? "Unknown",
                EventTitle      = b.Event?.Title ?? "",
                NumberOfTickets = b.NumberOfTickets,
                TotalPrice      = b.TotalPrice,
                Status          = b.Status,
                BookedAt        = b.BookedAt
            });
        }

        return new DashboardDto
        {
            TotalEvents       = totalEvents,
            TotalBookings     = totalBookings,
            TotalUsers        = totalUsers,
            TotalRevenue      = totalRevenue,
            ConfirmedBookings = confirmedBookings,
            CancelledBookings = cancelledBookings,
            UpcomingEvents    = upcomingEvents,
            AverageRating     = Math.Round(avgRating, 1),
            RecentBookings    = recentBookingDtos,
            TopEvents         = topEvents
        };
    }
}
