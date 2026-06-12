using EventBookingApi.Data;
using EventBookingApi.Mappings;
using EventBookingApi.Repositories.Implementations;
using EventBookingApi.Repositories.Interfaces;
using EventBookingApi.Services.Implementations;
using EventBookingApi.Services.Interfaces;
using EventBookingApi.Services.TokenLogic;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace EventBookingApi;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Database
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        // AutoMapper
        builder.Services.AddAutoMapper(typeof(MappingProfile));

        // Repositories
        builder.Services.AddScoped<IEventRepository, EventRepository>();
        builder.Services.AddScoped<IBookingRepository, BookingRepository>();
        builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

        // Services
        builder.Services.AddScoped<IEventService, EventService>();
        builder.Services.AddScoped<IBookingService, BookingService>();
        builder.Services.AddScoped<IReviewService, ReviewService>();
        builder.Services.AddScoped<IDashboardService, DashboardService>();
        builder.Services.AddScoped<TokenService>();

        // Memory Cache
        builder.Services.AddMemoryCache();

        // Identity
        builder.Services.AddIdentity<IdentityUser, IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        // JWT Authentication
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidateAudience         = true,
                ValidateLifetime         = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer    = "EventBookingIssuer",
                ValidAudience  = "EventBookingAudience",
                IssuerSigningKey = new SymmetricSecurityKey(
                    Convert.FromBase64String("RXZlbnRCb29raW5nU2VjcmV0S2V5Rm9ySldUMTIzNDU2Nzg="))
            };
        });

        // CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
                policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
        });

        // Swagger with JWT support
        builder.Services.AddSwaggerGen(option =>
        {
            option.SwaggerDoc("v1", new OpenApiInfo { Title = "EventBookingAPI", Version = "v1" });
            option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In           = ParameterLocation.Header,
                Description  = "JWT Authorization header using the Bearer scheme.",
                Name         = "Authorization",
                Type         = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme       = "Bearer"
            });
            option.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id   = "Bearer"
                        }
                    },
                    new string[] {}
                }
            });
        });

        var app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseCors("AllowAll");
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}
