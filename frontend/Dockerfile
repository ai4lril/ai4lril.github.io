FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "dev"]
