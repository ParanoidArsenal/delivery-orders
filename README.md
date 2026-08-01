# Delivery Orders

Приложение для приёма заявок на доставку: форма создания, список заказов и просмотр
заказа. ASP.NET 9, EF Core 9, PostgreSQL 17, React 19, HeroUI 3.

## Запуск

Нужен только Docker.

```bash
docker compose up --build
```

| | |
| --- | --- |
| Приложение | <http://localhost:8080> |
| Scalar | <http://localhost:8080/scalar/v1> |
| OpenAPI | <http://localhost:8080/openapi/v1.json> |

Схему создавать руками не нужно: API накатывает миграции на старте, повторяя попытки, пока
поднимается база. Остановить — `docker compose down`, вместе с данными — `down -v`.

## Что на экранах

В форме шесть обязательных полей, разбитых на отправителя, получателя и груз. Номер заказа
присваивается автоматически.

В списке над таблицей сводка (количество, общий вес, ближайший забор), поиск по номеру,
городу и адресу и сортировка по номеру, весу и дате. Считается в браузере из того же
ответа, который API уже отдаёт, отдельных эндпоинтов под это нет. Карточка заказа
открывается кликом по строке, только чтение.

Язык (RU/EN) и тема переключаются в шапке, выбор лежит в `localStorage`. Тема — это атрибут
`data-theme` на `<html>`, на нём завязана вся палитра HeroUI 3, поэтому `dark:`-классов в
компонентах нет; скрипт в `index.html` применяет её до загрузки бандла, чтобы не мигал
белый фон.

## Локализация

Тексты лежат в `web/src/i18n/locales/en.json` и `ru.json`, литералов в компонентах нет.
Данные заказов не переводятся. Даты и веса форматируются через `Intl` по активному языку
(`Jul 30, 2026` / `1,250.5 kg` против `30 июл. 2026 г.` / `1 250,5 кг`), счётчик строк
знает русские формы множественного числа: `1 заказ`, `3 заказа`, `11 заказов`.

Бэкенд локализован тоже. Фронт шлёт `Accept-Language: en|ru`, ASP.NET резолвит культуру из
заголовка, сообщения валидации берутся из `ValidationMessages.resx` / `.ru.resx` на каждый
запрос:

```bash
curl -s -X POST http://localhost:8080/api/orders \
  -H 'Content-Type: application/json' -H 'Accept-Language: ru' \
  -d '{"senderCity":"","senderAddress":"","receiverCity":"","receiverAddress":"","weightKg":0,"pickupDate":"2000-01-01"}'
# → "Поле «Город отправителя» обязательно для заполнения.", "Вес должен быть больше 0 кг.", …
```

Ради сателлитных сборок `InvariantGlobalization` в `api/Directory.Build.props` выключен.

## Настройки

У всех переменных есть рабочие значения, `.env` не обязателен. Переопределить — скопировать
`.env.example`.

| Переменная | По умолчанию | Зачем |
| --- | --- | --- |
| `POSTGRES_DB` | `delivery` | Имя базы |
| `POSTGRES_USER` | `delivery` | Пользователь |
| `POSTGRES_PASSWORD` | `delivery` | Пароль |
| `WEB_PORT` | `8080` | Порт приложения |

## Разработка без Docker

В контейнере остаётся только база. Нужны .NET 9 SDK и Node 24.

```bash
docker compose up db -d
dotnet run --project api/src/DeliveryOrders.Api   # http://localhost:8080
cd web && npm install && npm run dev              # http://localhost:5173
```

Vite проксирует `/api` на 8080, API в Development разрешает CORS для порта 5173.

## Тесты

Бэкенд — 36 тестов: юниты на формат номера, сущность и правила валидации плюс
интеграционные, которые гоняют реальное приложение против одноразового контейнера
PostgreSQL через Testcontainers. Фронтенд — 57 тестов в 9 файлах: форма и маппинг серверных
ошибок на поля, языки, тема, форматтеры, таблица, логика поиска и сортировки, карточка.

```bash
cd api && dotnet test DeliveryOrders.sln
cd web && npm test && npm run typecheck && npm run build
```

## Контракт OpenAPI

Документ OpenAPI — источник правды по формам запросов и ответов.
`Microsoft.Extensions.ApiDescription.Server` пишет его в `api/openapi/v1.json` на
`dotnet build`, так что он лежит в репозитории и виден в диффах, а фронт генерирует из него
типы и ходит через `openapi-fetch`:

```bash
cd web && npm run generate:api   # api/openapi/v1.json -> src/api/schema.d.ts
```

Своего интерфейса заказа на фронте поэтому нет: переименуете поле на сервере — упадёт
тайпчек. Сгенерированный файл закоммичен, чтобы сборка шла без запущенного API.

## Как устроено

API — один проект, нарезанный вертикальными слайсами: операция лежит в одном файле в
`Features/Orders/` вместе со своим DTO, валидатором, хендлером и маппингом эндпоинта. Слои
при этом не размазаны по лишним проектам: в `Domain/` нет ни EF Core, ни ASP.NET, типы EF
живут только в `Infrastructure/`, сущности не выходят за HTTP-границу.

Номера заказов — `ORD-{yyyyMMdd}-{sequence}`, нумерация перезапускается каждый день.
Последовательность выдаётся одним атомарным запросом:

```sql
INSERT INTO order_number_counters (day, last_value) VALUES (@day, 1)
ON CONFLICT (day) DO UPDATE SET last_value = order_number_counters.last_value + 1
RETURNING last_value;
```

Один round trip, без блокировок в приложении и без гонки read-then-write; тест проверяет,
что 20 одновременных созданий дают 20 разных номеров. Уникальный индекс на `order_number`
тут страховка, а не механизм.

Валидация живёт в endpoint-фильтре FluentValidation и отдаёт `ProblemDetails` по RFC 9457
со словарём `errors` по camelCase-именам полей, который фронт раскладывает обратно по
инпутам. Те же правила продублированы Zod-схемой для мгновенной подсказки, но авторитет
остаётся за сервером. В проде nginx раздаёт собранный фронт и проксирует `/api`, `/openapi`,
`/scalar` и `/health` на API, так что CORS не нужен.

## Структура

```
api/
  src/DeliveryOrders.Api/
    Domain/                       # сущность Order, формат номера
    Features/Orders/              # по файлу на операцию
    Infrastructure/               # DbContext, миграции, генератор номеров
    Common/                       # фильтр валидации, миграции на старте, локализация
    Resources/                    # ValidationMessages.resx (+ .ru)
  tests/DeliveryOrders.Api.Tests/ # Unit/ и Integration/
  openapi/v1.json                 # генерируется при сборке, закоммичен
web/
  src/
    api/                          # схема, типизированный клиент, хуки
    features/orders/              # список, создание, карточка
    components/                   # лейаут, переключатели, состояния
    i18n/                         # i18next, локали, форматтеры
    theme/                        # провайдер data-theme
  nginx.conf
docker-compose.yml
```
