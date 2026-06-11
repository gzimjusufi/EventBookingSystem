using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace EventBookingApi.Services.TokenLogic;

public class TokenService
{
    private const int ExpirationMinutes = 60;
    private readonly UserManager<IdentityUser> _userManager;

    public TokenService(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<string> CreateToken(IdentityUser user)
    {
        var expiration = DateTime.UtcNow.AddMinutes(ExpirationMinutes);
        var roles = await _userManager.GetRolesAsync(user);

        var token = new JwtSecurityToken(
            issuer: "EventBookingIssuer",
            audience: "EventBookingAudience",
            expires: expiration,
            claims: CreateClaims(user, roles),
            signingCredentials: CreateSigningCredentials()
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static List<Claim> CreateClaims(IdentityUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(ClaimTypes.Email, user.Email!)
        };

        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        return claims;
    }

    private static SigningCredentials CreateSigningCredentials() =>
        new SigningCredentials(
            new SymmetricSecurityKey(
                Convert.FromBase64String("RXZlbnRCb29raW5nU2VjcmV0S2V5Rm9ySldUMTIzNDU2Nzg=")),
            SecurityAlgorithms.HmacSha256);
}
