FROM node:20-alpine AS builder
WORKDIR /app

# cache dependency installation
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2.10-alpine AS production
COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
