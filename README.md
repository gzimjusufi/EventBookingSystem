# 🎟️ Event Booking System

A full-stack web application for browsing, booking, and managing event tickets. Built with **.NET 8 Web API** and **React (Vite + TypeScript)** as part of the Service Oriented Architecture course at SEEU.

**Team:** Gezim Jusufi · Metin Memeti
**Course:** Service Oriented Architecture — MSc. Besa Alija, 2025/2026

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

The Event Booking System enables users to browse events, book tickets, leave reviews, and manage their bookings online. The system supports role-based access for **Admins** (manage events, view platform statistics) and **Users** (search, book, cancel tickets, review past events).

**Key features:**

- Browse and filter events by category (Concert, Conference, Sports, Workshop, Other)
- Real-time ticket availability tracking with overbooking prevention
- Secure JWT-based authentication via ASP.NET Core Identity
- Role-based authorization (Admin / User)
- Booking creation and cancellation — past events cannot be cancelled
- Event reviews & ratings (1–5 stars) for finished events only
- Admin Dashboard with platform-wide statistics and quick event management
- In-memory caching of frequently accessed event data (5-minute sliding expiry)
- RESTful Web API with 15 endpoints across 5 controllers

---

## Architecture

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

- **Repository Pattern** — abstracts data access behind interfaces (`IEventRepository`, `IBookingRepository`, `IReviewRepository`)
- **Service Layer Pattern** — business logic isolated from controllers
- **Dependency Injection** — all services and repositories registered via `AddScoped` in `Program.cs`
- **DTO Pattern** — separates API contracts from domain entities; mapped via AutoMapper
- **In-Memory Caching** — `IMemoryCache` used in `EventService` for `GetAllEvents` (5-min sliding expiry)

---

## Technologies

| Layer | Technology |
|---|---|
| Backend | .NET 8, ASP.NET Core Web API |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL 18 (Azure Database for PostgreSQL Flexible Server) |
| Authentication | ASP.NET Core Identity + JWT Bearer (HS256) |
| Mapping | AutoMapper 13.0 |
| Frontend | React 18, Vite, TypeScript |
| Testing | xUnit, Moq, FluentAssertions |
| CI/CD | GitHub Actions |
| Backend Hosting | Azure App Service (Linux, .NET 8, Free F1 tier) |
| Frontend Hosting | Vercel |

---

## Project Structure

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
│   │   ├── Interfaces/               ← IEventRepository, IBookingRepository, IReviewRepository
│   │   └── Implementations/          ← EF Core implementations
│   ├── Services/
│   │   ├── Interfaces/               ← IEventService, IBookingService, IReviewService
│   │   ├── Implementations/          ← Business logic
│   │   └── TokenLogic/               ← JWT token generation
│   ├── Mappings/
│   │   └── MappingProfile.cs         ← AutoMapper configuration
│   ├── Migrations/                   ← EF Core migrations
│   ├── Program.cs                    ← App configuration, DI, CORS, JWT setup
│   └── appsettings.json              ← Connection strings and config
│
├── EventBookingApi.Tests/            ← xUnit + Moq test project
│   ├── EventServiceTests.cs          ← Service layer unit tests (mocked repo)
│   ├── BookingServiceTests.cs        ← Booking logic, cancellation guard tests
│   └── EventRepositoryTests.cs       ← Repository tests (EF Core InMemory)
│
├── event-booking-frontend/           ← React + Vite + TypeScript frontend
│   └── src/
│       ├── App.tsx                   ← Root component + routing/navigation
│       ├── components/
│       │   ├── AuthPage.tsx          ← Login / Register
│       │   ├── EventList.tsx         ← Browse & filter events
│       │   ├── EventDetail.tsx       ← Event details, booking & reviews
│       │   ├── MyBookings.tsx        ← User bookings & cancellation
│       │   ├── AddEvent.tsx          ← Admin: create event
│       │   ├── EditEvent.tsx         ← Admin: edit event
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

## Getting Started

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

```env
VITE_API_URL=http://localhost:5000/api
```

### 5 — Create an Admin user (first time only)

1. `POST /api/auth/register` — create your account
2. `POST /api/auth/login` — get your JWT token
3. Assign the `Admin` role to your user (via seeded role or database update), then log in again to receive a token with the Admin claim.

---

## API Endpoints

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
| POST | `/api/booking` | ✅ User | Book tickets (max 4 per user per event) |
| PUT | `/api/booking/{id}/cancel` | ✅ User | Cancel booking (blocked if event has passed) |

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/review/event/{eventId}` | ❌ | Get all reviews for an event |
| POST | `/api/review` | ✅ User | Submit rating & comment (finished events only) |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | 🔒 Admin | Platform statistics (events, bookings, users) |

---

## Running Tests

```bash
cd EventBookingApi.Tests
dotnet test --verbosity normal
```

**29 tests — 29 passing.**

| Test File | What It Covers |
|---|---|
| `EventServiceTests.cs` | CRUD, validation (past date, zero tickets, negative price), mapping via AutoMapper |
| `BookingServiceTests.cs` | Booking creation, ticket cap (max 4/user/event), cancellation, past-event cancellation guard |
| `EventRepositoryTests.cs` | EF Core InMemory — create, read, update, delete, category filter, upcoming ordering |

> Tests run automatically on every push via GitHub Actions. A failing test blocks deployment.

---

## Deployment

### Backend — Azure App Service

- **Resource group:** `eventbooking-rg`
- **Region:** UAE North *(chosen due to Azure for Students subscription policy restrictions)*
- **App Service:** Free F1 tier, Linux, .NET 8 runtime
- **Database:** Azure Database for PostgreSQL Flexible Server
- Connection string stored as an App Service environment variable (`DefaultConnection`) — never committed to source control
- CORS configured in `Program.cs` to allow requests from the Vercel frontend origin

**Live API:** https://eventbooking-api-eqeza7e5f6bxage0.uaenorth-01.azurewebsites.net/api

> ⚠️ Free F1 tier has no Always On — expect a cold start (~10–15s) after a period of inactivity.

### Frontend — Vercel

- Connected directly to the GitHub repository
- **Root Directory:** `event-booking-frontend`
- **Framework Preset:** Vite
- **Environment variable:** `VITE_API_URL = https://eventbooking-api-eqeza7e5f6bxage0.uaenorth-01.azurewebsites.net/api`
- Auto-deploys on every push to `main`

**Live App:** https://event-booking-system-virid.vercel.app

---

## CI/CD Pipeline

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

- **Backend CI** (`azure-pipelines.yml`) — restores, builds, and runs all 29 xUnit tests. A failing test blocks the deploy step.
- **Backend CD** (`main_eventbooking-api.yml`) — auto-generated by Azure Deployment Center; publishes the API and deploys using `azure/login` + `azure/webapps-deploy`.
- **Frontend CI/CD** — handled natively by Vercel's GitHub integration. No separate workflow file needed.

---

> ⚠️ Never commit production passwords or connection strings. Use environment variables, Azure App Service Configuration, and GitHub Secrets.
