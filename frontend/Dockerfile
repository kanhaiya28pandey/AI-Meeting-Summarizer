# Stage 1: Compile React application
FROM node:22-alpine AS builder
WORKDIR /build

# Build argument to set API base URL to relative /api for Nginx reverse proxy
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies deterministically via package-lock.json
COPY package*.json ./
RUN npm ci

# Copy application source and build production static bundle
COPY . .
RUN npm run build

# Stage 2: Serve static production assets with Nginx
FROM nginx:1.27-alpine AS runtime

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Remove default Nginx welcome page and configs
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA bundle from builder stage
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
