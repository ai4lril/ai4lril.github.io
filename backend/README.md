# Voice Data Collection Backend

A NestJS backend API for voice data collection with NLP processing capabilities.

## Features

- User authentication (signup/login) with JWT
- YugaByteDB integration
- NLP endpoints for NER, POS tagging, translation, sentiment analysis, and emotion detection
- CORS enabled for frontend integration

## Setup

### Quick Development Setup

1. **Run the development setup script** (recommended):
```bash
# From the root directory
./dev-setup.sh
```

This will:
- Create the `backend/.env.development` file
- Install backend dependencies
- Generate Prisma client
- Start the complete development environment (frontend, backend, database) with Docker Compose

### Manual Setup

1. **Install dependencies**:
```bash
cd backend
pnpm install
```

2. **Environment variables are configured in compose.yml**:
```env
# Database
DATABASE_URL="postgresql://yugabyte:yugabyte@yugabytedb:5433/voice_data_collection?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Application
PORT=3001
NODE_ENV=development
```

3. **Generate Prisma client**:
```bash
cd backend
pnpm prisma generate
```

4. **Start development environment**:
```bash
# From the root directory
docker-compose -f compose.yml up --build
```

### Development Features

- ✅ **Hot Reloading**: Code changes automatically restart the server
- ✅ **Volume Mounting**: Source code is mounted for live development
- ✅ **Health Checks**: Services wait for dependencies to be ready
- ✅ **Environment Isolation**: Development-specific configuration
- ✅ **Database Persistence**: YugaByteDB data persists between restarts

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/me` - Get current user profile (requires authentication)

### NLP Processing (requires authentication)
- `POST /api/ner` - Named Entity Recognition
- `POST /api/pos` - Part-of-Speech Tagging
- `POST /api/translate` - Text Translation
- `POST /api/translate-review` - Review Translation Quality
- `POST /api/sentiment` - Sentiment Analysis
- `POST /api/emotion` - Emotion Detection

## User Schema

The user model includes the following fields:
- first_name, last_name, display_name
- username, password, email, phone_number
- current_residence_pincode, birth_place_pincode, birth_date
- gender, religion, mother
- first_language through fifth_language (optional)
- profile_picture_url (optional)

## Development

```bash
# Start in development mode
pnpm run start:dev

# Build for production
pnpm run build

# Run tests
pnpm run test
```