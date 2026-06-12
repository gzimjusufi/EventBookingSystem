using EventBookingApi.DTOs;

namespace EventBookingApi.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboard();
}
