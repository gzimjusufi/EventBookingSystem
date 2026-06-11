using AutoMapper;
using EventBookingApi.Data;
using EventBookingApi.DTOs;

namespace EventBookingApi.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Event, EventDto>();
        CreateMap<EventDto, Event>();
        CreateMap<CreateEventDto, Event>();
    }
}
