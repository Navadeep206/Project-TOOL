# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install all dependencies (dev dependencies needed for build)
RUN npm ci || npm install

# Copy application source
COPY . .

# Set Vite build environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build application for production
RUN npm run build

# Serve Stage
FROM nginx:alpine

# Copy production build assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for client-side routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for static serving
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
