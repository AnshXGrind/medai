# syntax=docker/dockerfile:1

# Build stage for Vite React frontend
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve static files with a lightweight web server (nginx)
FROM nginx:1.27-alpine AS serve
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .

# SPA routing: serve index.html for all routes
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
