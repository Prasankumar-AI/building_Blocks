# ─── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:alpine AS runner

# Security hardening
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Use non-root user
USER appuser

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
