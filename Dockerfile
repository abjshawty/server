# Use Node.js LTS as the base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for building
RUN npm ci

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Create a production image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
# Copy prisma directory
COPY prisma ./prisma/
# Copy built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm ci --only=production

# Install Prisma and generate client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]