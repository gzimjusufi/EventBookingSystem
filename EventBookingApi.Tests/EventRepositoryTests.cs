using EventBookingApi.Data;
using EventBookingApi.Repositories.Implementations;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace EventBookingApi.Tests;

/// <summary>
/// Unit tests for EventRepository — uses EF Core InMemory database
/// to test actual data operations without a real PostgreSQL instance.
/// </summary>
public class EventRepositoryTests
{
    // Creates a fresh in-memory database for each test
    private static AppDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new AppDbContext(options);
    }

    private static Event MakeEvent(string title, string category, int daysAhead = 10) => new Event
    {
        Title            = title,
        Description      = "Test description",
        Location         = "Test Location",
        Category         = category,
        EventDate        = DateTime.UtcNow.AddDays(daysAhead),
        TicketPrice      = 20,
        TotalTickets     = 100,
        AvailableTickets = 100,
        CreatedAt        = DateTime.UtcNow
    };

    [Fact]
    public async Task CreateEvent_ThenGetById_ReturnsCorrectEvent()
    {
        using var context = CreateContext("create-get");
        var repo = new EventRepository(context);

        var evt = MakeEvent("Test Concert", "Concert");
        await repo.CreateEvent(evt);

        var result = await repo.GetEventById(evt.Id);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Test Concert");
        result.Category.Should().Be("Concert");
    }

    [Fact]
    public async Task GetAllEvents_ReturnsAllCreatedEvents()
    {
        using var context = CreateContext("get-all");
        var repo = new EventRepository(context);

        await repo.CreateEvent(MakeEvent("Event 1", "Concert"));
        await repo.CreateEvent(MakeEvent("Event 2", "Sport"));
        await repo.CreateEvent(MakeEvent("Event 3", "Theatre"));

        var result = await repo.GetAllEvents();

        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task UpdateEvent_PersistsChanges()
    {
        using var context = CreateContext("update");
        var repo = new EventRepository(context);

        var evt = MakeEvent("Old Title", "Concert");
        await repo.CreateEvent(evt);

        evt.Title = "New Title";
        evt.TicketPrice = 99;
        await repo.UpdateEvent(evt);

        var updated = await repo.GetEventById(evt.Id);
        updated!.Title.Should().Be("New Title");
        updated.TicketPrice.Should().Be(99);
    }

    [Fact]
    public async Task DeleteEvent_RemovesFromDatabase()
    {
        using var context = CreateContext("delete");
        var repo = new EventRepository(context);

        var evt = MakeEvent("To Delete", "Concert");
        await repo.CreateEvent(evt);

        await repo.DeleteEvent(evt.Id);

        var result = await repo.GetEventById(evt.Id);
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetEventsByCategory_ReturnsOnlyMatchingCategory()
    {
        using var context = CreateContext("by-category");
        var repo = new EventRepository(context);

        await repo.CreateEvent(MakeEvent("Concert 1", "Concert"));
        await repo.CreateEvent(MakeEvent("Concert 2", "Concert"));
        await repo.CreateEvent(MakeEvent("Football", "Sport"));

        var result = await repo.GetEventsByCategory("Concert");

        result.Should().HaveCount(2);
        result.All(e => e.Category == "Concert").Should().BeTrue();
    }

    [Fact]
    public async Task GetUpcomingEvents_ReturnsOnlyFutureEvents()
    {
        using var context = CreateContext("upcoming");
        var repo = new EventRepository(context);

        await repo.CreateEvent(MakeEvent("Future Event 1", "Concert", daysAhead: 5));
        await repo.CreateEvent(MakeEvent("Future Event 2", "Sport", daysAhead: 10));

        var result = await repo.GetUpcomingEvents();

        result.Should().HaveCount(2);
        result.All(e => e.EventDate > DateTime.UtcNow).Should().BeTrue();
    }

    [Fact]
    public async Task GetUpcomingEvents_AreOrderedByDate()
    {
        using var context = CreateContext("upcoming-ordered");
        var repo = new EventRepository(context);

        await repo.CreateEvent(MakeEvent("Later", "Concert", daysAhead: 20));
        await repo.CreateEvent(MakeEvent("Sooner", "Sport", daysAhead: 3));

        var result = await repo.GetUpcomingEvents();

        result[0].Title.Should().Be("Sooner");
        result[1].Title.Should().Be("Later");
    }
}
