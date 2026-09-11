# AI Meeting Summarizer — Backend

Spring Boot REST API gateway and business layer for the AI Meeting Summarizer platform.

## Requirements
* Java 21+
* Maven (or included Maven Wrapper `mvnw` / `mvnw.cmd`)

## Running Locally
```bash
./mvnw spring-boot:run
```

## Health Check Endpoint
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
