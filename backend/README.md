# Innovation Hub API (Spring Boot + PostgreSQL)

REST API backend for the Innovation Hub Rwanda platform.

## Prerequisites

- Java 22+
- Maven 3.9+
- Docker (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

```bash
cd backend
docker compose up -d
```

### 2. Run the API

```bash
mvn spring-boot:run
```

API runs at **http://localhost:8080**

### 3. Run the frontend

```bash
cd ..
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and connects to the API automatically.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Entrepreneur | jean@startup.rw | demo123 |
| Investor | sarah@invest.rw | demo123 |
| Admin | admin@innovationhub.rw | demo123 |
| Admin | olivierishimwe006@gmail.com | @olivier |

## Database

- **Host:** localhost:5432
- **Database:** innovation_hub
- **User:** postgres
- **Password:** `olivier` (or set `spring.datasource.password` in `application.yml`)

Schema is auto-created via JPA (`ddl-auto: update`). Demo data is seeded on first startup.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/register/entrepreneur` | Register entrepreneur |
| POST | `/api/auth/register/investor` | Register investor |
| GET | `/api/auth/me` | Current user |
| GET | `/api/applications` | List startups |
| POST | `/api/applications` | Submit application + AI eval |
| POST | `/api/applications/{id}/evaluate` | Re-run AI evaluation |
| PATCH | `/api/applications/{id}/status` | Admin approve/reject |
| GET | `/api/opportunities` | List opportunities |
| GET | `/api/events` | List events |
| GET | `/api/notifications` | User notifications |
| GET | `/api/conversations` | Messages |
| GET | `/api/investments` | Investments |
| GET | `/api/admin/stats` | Admin dashboard stats |

## Configuration

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/innovation_hub
    username: postgres
    password: ksteven
```

## AI Engine

The platform uses **OpenAI** to analyze uploaded business plans and budgets (PDF, DOCX, HTML).

### Setup OpenAI

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Set the environment variable before starting the backend:

```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-key-here"
mvn spring-boot:run

# Linux/macOS
export OPENAI_API_KEY=sk-your-key-here
mvn spring-boot:run
```

3. Check status: `GET http://localhost:8080/api/ai/status`

When configured, evaluations use model **gpt-4o-mini** and read document text. Without a key, the system falls back to the rules engine (still extracts document text for keyword scoring).

The Java `AiEngineService` also provides:
- Uniqueness scoring
- Risk analysis
- Profit prediction
- ROI prediction
- Investor matching

Runs automatically when an application is submitted.
