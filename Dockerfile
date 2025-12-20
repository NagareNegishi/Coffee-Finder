# syntax=docker/dockerfile:1

# Use a specific Node.js version, defaulting to 22 if not provided.
ARG NODE_VERSION=22

################################################################################
# Stage 1: Build the application
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
# Copy package files (package.json and package-lock.json)
COPY package*.json ./
# Install ALL dependencies (including devDependencies for Vite)
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build





# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 80

# Run the application.
CMD npx serve



################################################################################
# Stage 2: Serve with nginx