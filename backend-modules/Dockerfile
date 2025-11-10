# syntax=docker/dockerfile:1

# Minimal production image for the Express API
FROM node:20-alpine AS base

ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

# Install dependencies (only production)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY . .

# Expose port and start
EXPOSE 5000
CMD ["node", "server.js"]
