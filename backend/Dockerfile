FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["pnpm", "run", "start:prod"]
