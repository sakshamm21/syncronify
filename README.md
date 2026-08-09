<div align="center">

# 📅 Syncronify

**Event Management Software** — plan, collaborate, and attend events effortlessly.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-13-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4.18-blue?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔧 Configuration](#-configuration)
- [📡 API Reference](#-api-reference)
- [🗄️ Database Models](#️-database-models)
- [🚦 Authentication & Roles](#-authentication--roles)
- [🧪 Testing](#-testing)
- [🐳 Docker](#-docker)
- [☁️ Deployment](#️-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 💡 About

Syncronify is an **Event Management Software** designed to streamline event planning and enhance productivity for both individuals and teams.

In the dynamic landscape of college and professional life, a plethora of online and offline events often overwhelm individuals, leading to:

- ⏳ Time wastage
- 📉 Inefficient event attendance
- ⚡ Unexpected scheduling conflicts
- 🗓️ Missed deadlines

Managing events and team execution across multiple mediums creates redundancy and reduces efficiency. **Syncronify** consolidates everything into a single, unified interface — eliminating these hassles and providing a comprehensive solution for individuals, teams, and organizations.

---

## ✨ Features

### 📆 Event Scheduling Calendar
- Interactive calendar (FullCalendar) for managing **personal** and **team** events
- Drag-and-drop event resizing and conflict avoidance
- Multiple views: month, week, day
- Optimize time utilization with a single source of truth

### 🗺️ Map & Venue Navigation
- Mapbox-powered interactive maps
- **Venue navigation** for offline events
- Location search with autocomplete suggestions
- Route drawing between your location and the event venue
- Pick event locations directly from the map

### 💬 Real-time Chat
- Instant communication with event organizers and administrators
- Powered by **Socket.io** for low-latency, real-time messaging
- One-to-one message history persisted to MongoDB
- Message types: text, media, document, link

### 👥 Groups & Communities
- Create and join groups for seamless team collaboration
- Share events across calendars
- Coordinate team event execution

### 🎭 Role-Based Dashboards
Three distinct user types with tailored experiences:

| Role | Dashboard | Access |
|------|-----------|--------|
| **General User** (`genUser`) | `/dashboard` | Personal events, calendar, navigation, groups, notes |
| **Admin** (`adminUser`) | `/admin-dashboard` | Post events, manage communities, event controls |
| **Application Admin** (`applicationAdminUser`) | `/application-admin-dashboard` | Manage admins, review requests |

### 🔐 Secure Authentication
- **JWT**-based session management (1-day expiry)
- **bcrypt** password hashing (12 salt rounds)
- **OTP email verification** during registration
- **Forgot / Reset password** flows
- Role-based route protection middleware

### 📝 Notes & Collaboration
- Personal notes area within the dashboard
- Capture ideas, meeting notes, and event plans

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend — Next.js 13 (port 3000)"]
        UI[React Pages]
        UI --> CTX[Contexts: Auth, Event, Location]
        UI --> RTK[Redux Toolkit]
        UI --> CAL[FullCalendar]
        UI --> MAP[Mapbox GL]
        UI --> CHAT[Chat UI (Socket.io)]
    end

    subgraph Server["Backend — Node/Express (port 4000)"]
        API[Express app]
        WS[Socket.io Server]
        API --> CTRL[Controllers]
        CTRL --> MOD[Mongoose Models]
        CTRL --> MAIL[Nodemailer]
        API --> AUTH[JWT Protect Middleware]
    end

    UI -->|HTTP /api| API
    UI -->|WebSocket| WS
    API --> MONGO[(MongoDB)]
    WS --> MONGO
```

### How data flows

1. **Frontend** (Next.js) renders the UI and makes HTTP requests to the backend via axios (base URL `http://localhost:4000`).
2. **Backend** (Express) exposes a REST API under `/api`. Controllers handle business logic, and Mongoose models persist data to **MongoDB**.
3. **Authentication** — the client stores a JWT in `localStorage`. An axios interceptor attaches it as a `Bearer` token to every request. The backend's `protect*` middlewares verify it and grant access based on the user's role.
4. **Real-time** — the client opens a WebSocket connection to the Socket.io server for live chat. Messages are persisted to MongoDB.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 13](https://nextjs.org) | React framework with App Router |
| [React 18](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Redux Toolkit](https://redux-toolkit.js.org) | State management |
| [FullCalendar](https://fullcalendar.io) | Event calendar |
| [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js) | Interactive maps |
| [react-toastify](https://fkhadra.github.io/react-toastify) | Toast notifications |
| [framer-motion](https://www.framer.com/motion) | Animations |

### Backend
| Technology | Purpose |
|------------|---------|
| [Node.js](https://nodejs.org) | JavaScript runtime |
| [Express](https://expressjs.com) | Web framework |
| [Mongoose](https://mongoosejs.com) | MongoDB ODM |
| [Socket.io](https://socket.io) | Real-time WebSockets |
| [JSON Web Token](https://jwt.io) | Authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [Nodemailer](https://nodemailer.com) | Email delivery (OTP) |
| [Mocha](https://mochajs.org) + [Chai](https://www.chaijs.com) | Testing |

### Database & Infrastructure
- **MongoDB** — primary database (via Mongoose)
- **Redis**, **Postgres**, **RabbitMQ** — available via `docker-compose.yml` for extended features
- **Prisma** schema included for ORM-based access

---

## 📁 Project Structure

```bash
syncronify/
├── client/                          # Next.js frontend
│   ├── public/                      # Static assets (logo, icons, images)
│   └── src/
│       ├── app/                     # App Router pages
│       │   ├── page.tsx             # Landing page
│       │   ├── authentication/      # Login / Sign up
│       │   ├── dashboard/           # General user dashboard
│       │   ├── admin-dashboard/     # Admin dashboard
│       │   └── application-admin-dashboard/  # Application admin dashboard
│       ├── components/              # Reusable UI components
│       │   ├── Calendar/            # FullCalendar wrapper
│       │   ├── Chat/                # Real-time chat UI
│       │   ├── MapBox/              # Mapbox components
│       │   ├── CreateEvent/         # Event creation form
│       │   ├── Login/               # Login form
│       │   ├── UserRegister/        # Registration + OTP form
│       │   └── ui/                  # shadcn-style primitives
│       ├── context/                 # Auth, Event, Location contexts
│       ├── redux/                   # Redux store + slices
│       └── utils/                   # axios instance, helpers
│
├── server/                          # Express + Socket.io backend
│   ├── src/
│   │   ├── appMain.js               # Express app entry
│   │   ├── controllers/             # Auth & event business logic
│   │   ├── models/                  # Mongoose schemas
│   │   ├── routes/                  # API route definitions
│   │   ├── middleware/              # JWT protection, error handling
│   │   ├── services/                # Mailer, utilities
│   │   ├── templates/mail/          # Email templates
│   │   └── utils/                   # Helpers (AppError, catchAsync, filterObj)
│   ├── websockets-service/          # Socket.io chat server
│   ├── database/                    # DB connection helpers
│   └── test/                        # Mocha test suite
│
├── docker-compose.yml               # Local infra (Mongo, Redis, Postgres, RabbitMQ)
├── Dockerfile                       # Backend container
├── Dockerfile.client                # Frontend container
└── package.json                     # Root scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (tested on v19)
- **npm** 8+
- **MongoDB** — local install *or* Docker

### 1. Clone the repository

```bash
git clone https://github.com/its-adityajohri/Syncronify.git
cd Syncronify
```

### 2. Install dependencies

```bash
# Install everything (server + client) from the root
npm run install:all
```

Or install manually:

```bash
# Server
cd server && npm install

# Client
cd client && npm install --legacy-peer-deps
```

> ⚠️ **Note:** `--legacy-peer-deps` is required because `react-mapbox-gl@5` and
> `mapbox-gl@3` have conflicting peer dependency ranges.

### 3. Configure environment variables

Copy the example files and edit them:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

See the [Configuration](#-configuration) section for all available variables.

### 4. Start MongoDB

```bash
# Option A: Local MongoDB
mongod --dbpath /path/to/data/dir

# Option B: Docker (recommended — starts Mongo, Redis, Postgres, RabbitMQ)
docker compose up -d
```

### 5. Run the application

```bash
# From the root — runs both server and client concurrently
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 — Backend (port 4000)
cd server && npm start

# Terminal 2 — Frontend (port 3000)
cd client && npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🔧 Configuration

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `4000` |
| `DB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/syncronify` |
| `JWT_SECRET` | JWT signing secret — **change in production!** | — |
| `CLIENT_URL` | Frontend origin (for CORS) | `http://localhost:3000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `SMTP_HOST` | SMTP server host | — |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_MAIL` | Sender email address | — |
| `SMTP_PASSWORD` | SMTP password / app password | — |

### Client (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL | `http://localhost:4000` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token (for maps) | — |

### 📧 About Email (OTP) Delivery

The OTP email requires SMTP credentials. There are two modes:

1. **Production** — set `SMTP_HOST`, `SMTP_PORT`, `SMTP_MAIL`, and `SMTP_PASSWORD`.
   A free option is [Brevo](https://www.brevo.com): `smtp-relay.brevo.com` on port `587`.

2. **Development (no email configured)** — when SMTP is empty, the server **does not
   crash** and instead returns the OTP in the API response as `devOtp`. The frontend
   displays it directly on the verification screen so you can complete sign-up
   without an email service. This **only** happens when `NODE_ENV !== 'production'`.

---

## 📡 API Reference

All endpoints are prefixed with `http://localhost:4000`.

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Service status check | No |

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user (sends OTP) | No |
| `POST` | `/api/auth/verify-otp` | Verify email with OTP (returns JWT) | No |
| `POST` | `/api/auth/login` | Log in (returns JWT) | No |
| `POST` | `/api/auth/send-otp` | Resend OTP | No |
| `POST` | `/api/auth/forgot-password` | Request password reset | No |
| `POST` | `/api/auth/reset-password` | Reset password with token | No |

### Events (`/api/events`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/events/all-posted-events` | Get all posted events | `genUser` |
| `POST` | `/api/events/create-personal-event` | Create a personal event | `genUser` |
| `POST` | `/api/events/create-event` | Create a posted event | `adminUser` |
| `GET` | `/api/events/user-events` | Get current user's events | `genUser` |
| `GET` | `/api/events/all-organization-events` | Get admin's posted events | `adminUser` |
| `GET` | `/api/events/event-details?eventId=` | Get a single event's details | `genUser` |

### Authentication headers

Protected endpoints require a JWT token. Send it as a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🗄️ Database Models

### User (`User`)
- `userName`, `firstName`, `lastName`
- `email` (validated, unique)
- `password` (bcrypt-hashed)
- `userType` — `genUser` | `adminUser` | `applicationAdminUser`
- `attendingEvents` — references to Event IDs
- `verified`, `otp`, `otp_expiry_time`
- `socket_id` (for real-time chat)
- `status` — `Online` | `Offline`

### Event
- `title`, `description`
- `imgLink`
- `location` — reference to Location
- `eventType` — `personal` | `posted`
- `eventDate`, `eventTiming` (`from` / `to`)
- **PostedEvent** adds: `communityName`, `organizationName`, `contact`, `attendees`, `capacity`, `admin`

### Location
- `locationName`
- `coordinates` (`latitude`, `longitude`)

### OneToOneMessage
- `participants` — array of User IDs
- `messages` — array of `{ to, from, type, text, file, created_at }`

### Community & Request
- Community and request models for group collaboration and admin approvals.

---

## 🚦 Authentication & Roles

### Flow

1. **Register** → POST `/api/auth/register` with `{ userName, email, password, userType }`
2. **Receive OTP** → sent via email (or shown on screen in dev mode)
3. **Verify** → POST `/api/auth/verify-otp` with `{ email, otp, userType }` → returns JWT
4. **Login** → POST `/api/auth/login` with `{ email, password, userType }` → returns JWT
5. **Access protected routes** → attach `Authorization: Bearer <token>`

### Role Protection

The backend provides three protect middlewares:

| Middleware | Allows |
|------------|--------|
| `protectGeneralUser` | `genUser` only |
| `protectAdminUser` | `adminUser` only |
| `protectApplicationAdminUser` | `applicationAdminUser` only |

Each middleware verifies the JWT, checks the user still exists, and validates that
the password hasn't changed since the token was issued.

---

## 🧪 Testing

The backend uses **Mocha** + **Chai** + **Supertest**.

```bash
# From the root
npm test

# Or directly
cd server && npm test
```

Current tests cover the health endpoint and JSON 404 handling.

---

## 🐳 Docker

The `docker-compose.yml` provisions all local infrastructure:

| Service | Image | Port(s) |
|---------|-------|---------|
| `app` | Backend (built from `Dockerfile`) | `8081 → 4000` |
| `mongodb` | `mongo:5` | `27017` |
| `postgres` | `postgres:14-alpine` | `5432` |
| `cache` | `redis:6.2-alpine` | `6379` |
| `rabbitmq` | `rabbitmq:3-management-alpine` | `5672`, `15672` |

```bash
# Build and start all services
docker compose up -d

# Start only MongoDB
docker compose up -d mongodb
```

---

## ☁️ Deployment

### Production build

```bash
# Build the client
cd client && npm run build

# Start the server (NODE_ENV=production)
cd server && NODE_ENV=production node serverMain.js
```

### Before deploying, ensure you:

1. Set a **strong, random `JWT_SECRET`**.
2. Configure **real SMTP credentials** so OTP emails are delivered.
3. Set `NODE_ENV=production` (disables the dev OTP fallback).
4. Set `CLIENT_URL` to your production frontend URL.
5. Use a managed MongoDB (Atlas) or a secure self-hosted instance.
6. Add a `NEXT_PUBLIC_MAPBOX_TOKEN` if using map features.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure your code passes the existing tests and follows the project's
code style.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

Made with ❤️ for effortless event management.

</div>
