FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY . .

# Expose the API server port (configured in .env as 5050)
EXPOSE 5050

# Start backend server
CMD ["node", "server.js"]
