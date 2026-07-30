# Delivery Orders

A web application for accepting delivery orders. It has three screens: a **create
order** form where all six fields are mandatory (sender city and address, receiver city
and address, cargo weight, pickup date), an **order list** showing every order together
with its automatically generated order number, and a **read-only order view** opened by
clicking a row in the list.

Built with ASP.NET 9, Entity Framework Core 9, PostgreSQL 17 and React 19.

## Quick start

The only prerequisites are Docker and Docker Compose.

```bash
docker compose up --build
```

Then open:

| | |
| --- | --- |
| Application | <http://localhost:8080> |
| API reference (Scalar) | <http://localhost:8080/scalar/v1> |
| OpenAPI document | <http://localhost:8080/openapi/v1.json> |

The database schema is created automatically: the API applies its EF Core migrations on
startup, retrying while PostgreSQL finishes becoming available.

### Stopping

```bash
docker compose down      # stop, keep the data
docker compose down -v   # stop and delete the database volume
```

## Configuration

Every variable has a working default, so `.env` is optional. Copy `.env.example` to
`.env` to override.

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | `delivery` | Database name |
| `POSTGRES_USER` | `delivery` | Database user |
| `POSTGRES_PASSWORD` | `delivery` | Database password |
| `WEB_PORT` | `8080` | Host port the application is published on |

## Local development without Docker

Run only the database in Docker, then the API and the frontend on the host. Requires the
.NET 9 SDK and Node 24.

```bash
# 1. Database
docker compose up db -d

# 2. API — http://localhost:8080
dotnet run --project api/src/DeliveryOrders.Api

# 3. Frontend — http://localhost:5173, proxying /api to the API
cd web
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8080`, and the API enables CORS
for `http://localhost:5173` in the Development environment.

## Tests

**API** — 27 tests: unit tests for the order-number format, the domain entity and every
validation rule, plus integration tests that run the real application against a
throwaway PostgreSQL container via Testcontainers.

```bash
cd api
dotnet test DeliveryOrders.sln
```

Without a local .NET SDK, run them in a container. Testcontainers needs the Docker
socket and a reachable host address:

```bash
docker run --rm \
  -v "$PWD/api":/src -v dotnet-nuget:/root/.nuget/packages \
  -v /var/run/docker.sock:/var/run/docker.sock -w /src \
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal \
  --add-host host.docker.internal:host-gateway \
  mcr.microsoft.com/dotnet/sdk:9.0 dotnet test DeliveryOrders.sln
```

**Frontend** — 5 tests covering the create form: required-field errors, past pickup
dates, out-of-range weights, the submitted payload, and mapping a server field error
onto the right input.

```bash
cd web
npm install
npm test          # Vitest
npm run typecheck # tsc --noEmit
npm run build     # production bundle
```

## The OpenAPI contract

The API's OpenAPI document is the single source of truth for the request and response
shapes, and it is enforced on both sides.

`Microsoft.AspNetCore.OpenApi` generates the document; `Microsoft.Extensions.ApiDescription.Server`
writes it to `api/openapi/v1.json` during `dotnet build`, so it is reviewable in the
repository and shows up in diffs. The frontend generates its TypeScript types from that
file and consumes them with `openapi-fetch`:

```bash
cd web
npm run generate:api   # api/openapi/v1.json -> src/api/schema.d.ts
```

The frontend therefore declares no order interface of its own — renaming a field on the
server makes the frontend fail to type-check. The generated file is committed so
`npm ci && npm run build` works without a running API.

## Architecture

The API is a single ASP.NET 9 project organised in **vertical slices**: each operation
lives in one file under `Features/Orders/` containing its request DTO, validator,
handler and endpoint mapping, so the whole path for creating an order is readable in one
place. Layer discipline is kept without extra projects — `Domain/` has no EF Core or
ASP.NET dependency, EF Core types appear only under `Infrastructure/`, and entities never
cross the HTTP boundary.

**Order numbers** are `ORD-{yyyyMMdd}-{sequence}`, restarting daily. The sequence is
allocated with a single atomic statement:

```sql
INSERT INTO order_number_counters (day, last_value) VALUES (@day, 1)
ON CONFLICT (day) DO UPDATE SET last_value = order_number_counters.last_value + 1
RETURNING last_value;
```

One round trip, correct under concurrent creates, with no application lock and no
read-then-write race. A test asserts that 20 simultaneous creates produce 20 distinct
sequential numbers. The unique index on `order_number` is a backstop, not the mechanism.

**Validation** runs in a FluentValidation endpoint filter and returns RFC 9457
`ProblemDetails` with an `errors` dictionary keyed by camelCase field name, which the
frontend maps back onto individual inputs. The same rules are mirrored in a Zod schema
for immediate client-side feedback; the server remains the authority.

**In production there is one origin**: nginx serves the built frontend and
reverse-proxies `/api`, `/openapi`, `/scalar` and `/health` to the API, so no CORS
configuration is involved.

## Project layout

```
api/
  src/DeliveryOrders.Api/
    Program.cs                    # composition root
    Domain/                       # Order entity, order-number format
    Features/Orders/              # one file per operation
    Infrastructure/               # DbContext, configurations, migrations, generator
    Common/                       # validation filter, startup migration
    Dockerfile
  tests/DeliveryOrders.Api.Tests/ # Unit/ and Integration/
  openapi/v1.json                 # generated at build, committed
web/
  src/
    api/                          # generated schema, typed client, query hooks
    features/orders/              # list, create and detail screens
    components/                   # layout and shared state views
  nginx.conf                      # static serving + /api reverse proxy
  Dockerfile
docker-compose.yml
```

## Implementation notes

A few deliberate deviations from the versions originally planned, each forced by a real
conflict:

- **TypeScript 5.9.3, not 7.x** — `openapi-typescript` 7.13.0 declares a peer
  dependency on `typescript@^5.x`.
- **`react-router` 8.3.0 instead of `react-router-dom`** — the 7.12–8.2 range carries
  advisory [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2), and
  from v7 onwards `react-router` supersedes `react-router-dom` anyway.
- **HeroUI 3 is composition-based** over `react-aria-components` and has no `TextField`
  wrapper or provider, so form fields wire label association explicitly with
  `htmlFor`/`id`, `aria-describedby` and `data-invalid`.
- **`Microsoft.EntityFrameworkCore.Relational` is pinned explicitly** — Npgsql 9.0.4 only
  requires EF Core 9.0.1, which otherwise left the test project resolving an older EF
  Core than the API was compiled against.
- **Startup migration is skipped during document generation** — the OpenAPI exporter runs
  the application up to `app.Run()` at build time, with no database reachable.

`npm audit` reports advisories in `openapi-typescript`'s transitive dependency chain
(`@redocly/openapi-core` → `minimatch` → `brace-expansion`). These are build-time only,
ship nothing to the browser, and have no upstream fix short of a major downgrade.
