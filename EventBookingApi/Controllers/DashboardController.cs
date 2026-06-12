using EventBookingApi.DTOs;
using EventBookingApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventBookingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>Get full admin dashboard statistics.</summary>
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        return Ok(await _dashboardService.GetDashboard());
    }
}
