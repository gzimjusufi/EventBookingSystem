🎟️ Event Booking System
========================

A full-stack web application for browsing, booking, and managing event tickets.
Built with .NET 8 Web API and React (Vite + TypeScript) as part of the Service Oriented Architecture course at SEEU.

**Team:** Gezim Jusufi · Metin Memeti
**Course:** Service Oriented Architecture — MSc. Besa Alija, 2025/2026

---

📋 Table of Contents
---------------------
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

Overview
--------
The Event Booking System enables users to browse events, book tickets, leave reviews, and manage their bookings online. The system supports role-based access for **Admins** (manage events, view platform statistics) and **Users** (search, book, cancel tickets, review past events).

**Key features:**
- Browse and filter events by category (Concert, Conference, Sports, Workshop, Other)
- Real-time ticket availability tracking with overbooking prevention
- Secure JWT-based authentication via ASP.NET Core Identity
- Role-based authorization (Admin / User)
- Booking creation and cancellation with automatic ticket restoration
- Event reviews & ratings (1–5 stars) for finished events
- Admin Dashboard with platform-wide statistics and quick event management
- In-memory caching of frequently accessed event data
- RESTful Web API

---

Architecture
------------
The backend follows a clean layered architecture:

```
Client (React + Vite)
    ↓ HTTP/REST (JSON)
Controllers  ←→  DTOs
    ↓
Services (Business Logic + Caching)
    ↓
Repositories (Data Access)
    ↓
PostgreSQL (via EF Core)
```

**Design patterns used:**
- **Repository Pattern** — abstracts data access behind interfaces
- **Service Layer Pattern** — business logic isolated from controllers
- **Dependency Injection** — all services and repositories registered in the DI container
- **DTO Pattern** — separates API contracts from domain entities
- **In-Memory Caching** — `IMemoryCache` used in the Service layer for frequently read data

---

Technologies
------------
| Layer | Technology |
|---|---|
| Backend | .NET 8, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL 18 (Azure Database for PostgreSQL Flexible Server) |
| Authentication | ASP.NET Core Identity + JWT Bearer |
| Mapping | AutoMapper |
| Frontend | React 18, Vite, TypeScript |
| Testing | xUnit, Moq |
| CI/CD | GitHub Actions |
| Backend Hosting | Azure App Service (Linux, .NET 8, Free F1 tier) |
| Frontend Hosting | Vercel |

---

Project Structure
------------------
```
EventBookingSystem/
│
├── EventBookingApi/                  ← .NET 8 Web API
│   ├── Controllers/
│   │   ├── AuthController.cs         ← Register, Login
│   │   ├── EventController.cs        ← CRUD for events
│   │   ├── BookingController.cs      ← Create and cancel bookings
│   │   ├── ReviewController.cs       ← Event reviews & ratings
│   │   └── AdminController.cs        ← Admin dashboard statistics
│   ├── Data/
│   │   ├── AppDbContext.cs           ← EF Core DbContext
│   │   ├── Event.cs                  ← Event entity
│   │   ├── Booking.cs                ← Booking entity
│   │   └── Review.cs                 ← Review entity
│   ├── DTOs/
│   │   └── Dtos.cs                   ← All request/response DTOs
│   ├── Repositories/
│   │   ├── Interfaces/               ← IEventRepository, IBookingRepository, ...
│   │   └── Implementations/          ← EF Core implementations
│   ├── Services/
│   │   ├── Interfaces/               ← IEventService, IBookingService, ...
│   │   ├── Implementations/          ← Business logic
│   │   └── TokenLogic/               ← JWT token generation
│   ├── Mappings/
│   │   └── MappingProfile.cs         ← AutoMapper configuration
│   ├── Migrations/                   ← EF Core migrations
│   ├── Program.cs                    ← App configuration, DI, CORS, JWT setup
│   └── appsettings.json              ← Connection strings and config
│
├── EventBookingApi.Tests/            ← xUnit + Moq test project
│   ├── EventServiceTests.cs
│   ├── BookingServiceTests.cs
│   └── EventRepositoryTests.cs
│
├── event-booking-frontend/           ← React + Vite + TypeScript frontend
│   └── src/
│       ├── App.tsx                   ← Root component + routing/navigation
│       ├── components/
│       │   ├── AuthPage.tsx          ← Login / Register
│       │   ├── EventList.tsx         ← Browse & filter events
│       │   ├── EventDetail.tsx       ← Event details, booking & reviews
│       │   ├── MyBookings.tsx        ← User bookings & cancellation
│       │   ├── AddEvent.tsx          ← Admin: create / delete event
│       │   └── AdminDashboard.tsx    ← Admin: platform statistics
│       └── services/
│           └── api.js                ← All fetch() API calls
│
├── .github/
│   └── workflows/
│       ├── azure-pipelines.yml       ← CI: build + test on every push
│       └── main_eventbooking-api.yml ← CD: deploy backend to Azure App Service
│
└── README.md
```

---

Getting Started
----------------
### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL

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

Update `EventBookingApi/appsettings.json` with your local credentials:
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
API available at: `http://localhost:5000`

### 4 — Run the frontend
```bash
cd event-booking-frontend
npm install
npm run dev
```
Frontend available at: `http://localhost:5173`

Create a `.env` file in `event-booking-frontend/` for local development:
```
VITE_API_URL=http://localhost:5000/api
```

### 5 — Create an Admin user (first time only)
1. `POST /api/auth/register` — create your account
2. `POST /api/auth/login` — get your JWT token
3. Assign the `Admin` role to your user (via seeded role or database update), then log in again to receive a token with the Admin claim.

---

API Endpoints
-------------
### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |

### Events
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/event` | ❌ | Get all events (cached) |
| GET | `/api/event/{id}` | ❌ | Get event by ID |
| GET | `/api/event/upcoming` | ❌ | Get future events |
| GET | `/api/event/category/{cat}` | ❌ | Filter by category |
| POST | `/api/event` | 🔒 Admin | Create event |
| PUT | `/api/event/{id}` | 🔒 Admin | Update event |
| DELETE | `/api/event/{id}` | 🔒 Admin | Delete event |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/booking/my` | ✅ User | Get my bookings |
| POST | `/api/booking` | ✅ User | Book tickets |
| PUT | `/api/booking/{id}/cancel` | ✅ User | Cancel booking |

### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/review/event/{eventId}` | ❌ | Get all reviews for an event |
| POST | `/api/review` | ✅ User | Submit rating & comment for a finished event |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | 🔒 Admin | Platform statistics (events, bookings, users) |

---

Running Tests
--------------
```bash
cd EventBookingApi.Tests
dotnet test --verbosity normal
```

Test coverage includes the Service and Repository layers, covering CRUD operations, ticket availability validation, booking cancellation, and category filtering.

---

Deployment
----------
### Backend — Azure App Service
- Resource group: `eventbooking-rg`
- Region: UAE North (chosen due to Azure for Students subscription policy restrictions)
- App Service: Free F1 tier, Linux, .NET 8 runtime
- Database: Azure Database for PostgreSQL Flexible Server
- Connection string is stored as an App Service environment variable (`DefaultConnection`), never committed to source control
- CORS configured in `Program.cs` to allow requests from the Vercel frontend origin

**Live API:** `https://eventbooking-api.azurewebsites.net/api`

### Frontend — Vercel
- Connected directly to the GitHub repository
- Root Directory: `event-booking-frontend`
- Framework Preset: Vite
- Environment variable: `VITE_API_URL = https://eventbooking-api.azurewebsites.net/api`
- Auto-deploys on every push to `main`

**Live App:** `https://event-booking-system-virid.vercel.app`

---

CI/CD Pipeline
--------------
Every push to `main` triggers two GitHub Actions workflows:

```
git push main
    ↓
GitHub Actions
    ├── azure-pipelines.yml          → restore → build → run unit tests
    └── main_eventbooking-api.yml    → publish → deploy to Azure App Service
    ↓
Vercel (native GitHub integration) → build & deploy frontend
```

- **Backend CI:** `.github/workflows/azure-pipelines.yml` — restores, builds, and runs xUnit tests for both the API and test projects.
- **Backend CD:** `.github/workflows/main_eventbooking-api.yml` — auto-generated by Azure Deployment Center, publishes the API and deploys it to Azure App Service using `azure/login` + `azure/webapps-deploy`.
- **Frontend CI/CD:** handled natively by Vercel's GitHub integration — no separate workflow file needed.

> ⚠️ Never commit production passwords or connection strings. Use environment variables / Azure App Service Configuration and GitHub Secrets.
