# 🎬 What Should I Watch Tonight?

A full-stack, cinematic movie discovery platform designed to solve decision fatigue. Built with **React 18 + Vite + TypeScript + Tailwind CSS** on the frontend, **NestJS + Prisma ORM** on the backend, and powered by **The Movie Database (TMDB)** with persistent user collections stored in serverless **PostgreSQL on Neon**.

---

## 🌟 Key Features

1. **Interactive Mood & Time Engine**:
   - Filter by real moods: 😱 Scary, 😂 Funny, 🧠 Smart, 😭 Emotional, ❤️ Romantic, 🔥 Exciting.
   - Constrain by runtime: Under 90 minutes, 90–120 minutes, 2+ hours.
   - Filter by era: Classic (pre-2000), 2000–2010, 2010–2020, Recent (2020+).
   - Real TMDB mapping: transparent, documented translation to genre combinations and release date boundaries.
2. **🎲 Surprise Me Mode**:
   - Randomly picks an acclaimed film from TMDB matching criteria, complete with direct YouTube trailer playback and automatic session history tracking to prevent repetitive picks.
3. **Discover & Real-Time Search**:
   - Popular, Trending, Top-Rated, and Upcoming categories with infinite/paginated browsing.
   - Debounced search query synchronized with browser URL parameters.
4. **Cinematic Movie Details**:
   - High-definition backdrops, posters, ratings, cast & crew, similar titles, and embedded YouTube trailers.
5. **Persistent User Accounts & Collections**:
   - JWT authentication with secure password hashing via `bcryptjs`.
   - Access & refresh token session management with rotation.
   - **Personal Watchlist**: Bookmark movies to watch without full-page reloads.
   - **Watched History**: Log finished films with timestamps.
   - **Atomic State Transitions**: Marking a movie as watched automatically cleanses it from the watchlist in a single database transaction.
6. **Robust Security & Production Standards**:
   - Helmet security headers, rate limiting with `@nestjs/throttler`, global exception filters, and strict DTO validation via `class-validator`.
   - Zero exposure of TMDB secrets in the frontend bundle.

---

## 🏗️ Architecture

```
what-should-i-watch/
├── frontend/                     # React 18 + Vite + Tailwind CSS + TanStack Query
│   ├── src/
│   │   ├── api/                 # Centralized Axios client & services
│   │   ├── components/          # Reusable UI, layout & movie components
│   │   ├── context/             # AuthContext session provider
│   │   ├── pages/               # Home, Discover, Search, Details, Watchlist, Watched, Profile, Auth
│   │   ├── routes/              # Protected & public routing
│   │   ├── types/               # TMDB & User TypeScript models
│   │   └── utils/               # TMDB CDN helpers & formatters
│   ├── vercel.json              # Vercel SPA rewrites
│   ├── .env.example
│   └── package.json
│
├── backend/                      # NestJS REST API + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma        # User, RefreshToken, WatchlistItem, WatchedMovie
│   │   └── migrations/          # Neon SQL migrations
│   ├── src/
│   │   ├── auth/                # JWT strategies, guards, rotation, bcrypt
│   │   ├── common/              # Global filters, interceptors, decorators
│   │   ├── movies/              # Mood filter engine, surprise-me, discover
│   │   ├── tmdb/                # TMDB API proxy with caching & error handling
│   │   ├── users/               # Profile & user movie statistics
│   │   ├── watchlist/           # Watchlist endpoints & unique constraints
│   │   ├── watched/             # Watched endpoints & atomic transitions
│   │   ├── health/              # Liveness and Neon DB connection health
│   │   ├── app.module.ts
│   │   └── main.ts              # Swagger docs, CORS, Helmet
│   ├── render.yaml              # Render deployment blueprint
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🛠️ Prerequisites

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm**: v9 or higher
- **PostgreSQL Database**: Free cloud database from [Neon](https://neon.tech)
- **TMDB API Account**: Free developer API key from [The Movie Database](https://developer.themoviedb.org/)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

From the repository root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```ini
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Neon PostgreSQL Connection Strings
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# The Movie Database (TMDB) API Credential
# Provide your v3 API Key (or v4 Bearer token in TMDB_ACCESS_TOKEN)
TMDB_API_KEY="your_tmdb_api_key_v3_here"
TMDB_ACCESS_TOKEN=""

# JWT Authentication Secrets (Generate secure random strings in production)
JWT_ACCESS_SECRET="dev-super-secret-access-key-replace-in-production-12345"
JWT_REFRESH_SECRET="dev-super-secret-refresh-key-replace-in-production-67890"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

THROTTLE_TTL=60
THROTTLE_LIMIT=150
```

#### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```ini
# Points to the local backend proxy in development
VITE_API_BASE_URL=http://localhost:3000/api
```

---

### 3. Neon Database Setup & Prisma Migrations

1. Go to [Neon Console](https://console.neon.tech) and create a project (e.g. `what-should-i-watch`).
2. Neon provides two connection URLs:
   - **Pooled connection** (contains `-pooler` in hostname): Use for `DATABASE_URL`. Best for regular web requests via PgBouncer.
   - **Direct connection**: Use for `DIRECT_URL`. Essential for Prisma migrations to execute schema alterations without connection pooler lockouts.
3. Apply migrations and generate the Prisma Client:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Apply migrations to Neon database
npx prisma migrate dev --name init
```

---

### 4. Running Locally

You can launch both services concurrently in separate terminals:

```bash
# Terminal 1: Start Backend API (NestJS with Hot-Reload)
cd backend
npm run start:dev

# Terminal 2: Start Frontend Application (Vite Dev Server)
cd frontend
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Interactive Swagger Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🧪 Automated Tests

Run the test suite to verify critical business logic:

```bash
cd backend
npm run test
```

### Verified Test Suites:
- `movies.service.spec.ts`: Validates mood-to-genre mapping, runtime boundaries, era constraints, and surprise candidate filtering.
- `auth.service.spec.ts`: Validates unique email enforcement, password hashing, and generic credential failure handling.
- `watchlist.service.spec.ts`: Validates duplicate prevention and user ownership.
- `watched.service.spec.ts`: Validates duplicate prevention, atomic transition from watchlist to watched, and reciprocal transfers.

---

## ☁️ Production Deployment

### 1. Database (Neon)
- Use Neon's dashboard to monitor active connections and storage.
- Keep `DATABASE_URL` with connection pooling enabled for high concurrency.

### 2. Backend (Render)
1. In [Render](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Health Check Path**: `/api/health`
4. Set Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your Neon pooled connection string.
   - `DIRECT_URL`: Your Neon direct connection string.
   - `TMDB_API_KEY`: Your TMDB API key.
   - `JWT_ACCESS_SECRET`: A high-entropy random string.
   - `JWT_REFRESH_SECRET`: A high-entropy random string.
   - `FRONTEND_URL`: Your deployed Vercel domain (e.g. `https://what-should-i-watch.vercel.app`).
5. Copy your deployed Render backend URL (e.g. `https://what-should-i-watch-api.onrender.com`).

### 3. Frontend (Vercel)
1. In [Vercel](https://vercel.com), import your repository.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-service.onrender.com/api`
4. Deploy! The included `frontend/vercel.json` automatically ensures direct navigation to React Router sub-pages (such as `/movie/:id` or `/watchlist`) correctly routes to `index.html`.

---

## 📜 TMDB Attribution & Compliance

This application uses the TMDB API but is not endorsed or certified by TMDB.

- TMDB Logo & Data Terms: [https://www.themoviedb.org/documentation/api/terms-of-use](https://www.themoviedb.org/documentation/api/terms-of-use)
- All movie posters, plot synopses, cast information, and media originate directly from The Movie Database.
- No commercial affiliation or official endorsement is claimed.

---

## ❓ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Prisma migration error P1001 / P1002** | Ensure your `DIRECT_URL` points to Neon's non-pooled connection and that `?sslmode=require` is appended to the connection string. |
| **TMDB returns 401 / 403** | Verify `TMDB_API_KEY` is present in `backend/.env`. If using a v4 token, place it in `TMDB_ACCESS_TOKEN`. |
| **CORS error in browser** | Check that `FRONTEND_URL` in `backend/.env` exactly matches your frontend client address (including protocol `http://` or `https://` without a trailing slash). |
| **Vercel 404 on refresh** | Ensure `frontend/vercel.json` is present with the SPA rewrite rule. |

