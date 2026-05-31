using Microsoft.AspNetCore.Identity;

namespace EventBookingSystem.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public ICollection<Booking> Bookings { get; set; }
        = new List<Booking>();
}
