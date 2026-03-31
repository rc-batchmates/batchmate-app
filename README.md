# Batchmate

The next generation of Recurse Center tooling. Access the hub, manage your schedule & configure your RC thing — all in one place.

## Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS v4
- **Mobile**: Expo 54, React Native, NativeWind
- **Backend**: Hono on Cloudflare Workers, oRPC
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Auth**: Better Auth with Recurse Center OAuth
- **Monorepo**: pnpm workspaces + Turborepo
- **Linting**: Biome

## Project Structure

```
apps/
  api/           # Cloudflare Worker entry point
  web/           # React web app (Vite)
  mobile/        # React Native / Expo mobile app

packages/
  api/           # API contract, router, and procedures
  api-client/    # oRPC client with TanStack Query integration
  auth/          # Better Auth configuration
  db/            # Drizzle ORM schema and database client
  recurse-api/   # Recurse Center API client
  security-api/  # Security computer API client (door access)
  ui/            # Shared cross-platform UI components
```

## Prerequisites

- Node.js 22+
- pnpm 10.28.0 (`corepack enable` or `npm install -g pnpm@10.28.0`)

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in the values:

```sh
cp .dev.vars.example .dev.vars
```

| Variable | Description |
| --- | --- |
| `BETTER_AUTH_SECRET` | Generate with `pnpm --filter @batchmate/auth exec better-auth secret` |
| `RC_CLIENT_ID` | Recurse Center OAuth client ID |
| `RC_CLIENT_SECRET` | Recurse Center OAuth client secret |
| `BASE_URL` | API base URL (default: `http://localhost:8787`) |
| `VIRTUAL_CARD_SITE_CODE` | Site code for virtual card access (pick a random number above 256) |
| `VIRTUAL_CARD_PREFIX` | Prefix for virtual card IDs (pad with zeros to avoid RC ID collisions) |

### 3. Set up the database

```sh
pnpm db:generate-auth   # Generate auth schema
pnpm db:generate         # Generate Drizzle migrations
pnpm db:migrate          # Apply migrations to local D1
```

### 4. Run the dev server

```sh
pnpm dev
```

This starts the web app at `http://localhost:5173` and the API at `http://localhost:8787`.

### Mobile

```sh
pnpm --filter @batchmate/mobile start       # Expo dev client
pnpm --filter @batchmate/mobile go          # Expo Go
pnpm --filter @batchmate/mobile ios         # iOS simulator
pnpm --filter @batchmate/mobile android     # Android emulator
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start all dev servers (except mobile) |
| `pnpm build` | Build all packages |
| `pnpm check` | Run Biome lint checks |
| `pnpm check:fix` | Auto-fix lint issues |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply D1 migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm ship` | Build and deploy to Cloudflare |
| `pnpm tail` | Tail Cloudflare Worker logs |

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that:

1. Runs database migrations
2. Builds all packages with Turborepo
3. Deploys the API and web app to Cloudflare Workers

The app is served from **recurse.rocks** via Cloudflare.

### Mobile Deployment

```sh
pnpm --filter @batchmate/mobile deploy:ios
pnpm --filter @batchmate/mobile deploy:android
```

Builds are managed through Expo Application Services (EAS).
