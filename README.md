# 🎟️ Event Booking System

A full-stack web application for browsing, booking, and managing event tickets.  
Built with **.NET 8 Web API** and **React.js** as part of the Service Oriented Architecture course at SEEU.

**Team:** Gezim Jusufi · Metin Memeti  
**Course:** Service Oriented Architecture — MSc. Besa Alija, 2026

---

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)

---

## Overview

The Event Booking System enables users to browse events, purchase tickets, and manage bookings online. The system supports role-based access for **Admins** (create/manage events) and **Users** (search, book, cancel tickets).

**Key features:**
- Browse and filter events by category (Concert, Sport, Theatre, Festival, Conference)
- Real-time ticket availability tracking
- Secure JWT-based authentication
- Role-based authorization (Admin / User)
- Booking cancellation with automatic ticket restoration
- RESTful Web API with full Swagger documentation

---

## Architecture

The backend follows a clean **layered architecture**:

```
Client (React)
    ↓ HTTP/REST
Controllers  ←→  DTOs
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
PostgreSQL (via EF Core)
```

**Design patterns used:**
- Repository Pattern — abstracts data access behind interfaces
- Service Layer Pattern — business logic isolated from controllers
- Dependency Injection — all services and repositories registered in DI container
- DTO Pattern — separates API contracts from domain entities

---

## Technologies

| Layer | Technology |
|-------|-----------|
| Backend | .NET 8, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL (Npgsql) |
| Authentication | ASP.NET Identity + JWT Bearer |
| Mapping | AutoMapper |
| Documentation | Swagger / Swashbuckle |
| Frontend | React 18, Vite |
| Testing | xUnit, Moq, FluentAssertions, EF InMemory |
| CI | Azure Pipelines (YAML) |
| CD | GitHub Actions → Vercel (frontend) |
| Hosting | Render (backend), Vercel (frontend) |

---

## Project Structure

```
EventBookingSystem/
│
├── EventBookingApi/                  ← .NET 8 Web API
│   ├── Controllers/
│   │   ├── AuthController.cs         ← Register, Login, Role management
│   │   ├── EventController.cs        ← CRUD for events
│   │   └── BookingController.cs      ← Create and cancel bookings
│   ├── Data/
│   │   ├── AppDbContext.cs            ← EF Core DbContext
│   │   ├── Event.cs                  ← Event entity
│   │   └── Booking.cs                ← Booking entity
│   ├── DTOs/
│   │   └── Dtos.cs                   ← All request/response DTOs
│   ├── Repositories/
│   │   ├── Interfaces/               ← IEventRepository, IBookingRepository
│   │   └── Implementations/          ← EF Core implementations
│   ├── Services/
│   │   ├── Interfaces/               ← IEventService, IBookingService
│   │   ├── Implementations/          ← Business logic
│   │   └── TokenLogic/               ← JWT token generation
│   ├── Mappings/
│   │   └── MappingProfile.cs         ← AutoMapper configuration
│   ├── Migrations/                   ← EF Core migrations
│   ├── Program.cs                    ← App configuration and DI setup
│   ├── appsettings.json              ← Connection strings and config
│   └── Dockerfile                   ← Docker container for Render
│
├── EventBookingApi.Tests/            ← xUnit test project
│   ├── EventServiceTests.cs          ← 10 tests for EventService
│   ├── BookingServiceTests.cs        ← 9 tests for BookingService
│   └── EventRepositoryTests.cs      ← 7 tests for EventRepository
│
├── event-booking-frontend/           ← React + Vite frontend
│   └── src/
│       ├── App.jsx                   ← Root component + navigation
│       ├── components/
│       │   ├── AuthPage.jsx          ← Login / Register
│       │   ├── EventList.jsx         ← Browse & filter events
│       │   ├── EventDetail.jsx       ← Event details + booking
│       │   ├── MyBookings.jsx        ← User bookings & cancellation
│       │   └── AddEvent.jsx          ← Admin: create event
│       └── services/
│           └── api.js                ← All fetch() API calls
│
├── .github/
│   └── workflows/
│       ├── azure-pipelines.yml       ← CI: build + test on every push
│       └── deploy-frontend.yml       ← CD: deploy frontend to Vercel
│
├── render.yaml                       ← Render deployment config
└── README.md
```

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)

### 1 — Clone the repository
```bash
git clone https://github.com/gzimjusufi/EventBookingSystem.git
cd EventBookingSystem
```

### 2 — Set up the database
Create a PostgreSQL database:
```sql
CREATE DATABASE eventbooking;
```

Update `EventBookingApi/appsettings.json` with your credentials:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=eventbooking;Username=postgres;Password=YOUR_PASSWORD"
}
```

### 3 — Run the backend
```bash
cd EventBookingApi
dotnet restore
dotnet ef database update
dotnet run
```
API available at: **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

### 4 — Run the frontend
```bash
cd event-booking-frontend
npm install
npm run dev
```
Frontend available at: **http://localhost:5173**

### 5 — Create Admin role (first time only)
Using Swagger at `http://localhost:5000/swagger`:
1. `POST /Auth/register` — create your account
2. `POST /Auth/login` — get your token
3. Click **Authorize** → enter `Bearer YOUR_TOKEN`
4. `POST /Auth/role` with `roleName = Admin`
5. `POST /Auth/assign` with your email and `Admin`

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/Auth/register` | ❌ | Register new user |
| POST | `/Auth/login` | ❌ | Login, returns JWT |
| POST | `/Auth/role` | ✅ | Create role |
| POST | `/Auth/assign` | ✅ | Assign role to user |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/Event` | ❌ | Get all events |
| GET | `/Event/{id}` | ❌ | Get event by ID |
| GET | `/Event/upcoming` | ❌ | Get future events |
| GET | `/Event/category/{cat}` | ❌ | Filter by category |
| POST | `/Event` | 🔒 Admin | Create event |
| PUT | `/Event/{id}` | 🔒 Admin | Update event |
| DELETE | `/Event/{id}` | 🔒 Admin | Delete event |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/Booking/my` | ✅ User | Get my bookings |
| POST | `/Booking` | ✅ User | Book tickets |
| PUT | `/Booking/{id}/cancel` | ✅ User | Cancel booking |
| GET | `/Booking` | 🔒 Admin | All bookings |
| GET | `/Booking/event/{id}` | 🔒 Admin | Bookings for event |

---

## Running Tests

```bash
cd EventBookingApi.Tests
dotnet test --verbosity normal
```

**Test coverage:**
- `EventServiceTests` — 9 tests (GetAll, GetById, Create validations, Update, Delete, GetByCategory)
- `BookingServiceTests` — 8 tests (Create booking, ticket deduction, cancellation, error cases)
- `EventRepositoryTests` — 7 tests (CRUD, filtering, ordering using EF InMemory)

---

## Deployment

### Backend — Render
1. Sign up at [render.com](https://render.com) with GitHub
2. New → PostgreSQL (free tier) → copy connection string
3. New → Web Service → connect repo → set Root Directory to `EventBookingApi`
4. Environment: Docker, Dockerfile: `./Dockerfile`
5. Add env var: `ConnectionStrings__DefaultConnection = <your render postgres url>`

### Frontend — Vercel
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import repo → Root Directory: `event-booking-frontend`
3. Add env var: `VITE_API_URL = https://your-render-service.onrender.com`
4. Deploy

---

## CI/CD Pipeline

Every push to `main` triggers:

```
git push main
    ↓
GitHub webhook
    ↓
Azure Pipelines — restore → build → test
    ↓
GitHub Actions — build frontend → deploy to Vercel
```

Pipeline file: `.github/workflows/azure-pipelines.yml`  
Frontend deploy: `.github/workflows/deploy-frontend.yml`

> ⚠️ Never commit production passwords. Use environment variables / Azure App Service Configuration.
