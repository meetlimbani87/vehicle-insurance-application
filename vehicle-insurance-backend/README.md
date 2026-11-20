# Vehicle Insurance Application Backend

Spring Boot 3 / Java 17 backend for the AI Vehicle Insurance Personal Claims & Policy Management Hub.
Database: PostgreSQL, with Flyway migrations and Spring Data JPA.

## Running Locally

```bash
# Needs a running PostgreSQL database (see the variables below)
# The "local" profile also picks up application-local.yml (OpenAI key)
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

The app starts on `http://localhost:8080`, context path `/api` (so auth is `POST /api/auth/login`, claims is `GET /api/claims`, etc). Flyway runs all pending migrations in `src/main/resources/db/migration` automatically on startup.

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DB_NAME` | `vehicle_insurance_db` | Database name |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `root` | Database password |
| `JWT_SECRET` | (dev HMAC key) | HMAC signing key for JWT tokens |
| `OPENAI_API_KEY` | (configured in application-local.yml) | OpenAI API Key for AI policy extraction & vision assessment |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI Model name |

### Seed Accounts
* **Demo user** (created by `DataSeeder`, not in the prod profile): `demo@vehicle.com` / `demo1234`
* **Admin**: `admin@vehicle.com` / `admin123`

---

## Module Status

| Module | Status | Notes |
|---|---|---|
| Auth (login/register) | Done | Postgres `users` table, BCrypt, signed JWT |
| **Policy** | Done | Postgres `policies` + `vehicles` tables, owned per-user, deterministic premium calculator, real document uploads (local disk), audit-logged |
| **Claim** | Done | User-Managed Claim Status Architecture (`Filed`, `Under Review`, `Approved`, `Rejected`, `Closed`), photo + document uploads, real timeline history, audit-logged |
| **AI Policy Auto-Fill & Extraction** | Done | PDFBox document parsing + OpenAI `gpt-4o-mini` schema extraction (`POST /api/policies/extract-preview` & `POST /api/policies/{id}/ai-analysis`) |
| **AI Claim Reasoning & Damage Engine** | Done | AI Claim Eligibility & Damage Assessment (`POST /api/claims/{id}/ai-assessment`), negation parser calibration (`windows appear unaffected` negation detection), repair cost calculation (₹18,500), `claim_damage_points` persistence |
| **AI Multi-Modal Vision Inspector** | Done | Base64 visual damage scanning (`OpenAiDamageVisionClient`) for damaged parts & photo consistency |
| Payment | Done | Installments auto-generated per policy, unified calendar + transaction logs (`/payments`) |
| Notification | Done | In-app notifications + daily pending claims progress reminder banner |
| Audit Log | Done | `GET /admin/audit-logs`, admin-only audit trail |
| Analytics | Done | Live metrics, claims by month, vehicle categories, avg settlement time |

---

## Key Backend Conventions

- **UUIDs**: UUID everywhere in real entities, generated via `gen_random_uuid()` / `UUID.randomUUID()`.
- **Status Fields**: Kept as validated `String` columns for seamless flexibility.
- **Migrations**: Sequential Flyway migrations in `src/main/resources/db/migration/`.
- **Ownership Scoping**: Every service layer method enforces `assertCanManage(...)` / `assertCanView(...)` checks.
- **API Keys**: OpenAI API keys exist strictly on the backend via environment variables, never exposed to React clients.
