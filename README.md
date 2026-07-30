# Delivery Orders

A web application for accepting delivery orders. It has three screens: a **create
order** form where all six fields are mandatory (sender city and address, receiver city
and address, cargo weight, pickup date), an **order list** showing every order together
with its automatically generated order number, and a **read-only order view** opened by
clicking a row in the list.

The interface is available in **English and Russian** and in a **light and dark theme**,
both switchable from the header.

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

## Localization

The whole interface is translated into English and Russian. The two segmented buttons in
the header switch the language; the choice is written to `localStorage` under `lang` and
restored on the next visit, so no account or server round trip is involved. On a first
visit the language is detected from the browser, falling back to English for anything
other than English or Russian.

All copy lives in two hand-edited files, `web/src/i18n/locales/en.json` and
`web/src/i18n/locales/ru.json`; components contain no literal user-visible text. Order
data is never translated — cities and addresses are shown exactly as they were typed.

Dates, times and weights are formatted with `Intl` bound to the active language, so the
list shows `Jul 30, 2026` and `1,250.5 kg` in English and `30 июл. 2026 г.` and
`1 250,5 кг` in Russian. The row count under the table uses the correct Russian plural
form (`1 заказ`, `3 заказа`, `11 заказов`).

**The API is localized too.** Every request the frontend makes carries
`Accept-Language: en|ru`, and ASP.NET's request localization resolves the culture from
that header (unsupported values fall back to English). Validation messages and the "order
not found" problem details come from `ValidationMessages.resx` /
`ValidationMessages.ru.resx` and are resolved per request, so a server-side rejection
appears in the same language as the rest of the screen and responses carry a matching
`Content-Language` header:

```bash
curl -s -X POST http://localhost:8080/api/orders \
  -H 'Content-Type: application/json' -H 'Accept-Language: ru' \
  -d '{"senderCity":"","senderAddress":"","receiverCity":"","receiverAddress":"","weightKg":0,"pickupDate":"2000-01-01"}'
# → "Поле «Город отправителя» обязательно для заполнения.", "Вес должен быть больше 0 кг.", …
```

Because the messages come from satellite assemblies and the header is parsed with real
culture data, `InvariantGlobalization` is switched **off** in `api/Directory.Build.props`.

## Theme

The header also carries a light/dark toggle. It sets `data-theme="light|dark"` on the
`<html>` element — the single attribute HeroUI v3 keys its entire palette on, so no
component needs a `dark:` override — and persists the choice to `localStorage` under
`theme`. A tiny inline script in `index.html` applies the stored theme before the bundle
loads, so a reload never flashes the wrong background. The system `prefers-color-scheme`
setting is deliberately not consulted: the toggle is the only input.

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

**API** — 33 tests: unit tests for the order-number format, the domain entity and every
validation rule, plus integration tests that run the real application against a
throwaway PostgreSQL container via Testcontainers, including six that assert
`Accept-Language` behaviour (Russian and English validation messages, an unsupported
locale falling back to English, and a localized 404).

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

**Frontend** — 20 tests in 4 files:

- 5 on the create form: required-field errors, past pickup dates, out-of-range weights,
  the submitted payload, and mapping a server field error onto the right input;
- 6 on localization: copy re-rendering between languages, the active-language button
  state, Russian and English plural forms for the row count, `<html lang>`, and a check
  that the two locale files have identical key sets;
- 5 on the theme: the light default, toggling and restoring `data-theme`, persistence to
  `localStorage`, and the toggle's accessible label;
- 4 on the formatters: English and Russian dates, the localized weight unit, and whole
  numbers not being padded with decimals.

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
for immediate client-side feedback; the server remains the authority. Each side reads its
copy from its own message store — the locale JSON on the client, the `.resx` files on the
server — so the wording agrees in either language.

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
    Common/                       # validation filter, startup migration, localization setup
    Resources/                    # ValidationMessages.resx (+ .ru)
    Dockerfile
  tests/DeliveryOrders.Api.Tests/ # Unit/ and Integration/
  openapi/v1.json                 # generated at build, committed
web/
  src/
    api/                          # generated schema, typed client, query hooks
    features/orders/              # list, create and detail screens
    components/                   # layout, language switcher, theme toggle, state views
    i18n/                         # i18next setup, en/ru locale files, Intl formatters
    theme/                        # data-theme provider and useTheme()
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
- **`AddLocalization()` is called without `ResourcesPath`** — the resource marker type
  already lives in the `DeliveryOrders.Api.Resources` namespace, and
  `ResourceManagerStringLocalizerFactory` composes the root namespace with
  `ResourcesPath`. Setting both produced the prefix
  `DeliveryOrders.Api.Resources.Resources.ValidationMessages`, which matches no embedded
  resource, and every lookup silently returned the raw key instead of the message.
- **Validation messages use FluentValidation's lazy `WithMessage(_ => …)` overload** —
  the eager string overload would resolve the message once when the validator is
  constructed, before the request culture is known.

Localization adds three frontend dependencies, at the versions the design called for:
`i18next` 26.3.6, `react-i18next` 17.0.11 and `i18next-browser-languagedetector` 8.2.1.
They push the production bundle past Vite's default 500 kB advisory threshold (562 kB
raw, 176 kB gzipped); the warning is left visible rather than silenced by raising the
limit.

`npm audit` reports advisories in `openapi-typescript`'s transitive dependency chain
(`@redocly/openapi-core` → `minimatch` → `brace-expansion`). These are build-time only,
ship nothing to the browser, and have no upstream fix short of a major downgrade.
