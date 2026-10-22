# Helpdesk Ticket Management System — Frontend

Angular frontend for the Helpdesk Ticket Management System — a role-based support ticketing app where Employees raise tickets, Admins assign them to Developers, and Developers resolve them.

> Backend (.NET Core API) repo: [helpdesk-api](https://github.com/deepak9541/helpdesk-api)

---

## Features

- **JWT-based authentication** — login screen, token stored and attached to every API request via an HTTP interceptor
- **Role-based UI** — Employee, Admin, and Developer each see a different dashboard and navigation, enforced with route guards
- **Employee**
  - Create a new ticket (Title, Description, Priority)
  - View own tickets
  - View ticket details
  - Edit own ticket (only while it's Open)
- **Admin**
  - Dashboard with ticket stats (Total / Open / In Progress / Resolved / Closed)
  - View all tickets, with ticket details
  - Assign a ticket to a developer
  - Change ticket status, edit, or delete any ticket
- **Developer**
  - View tickets assigned to them
  - Mark an assigned ticket as Resolved
- Clean separation of concerns using Angular services for API communication and reusable components for shared UI (ticket list, status badges, etc.)

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Angular |
| HTTP | HttpClient + RxJS |
| Styling | Angular Material |
| Forms | Reactive Forms |
| Auth | JWT (stored client-side, attached via HTTP Interceptor) |
| Routing | Angular Router with role-based Route Guards |

---

## Project Structure

```
src/app/
├── auth/              # Login, auth service, route guards, JWT interceptor
├── employee/          # My Tickets, Create Ticket
├── admin/             # Dashboard, All Tickets, Assign/Status actions
├── developer/         # Assigned Tickets
├── shared/            # Reusable components (ticket details, status badge), models/interfaces
└── core/              # App-wide services, constants
```

---

## Getting Started

### Prerequisites
- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)
- The [backend API](https://github.com/deepak9541/helpdesk-api) running locally (or deployed)

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/deepak9541/helpdesk-ui.git
   cd helpdesk-ui
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Update the API base URL in `src/environments/environment.ts` to point to your running backend:
   ```ts
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7125/api'
   };
   ```

4. Run the app
   ```bash
   ng serve
   ```

5. Open `http://localhost:4200`

### Test Accounts (seeded in the backend)

| Role | Email | Password |
|---|---|---|
| Admin | admin@helpdesk.com | Password@123 |
| Employee | rahul@helpdesk.com | Password@123 |
| Developer | amit@helpdesk.com | Password@123 |

---

## What This Project Demonstrates

- Role-based routing and UI rendering driven by a JWT's claims
- Centralized HTTP error and auth-token handling via an Angular interceptor
- Reactive Forms with validation for ticket creation/editing
- Clean API service layer separating HTTP calls from components
- Reusable, presentational components shared across role-specific views

---

## Related Repository

- **Backend API:** [github.com/deepak9541/helpdesk-api](https://github.com/deepak9541/helpdesk-api) — ASP.NET Core Web API with JWT auth, Repository Pattern + Unit of Work, and role-based authorization

---

## Author

**Deepak Gupta**
[GitHub](https://github.com/deepak9541) · Angular Developer, transitioning to Full-Stack
