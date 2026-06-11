using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Services.TokenLogic;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EventBookingApi.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AuthController(
        UserManager<IdentityUser> userManager,
        AppDbContext context,
        TokenService tokenService,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _context = context;
        _tokenService = tokenService;
        _roleManager = roleManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegistrationRequestDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
            return BadRequest("User already exists.");

        var user = new IdentityUser
        {
            UserName = dto.Email,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // Assign default User role
        if (!await _roleManager.RoleExistsAsync("User"))
            await _roleManager.CreateAsync(new IdentityRole("User"));

        await _userManager.AddToRoleAsync(user, "User");

        return Ok("User registered successfully.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("No user found.");

        var validPassword = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!validPassword) return BadRequest("Invalid password.");

        var token = await _tokenService.CreateToken(user);
        await _context.SaveChangesAsync();

        return Ok(new LoginResponseDto
        {
            Token = token,
            UserName = user.UserName!,
            Email = user.Email!
        });
    }

    [HttpPost("role")]
    public async Task<IActionResult> CreateRole(string roleName)
    {
        if (await _roleManager.RoleExistsAsync(roleName))
            return BadRequest("Role already exists.");

        await _roleManager.CreateAsync(new IdentityRole(roleName));
        return Ok("Role created.");
    }

    [HttpPost("assign")]
    public async Task<IActionResult> AssignRole(string email, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(email)
            ?? throw new Exception("User not found.");

        if (!await _roleManager.RoleExistsAsync(roleName))
            throw new Exception("Role not found.");

        if (!await _userManager.IsInRoleAsync(user, roleName))
            await _userManager.AddToRoleAsync(user, roleName);

        return Ok("Role assigned.");
    }
}
