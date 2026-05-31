using EventBookingSystem.Domain.Entities;

namespace EventBookingSystem.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(ApplicationUser user, IList<string> roles);
    }
}
