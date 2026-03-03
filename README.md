# La Carta — Cocktail Recipes

A full-stack web application for discovering, creating, and saving cocktail recipes. Built for bartenders and cocktail enthusiasts to manage recipes, track favorites, and share team notes.

## Features

- **Browse & Search** — Paginated cocktail list with search by name
- **Cocktail CRUD** — Create, edit, and delete your own recipes with image uploads
- **Favorites** — Save cocktails to your favorites with counts visible to all users
- **Team Notes** — Share shift notes, 86'd items, and low stock alerts with your team
- **Auth** — JWT-based registration and login
- **Dark Mode** — Toggle between light and dark themes
- **PWA** — Installable with offline caching support
- **Responsive** — Mobile dock navigation and desktop navbar

## Prerequisites

- Node.js 20+
- PostgreSQL

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/cocktail-app.git
cd cocktail-app
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
DATABASE_URL="postgresql://<user>@localhost:5432/cocktail_app"
JWT_SECRET="change-this-to-a-long-random-secret"
PORT=3001
```

Run database migrations and seed data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Seed Data

The seed script creates a demo user and 8 classic cocktails:

- **User:** `bartender@mixology.app` / `password123`
- **Cocktails:** Old Fashioned, Margarita, Negroni, Daiquiri, Manhattan, Mojito, Whiskey Sour, Espresso Martini

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |

### Cocktails

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cocktails` | List cocktails (search, pagination) |
| GET | `/api/cocktails/:id` | Get a single cocktail |
| POST | `/api/cocktails` | Create a cocktail (auth required) |
| PUT | `/api/cocktails/:id` | Update a cocktail (owner only) |
| DELETE | `/api/cocktails/:id` | Delete a cocktail (owner only) |
| POST | `/api/cocktails/:id/favorite` | Toggle favorite (auth required) |
| GET | `/api/cocktails/favorites` | Get user's favorites (auth required) |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all team notes |
| POST | `/api/notes` | Create a note |
| DELETE | `/api/notes/:id` | Delete a note (author only) |

## Project Structure

```
cocktail-app/
├── client/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth and Theme providers
│       ├── lib/           # Axios instance
│       ├── pages/         # Route-level components
│       └── types/         # TypeScript interfaces
└── server/
    ├── prisma/            # Schema and migrations
    ├── uploads/           # Uploaded cocktail images
    └── src/
        ├── middleware/    # JWT auth middleware
        ├── routes/        # Express route handlers
        └── lib/           # Prisma client
```

## Scripts

### Server

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database |

### Client

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT