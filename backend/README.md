# AI Meeting Summarizer — Backend

Spring Boot REST API gateway, business logic, and persistence layer for the AI Meeting Summarizer platform.

## Technology Stack
* **Java**: 21+
* **Spring Boot**: 4.1.1
* **Build Tool**: Maven / Maven Wrapper (`mvnw` / `mvnw.cmd`)
* **Persistence**: Spring Data JPA & Hibernate 7
* **Database**: PostgreSQL 18+ (with native JSONB support)

## Database Configuration
The backend connects to PostgreSQL using standard environment variables with configurable defaults:

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | JDBC Connection URL | `jdbc:postgresql://localhost:5432/meeting_summarizer` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |

> [!NOTE]
> Never hardcode or commit real credentials to Git. Export `DB_PASSWORD` in your local environment or pass it at runtime.

### Starting PostgreSQL & Creating Database
Ensure your PostgreSQL 18 service is running, then create the database if it does not already exist:
```sql
CREATE DATABASE meeting_summarizer;
```

Hibernate will automatically manage schema generation in development mode (`ddl-auto=update`), creating the `meetings` table with native `JSONB` support for key decisions and action items.

## Running the Backend Locally
Set your local database credentials and launch the application:
```bash
# Windows PowerShell
$env:DB_PASSWORD="your_password"
.\mvnw.cmd spring-boot:run

# Linux / macOS
DB_PASSWORD="your_password" ./mvnw spring-boot:run
```

## Running Tests
Verify persistence and database integration:
```bash
.\mvnw.cmd test -DDB_PASSWORD="your_password"
```

## Verification & Health Check
Verify the service health:
```bash
curl http://localhost:8080/api/health
```

Expected Response:
```json
{
  "status": "UP",
  "service": "AI Meeting Summarizer Backend"
}
```
