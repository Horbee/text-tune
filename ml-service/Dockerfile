# Build stage
FROM node:24-alpine AS builder

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

ENV DATABASE_URL="file:./sqlite.db"

# Migrate the database
RUN pnpm dlx prisma migrate deploy

# Production stage
FROM node:24-alpine AS production

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies only & rebuild native modules
RUN pnpm install --frozen-lockfile --prod
RUN pnpm rebuild

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/*.db ./

# Set the database URL for the production environment
ENV DATABASE_URL="file:./sqlite.db"

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main"]
