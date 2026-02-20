FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install -g pnpm && npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "dev"]
