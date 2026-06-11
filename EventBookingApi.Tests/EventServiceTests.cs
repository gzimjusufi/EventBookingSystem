using AutoMapper;
using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Mappings;
using EventBookingApi.Repositories.Interfaces;
using EventBookingApi.Services.Implementations;
using FluentAssertions;
using Moq;
using Xunit;

namespace EventBookingApi.Tests;

/// <summary>
/// Unit tests for EventService — verifies business logic in isolation
/// using mocked repositories (no real database needed).
/// </summary>
public class EventServiceTests
{
    private readonly Mock<IEventRepository> _repoMock;
    private readonly IMapper _mapper;
    private readonly EventService _service;

    public EventServiceTests()
    {
        _repoMock = new Mock<IEventRepository>();

        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();

        _service = new EventService(_repoMock.Object, _mapper);
    }

    // ── GetAllEvents ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllEvents_ReturnsAllEvents()
    {
        // Arrange
        var events = new List<Event>
        {
            new Event { Id = 1, Title = "Concert A", Category = "Concert",
                        Location = "Skopje", EventDate = DateTime.UtcNow.AddDays(10),
                        TicketPrice = 20, TotalTickets = 100, AvailableTickets = 100 },
            new Event { Id = 2, Title = "Football Match", Category = "Sport",
                        Location = "Tetovo", EventDate = DateTime.UtcNow.AddDays(5),
                        TicketPrice = 15, TotalTickets = 200, AvailableTickets = 150 }
        };
        _repoMock.Setup(r => r.GetAllEvents()).ReturnsAsync(events);

        // Act
        var result = await _service.GetAllEvents();

        // Assert
        result.Should().HaveCount(2);
        result[0].Title.Should().Be("Concert A");
        result[1].Title.Should().Be("Football Match");
    }

    [Fact]
    public async Task GetAllEvents_WhenNoEvents_ReturnsEmptyList()
    {
        _repoMock.Setup(r => r.GetAllEvents()).ReturnsAsync(new List<Event>());

        var result = await _service.GetAllEvents();

        result.Should().BeEmpty();
    }

    // ── GetEventById ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetEventById_WhenExists_ReturnsEvent()
    {
        var evt = new Event { Id = 1, Title = "Rock Concert", Category = "Concert",
                              Location = "Skopje", EventDate = DateTime.UtcNow.AddDays(10),
                              TicketPrice = 25, TotalTickets = 50, AvailableTickets = 50 };
        _repoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(evt);

        var result = await _service.GetEventById(1);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Rock Concert");
        result.TicketPrice.Should().Be(25);
    }

    [Fact]
    public async Task GetEventById_WhenNotFound_ReturnsNull()
    {
        _repoMock.Setup(r => r.GetEventById(99)).ReturnsAsync((Event?)null);

        var result = await _service.GetEventById(99);

        result.Should().BeNull();
    }

    // ── CreateEvent ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateEvent_WithValidData_CallsRepository()
    {
        var dto = new CreateEventDto
        {
            Title = "Jazz Night",
            Description = "A great jazz evening",
            Location = "Ohrid",
            EventDate = DateTime.UtcNow.AddDays(30),
            TicketPrice = 10,
            TotalTickets = 100,
            Category = "Concert"
        };

        await _service.CreateEvent(dto);

        // Verify repository was called exactly once with an Event object
        _repoMock.Verify(r => r.CreateEvent(It.Is<Event>(e =>
            e.Title == "Jazz Night" &&
            e.AvailableTickets == 100 &&
            e.TicketPrice == 10
        )), Times.Once);
    }

    [Fact]
    public async Task CreateEvent_WithPastDate_ThrowsException()
    {
        var dto = new CreateEventDto
        {
            Title = "Old Event",
            EventDate = DateTime.UtcNow.AddDays(-1), // past date
            TicketPrice = 10,
            TotalTickets = 100,
            Category = "Concert",
            Location = "Skopje"
        };

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _service.CreateEvent(dto));
        _repoMock.Verify(r => r.CreateEvent(It.IsAny<Event>()), Times.Never);
    }

    [Fact]
    public async Task CreateEvent_WithZeroTickets_ThrowsException()
    {
        var dto = new CreateEventDto
        {
            Title = "Event",
            EventDate = DateTime.UtcNow.AddDays(10),
            TicketPrice = 10,
            TotalTickets = 0, // invalid
            Category = "Concert",
            Location = "Skopje"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.CreateEvent(dto));
    }

    [Fact]
    public async Task CreateEvent_WithNegativePrice_ThrowsException()
    {
        var dto = new CreateEventDto
        {
            Title = "Event",
            EventDate = DateTime.UtcNow.AddDays(10),
            TicketPrice = -5, // invalid
            TotalTickets = 100,
            Category = "Concert",
            Location = "Skopje"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.CreateEvent(dto));
    }

    // ── UpdateEvent ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateEvent_WhenExists_UpdatesFields()
    {
        var existing = new Event { Id = 1, Title = "Old Title", Category = "Concert",
                                   Location = "Skopje", EventDate = DateTime.UtcNow.AddDays(10),
                                   TicketPrice = 10, TotalTickets = 100, AvailableTickets = 100 };
        _repoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(existing);

        var dto = new UpdateEventDto
        {
            Title = "New Title",
            Description = "Updated",
            Location = "Ohrid",
            EventDate = DateTime.UtcNow.AddDays(20),
            TicketPrice = 25,
            TotalTickets = 150,
            Category = "Theatre"
        };

        await _service.UpdateEvent(1, dto);

        _repoMock.Verify(r => r.UpdateEvent(It.Is<Event>(e =>
            e.Title == "New Title" &&
            e.Location == "Ohrid" &&
            e.TicketPrice == 25
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateEvent_WhenNotFound_ThrowsException()
    {
        _repoMock.Setup(r => r.GetEventById(99)).ReturnsAsync((Event?)null);

        var dto = new UpdateEventDto { Title = "X", Location = "Y", Category = "Concert",
                                       EventDate = DateTime.UtcNow.AddDays(5), TicketPrice = 10,
                                       TotalTickets = 50 };

        await Assert.ThrowsAsync<Exception>(() => _service.UpdateEvent(99, dto));
    }

    // ── DeleteEvent ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteEvent_CallsRepository()
    {
        await _service.DeleteEvent(1);

        _repoMock.Verify(r => r.DeleteEvent(1), Times.Once);
    }

    // ── GetEventsByCategory ─────────────────────────────────────────────────

    [Fact]
    public async Task GetEventsByCategory_ReturnsFilteredEvents()
    {
        var events = new List<Event>
        {
            new Event { Id = 1, Title = "Rock", Category = "Concert",
                        Location = "Skopje", EventDate = DateTime.UtcNow.AddDays(5),
                        TicketPrice = 20, TotalTickets = 100, AvailableTickets = 100 }
        };
        _repoMock.Setup(r => r.GetEventsByCategory("Concert")).ReturnsAsync(events);

        var result = await _service.GetEventsByCategory("Concert");

        result.Should().HaveCount(1);
        result[0].Category.Should().Be("Concert");
    }
}
