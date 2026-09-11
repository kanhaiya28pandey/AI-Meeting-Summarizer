# Stage 1: Build JAR using Maven and Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Copy Maven descriptor and resolve dependencies for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source and build production artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE 21 Runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root system group and user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Prepare upload directory and set ownership
RUN mkdir -p /tmp/meeting-uploads && \
    chown -R appuser:appgroup /tmp/meeting-uploads && \
    chown -R appuser:appgroup /app

# Copy executable JAR from build stage
COPY --from=builder --chown=appuser:appgroup /build/target/backend-*.jar /app/app.jar

USER appuser

EXPOSE 8080

ENV SERVER_PORT=8080 \
    TEMP_UPLOAD_DIR=/tmp/meeting-uploads

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
