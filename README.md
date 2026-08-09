# Syncronify — Event Management Software

Syncronify is an Event Management Software designed to streamline event planning and enhance productivity for both individuals and teams. In the dynamic landscape of college and professional life, a plethora of online and offline events often overwhelm individuals, leading to time wastage, inefficient event attendance, unexpected conflicts, and missed deadlines. Managing events and team execution further compounds the challenges, requiring coordination through various mediums, resulting in redundancy and reduced efficiency.

This software simplifies the complexities associated with event management, scheduling, planning, and collaboration by consolidating all necessary functionalities into a unified interface.

## ✨ Key Features

- **Event Scheduling Calendar** — manage personal and team events while avoiding conflicts and optimizing time utilization.
- **Map Venue Navigation** — Mapbox-powered navigation for offline events, making it easy to find venues.
- **Real-time Chat** — instant communication with event organizers and administrators (Socket.io).
- **Groups & Communities** — create and join groups for seamless collaboration on team events and calendar sharing.
- **Role-based Dashboards** — dedicated experiences for General Users, Admins, and Application Admins.
- **Secure Authentication** — JWT-based auth with OTP email verification and password reset flows.

## 🏗️ Architecture

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 13 (App Router), React 18, TypeScript, Tailwind CSS, Redux Toolkit, FullCalendar, Mapbox GL |
| Backend   | Node.js, Express, Socket.io, Mongoose (MongoDB) |
| Database  | MongoDB (primary) — Postgres / Redis / RabbitMQ available via docker-compose |
| Auth      | JWT + bcrypt + OTP email verification |

```
client/   → Next.js frontend (http://localhost:3000)
server/   → Express + Socket.io backend (http://localhost:4000)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local install or Docker)

### 1. Configure environment variables

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

Edit `server/.env` and set a strong `JWT_SECRET`. The SMTP settings are optional in
development — when they are not configured, OTP emails are logged to the server console
instead of being sent.

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because `react-mapbox-gl@5` and `mapbox-gl@3`
> have conflicting peer dependency ranges.

### 3. Start MongoDB

```bash
# Option A: local MongoDB (Windows service / mongod)
mongod --dbpath /your/data/dir

# Option B: via docker-compose (starts Mongo, Postgres, Redis, RabbitMQ)
docker compose up -d mongodb
```

### 4. Run the app

```bash
# Terminal 1 — backend
cd server && npm start

# Terminal 2 — frontend
cd client && npm run dev
```

Open **http://localhost:3000** 🎉

### Optional: Mapbox

To use the map/navigation features, set a Mapbox access token in `client/.env`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
```

## 🧪 Tests

```bash
cd server && npm test
```

## 🐳 Docker

The repository includes a `docker-compose.yml` that provisions MongoDB, Postgres,
Redis and RabbitMQ for local development.

## 📁 Project Structure

```
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # App Router pages (landing, auth, dashboards)
│       ├── components/      # UI components (Calendar, Chat, MapBox, ...)
│       ├── context/         # Auth, Event, Location React contexts
│       └── redux/           # Redux store + slices
└── server/                  # Express + Socket.io backend
    ├── src/
    │   ├── controllers/     # Auth & event controllers
    │   ├── models/          # Mongoose models (User, Event, Message, ...)
    │   ├── routes/          # API route definitions
    │   ├── middleware/      # Error handling, JWT protection
    │   └── services/        # Mailer, etc.
    ├── websockets-service/  # Socket.io chat server
    └── test/                # Mocha tests
```

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default `4000`) |
| `DB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret — **change in production** |
| `CLIENT_URL` | Frontend origin for CORS |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_MAIL` / `SMTP_PASSWORD` | Email delivery (optional in dev) |
| `NEXT_PUBLIC_BASE_URL` | Backend URL used by the frontend |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox token for map features (optional) |

## 📄 License

ISC
