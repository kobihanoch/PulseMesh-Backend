# PulseMesh Backend

The PulseMesh backend is the Express API for the mobile-defibrillator registry and emergency simulator. It manages registration, authentication, devices, telemetry, geographic incident matching, simulated Push/LoRa alerts, editable marketing content, and bicycle routing.

- [Frontend repo](https://github.com/kobihanoch/PulseMesh-Frontend)

## Responsibilities

- Passwordless public equipment registration.
- PostgreSQL fleet management for registrants, defibrillators, LoRa devices, incidents, and candidates.
- MongoDB storage for telemetry history, notifications, and marketing content.
- Admin JWT authentication using HTTP-only access and refresh cookies.
- Geographic filtering and distance ordering for nearby defibrillators.
- Simulated Push and LoRa Downlink notification records.
- Telemetry ingestion and low-battery detection below 20%.
- OpenRouteService proxy for bicycle directions without exposing its API key.

## Architecture

```text
Next.js frontend
      |
      v
Express API :5000
  |       |        |
  v       v        v
Postgres MongoDB  OpenRouteService
```

The backend follows a module structure:

```text
src/modules/<feature>/
  <feature>.routes.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.repository.ts
  types/
    <feature>.request.types.ts
    <feature>.response.types.ts
```

Routes contain middleware and wiring, controllers handle HTTP, services contain business logic, repositories access databases, and Zod schemas validate requests and responses.

## Technology

- Node.js 20
- Express 5
- TypeScript
- Zod and Drizzle Zod
- PostgreSQL with Drizzle ORM/migrations and row-level security
- MongoDB Node.js driver
- JWT, bcrypt, Helmet, CORS, and rate limiting

## Database ownership

### Database architecture

```text
PostgreSQL

app_auth.user
      independent authentication identity

registry.registrant
  |-- 1:N --> registry.defibrillator
  |               |
  |               +-- referenced by incident candidates
  |
  +-- 1:N --> registry.lora_device
                  |
                  +-- optional link to one defibrillator

registry.incident
  +-- 1:N --> registry.incident_candidate
                  |-- required defibrillator
                  +-- optional LoRa device

MongoDB

marketing_content     standalone editable documents
telemetry             deviceId + DevEUI snapshots over time
notifications         registrant/device/incident UUID references
```

PostgreSQL is the source of truth for relational and current operational state. MongoDB is used for document-shaped content and append-oriented history. MongoDB UUID fields are logical references only; they are not cross-database foreign keys.

### PostgreSQL

- Authentication users and token versions
- Registrants
- Defibrillators
- LoRa devices and their current state
- Incidents
- Incident candidates and responses

PostgreSQL foreign keys cascade equipment deletion when a registrant is deleted. LoRa-to-defibrillator and candidate-to-LoRa references use `SET NULL` where the related LoRa association is optional.

### MongoDB

- `marketing_content`: editable home-page sections
- `telemetry`: historical battery/GPS reports
- `notifications`: simulated Push, low-battery, and LoRa alerts

MongoDB documents reference PostgreSQL UUIDs logically. Cross-database foreign keys and automatic cascades do not exist; telemetry and notification records are retained as history when a PostgreSQL entity is deleted.

## Row-level security and least privilege

PostgreSQL does not run normal API requests as the migration superuser. The migrations create three application roles:

| Role | Login | Purpose |
| --- | --- | --- |
| `app_runtime` | Yes | Restricted connection role used by Express |
| `app_guest` | No | Public registration, active incident/device reads, and login/refresh operations |
| `app_authenticated` | No | Authenticated admin operations |

`app_runtime` is configured with `NOINHERIT`, `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, `NOREPLICATION`, and `NOBYPASSRLS`. It is granted membership in the two non-login roles but must explicitly enter the appropriate role inside a transaction.

### Request security flow

```text
HTTP request
   |
   v
Express authentication middleware
   |
   v
withRlsTx transaction wrapper
   |-- public request ------> SET LOCAL ROLE app_guest
   |
   +-- valid admin JWT -----> set_config('app.user_id', ...)
                              SET LOCAL ROLE app_authenticated
   |
   v
PostgreSQL evaluates table grants + RLS policy
```

`SET LOCAL ROLE` and `set_config` are transaction-scoped, so identity and role state do not leak into another pooled request. The wrapper also rechecks the stored token version before executing protected operations.

### Policy examples

- Authentication users can read/update only the row matching `app.user_id`.
- Guest login lookup is limited by `app.login_identifier`.
- Public users may create registrations and equipment, but cannot perform general registry administration.
- Guests may read only working defibrillators, eligible active LoRa devices, and active incidents.
- Authenticated administration may manage registry records because every authenticated account in this project is an administrator.
- Database checks independently enforce valid battery, latitude, longitude, radius, and incident-close state.

### Privileged connections

`MIGRATION_DATABASE_URL` and `SEED_DATABASE_URL` are privileged and are used only for migrations/provisioning. `DATABASE_URL` must use the restricted `app_runtime` role. These credentials must remain separate in production.

The public telemetry endpoint currently performs its database update under an internal authenticated database role. That is acceptable for the course simulator, but a real deployment must authenticate/sign gateway reports before allowing that operation.

## API overview

| Base route | Purpose | Access |
| --- | --- | --- |
| `/health` | Health check | Public |
| `/auth` | Login, refresh, logout, session | Public/admin depending on operation |
| `/registrations` | Registration and admin registry management | Public/admin |
| `/devices` | Fleet management and telemetry history | Admin |
| `/incidents` | Simulator incidents and candidate responses | Public/admin |
| `/telemetry` | LoRa/gateway telemetry ingestion | Public simulator integration |
| `/notifications` | Paginated Push/LoRa history | Admin |
| `/marketing-content` | Public content and admin editing | Public/admin |
| `/routes/cycling` | Bicycle-route proxy | Public simulator |

## Telemetry flow

`POST /telemetry` accepts:

```json
{
  "devEui": "DEF0000000000017",
  "batteryPercentage": 75,
  "latitude": 31.9293,
  "longitude": 34.7987
}
```

The service updates the LoRa device in PostgreSQL, stores history in MongoDB, and creates a simulated low-battery Push notification for every report below 20%.

## Incident flow

1. Create an incident with GPS coordinates and a radius.
2. Read working defibrillators with recent locations.
3. Calculate geographic distance and keep nearby candidates.
4. Store candidate records in PostgreSQL.
5. Store simulated Push and available LoRa alerts in MongoDB.
6. Accept or decline candidates.
7. Proxy accepted-candidate bicycle routing to OpenRouteService.

![Simulator results powered by the backend](../Frontend/docs/screenshots/simulator/results.png)

## Development setup

### Requirements

- Node.js 20+
- npm
- Docker Desktop
- OpenRouteService API key

### Environment

Create `.env.development` from `.env.example`. Local Docker development uses:

```env
NODE_ENV=development
OPENROUTESERVICE_API_KEY=your_key
MIGRATION_DATABASE_URL=postgres://postgres:postgres@localhost:5434/pulsemesh
DATABASE_URL=postgres://app_runtime:devpassword@localhost:5434/pulsemesh
SEED_DATABASE_URL=postgres://postgres:postgres@localhost:5434/pulsemesh
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=pulsemesh
JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
JWT_VERIFY_SECRET=replace_me
```

Do not commit real production secrets.

### Install and run

```powershell
npm install
npm run orch:dev
npm run seed:admin
npm run seed:simulator
```

The Docker stack exposes:

- Express: `http://localhost:5000`
- PostgreSQL: `localhost:5434`
- MongoDB: `localhost:27017`

Verify with `http://localhost:5000/health`.

## Commands

```powershell
npm run dev
npm run orch:dev
npm run db:generate
npm run db:migrate
npm run seed:admin
npm run seed:simulator
npm run build
npm start
```

## Production status

Production deployment is not configured yet. Before deployment:

- Replace empty production PostgreSQL and MongoDB URLs.
- Provision a secure runtime PostgreSQL role; do not use the development role password.
- Make CORS frontend-origin driven.
- Correct and verify the production Docker build/start command.
- Use strong JWT secrets and HTTPS.
- Restrict/authenticate real telemetry gateways.
- Run migrations against Supabase and verify MongoDB Atlas network access.

## Known limitations

- Push, SMS, and LoRa delivery are simulated.
- Telemetry ingestion needs gateway/device authentication before real use.
- Cross-database cleanup is not transactional.
- OpenRouteService availability depends on external DNS/network access; one transient network retry is implemented.
- This API does not contact emergency services.
