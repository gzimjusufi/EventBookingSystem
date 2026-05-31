using EventBookingSystem.Domain.Entities;
using EventBookingSystem.DTOs.Auth;
using EventBookingSystem.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EventBookingSystem.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtService _jwtService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IJwtService jwtService)
        {
            _userManager = userManager;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                FullName = dto.FullName,
                UserName = dto.Email,
                Email = dto.Email
            };

            var result =
                await _userManager.CreateAsync(
                    user,
                    dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(
                user,
                "User");

            return Ok();
        }
    }
}
