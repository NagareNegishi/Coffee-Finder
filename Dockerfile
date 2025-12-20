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


################################################################################
# Stage 2: Serve with nginx

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Expose the port that the application listens on.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]