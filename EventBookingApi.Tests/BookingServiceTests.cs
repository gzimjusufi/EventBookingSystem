using EventBookingApi.Data;
using EventBookingApi.DTOs;
using EventBookingApi.Repositories.Interfaces;
using EventBookingApi.Services.Implementations;
using FluentAssertions;
using Moq;
using Xunit;

namespace EventBookingApi.Tests;

/// <summary>
/// Unit tests for BookingService — covers ticket booking, cancellation,
/// and all validation rules in the business logic layer.
/// </summary>
public class BookingServiceTests
{
    private readonly Mock<IBookingRepository> _bookingRepoMock;
    private readonly Mock<IEventRepository> _eventRepoMock;
    private readonly BookingService _service;

    public BookingServiceTests()
    {
        _bookingRepoMock = new Mock<IBookingRepository>();
        _eventRepoMock   = new Mock<IEventRepository>();
        _service = new BookingService(_bookingRepoMock.Object, _eventRepoMock.Object);
    }

    // Helper: creates a valid future event
    private static Event MakeEvent(int id, int available = 50) => new Event
    {
        Id               = id,
        Title            = $"Event {id}",
        Location         = "Skopje",
        Category         = "Concert",
        EventDate        = DateTime.UtcNow.AddDays(10),
        TicketPrice      = 20,
        TotalTickets     = 100,
        AvailableTickets = available
    };

    // ── CreateBooking ───────────────────────────────────────────────────────

    [Fact]
    public async Task CreateBooking_ValidRequest_CreatesBookingAndReducesTickets()
    {
        var evt = MakeEvent(1, available: 50);
        _eventRepoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(evt);

        var dto = new CreateBookingDto { EventId = 1, NumberOfTickets = 3 };

        await _service.CreateBooking(dto, "user-123");

        // Available tickets should be reduced
        _eventRepoMock.Verify(r => r.UpdateEvent(It.Is<Event>(e =>
            e.AvailableTickets == 47
        )), Times.Once);

        // Booking should be created with correct total price
        _bookingRepoMock.Verify(r => r.CreateBooking(It.Is<Booking>(b =>
            b.UserId           == "user-123" &&
            b.EventId          == 1 &&
            b.NumberOfTickets  == 3 &&
            b.TotalPrice       == 60 && // 3 * €20
            b.Status           == "Confirmed"
        )), Times.Once);
    }

    [Fact]
    public async Task CreateBooking_EventNotFound_ThrowsException()
    {
        _eventRepoMock.Setup(r => r.GetEventById(99)).ReturnsAsync((Event?)null);

        var dto = new CreateBookingDto { EventId = 99, NumberOfTickets = 1 };

        await Assert.ThrowsAsync<Exception>(() => _service.CreateBooking(dto, "user-1"));
    }

    [Fact]
    public async Task CreateBooking_PastEvent_ThrowsException()
    {
        var evt = MakeEvent(1);
        evt.EventDate = DateTime.UtcNow.AddDays(-1); // past event
        _eventRepoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(evt);

        var dto = new CreateBookingDto { EventId = 1, NumberOfTickets = 1 };

        var ex = await Assert.ThrowsAsync<Exception>(() => _service.CreateBooking(dto, "user-1"));
        ex.Message.Should().Contain("past");
    }

    [Fact]
    public async Task CreateBooking_ZeroTickets_ThrowsException()
    {
        var evt = MakeEvent(1);
        _eventRepoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(evt);

        var dto = new CreateBookingDto { EventId = 1, NumberOfTickets = 0 };

        await Assert.ThrowsAsync<Exception>(() => _service.CreateBooking(dto, "user-1"));
    }

    [Fact]
    public async Task CreateBooking_NotEnoughTickets_ThrowsException()
    {
        var evt = MakeEvent(1, available: 2);
        _eventRepoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(evt);

        var dto = new CreateBookingDto { EventId = 1, NumberOfTickets = 5 };

        var ex = await Assert.ThrowsAsync<Exception>(() => _service.CreateBooking(dto, "user-1"));
        ex.Message.Should().Contain("2 tickets available");
    }

    // ── CancelBooking ───────────────────────────────────────────────────────

    [Fact]
    public async Task CancelBooking_ValidRequest_CancelsAndRestoresTickets()
    {
        var evt = MakeEvent(1, available: 47);
        var booking = new Booking
        {
            Id = 10, UserId = "user-123", EventId = 1,
            NumberOfTickets = 3, TotalPrice = 60, Status = "Confirmed",
            Event = evt
        };

        _bookingRepoMock.Setup(r => r.GetBookingById(10)).ReturnsAsync(booking);
        _eventRepoMock.Setup(r => r.GetEventById(1)).ReturnsAsync(evt);

        await _service.CancelBooking(10, "user-123");

        // Tickets restored
        _eventRepoMock.Verify(r => r.UpdateEvent(It.Is<Event>(e =>
            e.AvailableTickets == 50
        )), Times.Once);

        // Booking marked cancelled
        _bookingRepoMock.Verify(r => r.UpdateBooking(It.Is<Booking>(b =>
            b.Status == "Cancelled"
        )), Times.Once);
    }

    [Fact]
    public async Task CancelBooking_NotFound_ThrowsException()
    {
        _bookingRepoMock.Setup(r => r.GetBookingById(99)).ReturnsAsync((Booking?)null);

        await Assert.ThrowsAsync<Exception>(() => _service.CancelBooking(99, "user-1"));
    }

    [Fact]
    public async Task CancelBooking_WrongUser_ThrowsException()
    {
        var booking = new Booking
        {
            Id = 1, UserId = "owner-user", EventId = 1,
            NumberOfTickets = 2, Status = "Confirmed"
        };
        _bookingRepoMock.Setup(r => r.GetBookingById(1)).ReturnsAsync(booking);

        var ex = await Assert.ThrowsAsync<Exception>(
            () => _service.CancelBooking(1, "other-user"));
        ex.Message.Should().Contain("own bookings");
    }

    [Fact]
    public async Task CancelBooking_AlreadyCancelled_ThrowsException()
    {
        var booking = new Booking
        {
            Id = 1, UserId = "user-1", EventId = 1,
            NumberOfTickets = 2, Status = "Cancelled"
        };
        _bookingRepoMock.Setup(r => r.GetBookingById(1)).ReturnsAsync(booking);

        var ex = await Assert.ThrowsAsync<Exception>(
            () => _service.CancelBooking(1, "user-1"));
        ex.Message.Should().Contain("already cancelled");
    }

    // ── GetBookingsByUser ───────────────────────────────────────────────────

    [Fact]
    public async Task GetBookingsByUser_ReturnsOnlyUserBookings()
    {
        var evt = MakeEvent(1);
        var bookings = new List<Booking>
        {
            new Booking { Id = 1, UserId = "user-abc", EventId = 1, Event = evt,
                          NumberOfTickets = 2, TotalPrice = 40, Status = "Confirmed",
                          BookedAt = DateTime.UtcNow }
        };
        _bookingRepoMock.Setup(r => r.GetBookingsByUser("user-abc")).ReturnsAsync(bookings);

        var result = await _service.GetBookingsByUser("user-abc");

        result.Should().HaveCount(1);
        result[0].UserId.Should().Be("user-abc");
        result[0].TotalPrice.Should().Be(40);
    }
}
