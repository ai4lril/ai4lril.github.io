#!/bin/bash

# Development setup script for ILHRF Data Collection Platform

echo "🚀 Setting up ILHRF Data Collection Platform for Development"

# Navigate to backend directory
cd backend

# Create .env.development file if it doesn't exist
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development file..."
    cat > .env.development << EOF
# Database
DATABASE_URL="postgresql://yugabyte:yugabyte@yugabytedb:5433/voice_data_collection?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Application
PORT=3001
NODE_ENV=development
EOF
    echo "✅ Created backend/.env.development"
else
    echo "ℹ️  backend/.env.development already exists"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    pnpm install
    echo "✅ Backend dependencies installed"
fi

# Generate Prisma client
echo "🗃️  Generating Prisma client..."
pnpm prisma generate
echo "✅ Prisma client generated"

# Navigate back to root
cd ..

# Start the development environment
echo "🐳 Starting development environment with Docker Compose..."
docker-compose -f compose.yml up --build -d

echo "🎉 Development environment is ready!"
echo "📊 Frontend: http://localhost:5577"
echo "🔧 Backend: http://localhost:5566/api"
echo "🗄️  YugaByteDB: localhost:5433"
echo "🔍 YugaByteDB UI: http://localhost:7000"
echo ""
echo "💡 All services are running with hot reloading enabled!"
echo "💡 Database admin: Use any PostgreSQL client to connect to localhost:5433"
