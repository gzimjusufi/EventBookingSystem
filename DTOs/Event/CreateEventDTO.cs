namespace EventBookingSystem.DTOs.Event
{
    public class CreateEventDto
    {
        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime EventDate { get; set; }

        public string Location { get; set; }

        public decimal TicketPrice { get; set; }

        public int TotalTickets { get; set; }
    }
}
