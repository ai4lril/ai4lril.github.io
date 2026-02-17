# Voice Data Collection Platform

A comprehensive platform for collecting and processing voice data with support for multiple Indian languages, featuring a modern web interface and powerful NLP processing capabilities.

## 🏗️ Architecture

```
voice-data-collection/
├── frontend/          # Next.js React application
│   ├── app/          # Next.js 15 App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and configurations
│   ├── Dockerfile    # Frontend Docker configuration
│   └── package.json  # Frontend dependencies
├── backend/          # NestJS API server
│   ├── src/          # NestJS source code
│   ├── prisma/       # Database schema and migrations
│   ├── Dockerfile.dev # Backend development Docker config
│   └── package.json  # Backend dependencies
├── compose.yml       # Complete Docker Compose stack
└── dev-setup.sh      # One-command development setup
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- pnpm package manager

### Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd voice-data-collection
```

2. **Run the development setup**

```bash
./dev-setup.sh
```

This will:

- ✅ Set up the backend environment
- ✅ Install backend dependencies
- ✅ Generate Prisma client
- ✅ Start the complete stack (frontend, backend, database) with Docker Compose

## 📊 Services

Once running, you'll have access to:

- **Frontend**: `http://localhost:5577`
- **Backend API**: `http://localhost:5566/api`
- **YugaByteDB**: `localhost:5433`
- **Database Admin**: `http://localhost:7000` (YugaByteDB UI)
- **Database Admin**: `http://localhost:9000` (YugaByteDB tserver UI)

## 🛠️ Development Workflow

### Backend Development

```bash
cd backend
pnpm run start:dev  # Local development
```

### Frontend Development

```bash
cd frontend
npm run dev  # Local development
```

### Database Management

```bash
cd backend
pnpm prisma studio    # Database GUI
pnpm prisma migrate   # Run migrations
```

### Testing

```bash
cd backend
pnpm test            # Unit tests
pnpm test:cov        # Unit tests with coverage
pnpm test:integration # Integration tests (requires Postgres, Redis, MinIO)
pnpm test:e2e        # E2E tests
pnpm test:load       # Load tests (requires backend running)
```

**Load testing**: Run `pnpm test:load` from the backend directory with the backend running. Uses Artillery to simulate API load. Configuration: `backend/test/performance/load-test.yml`. Optional CI job: `backend-load-test`.

## 📁 Project Structure

### Frontend (`/frontend`)

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **State**: React hooks
- **Routing**: Next.js App Router

### Backend (`/backend`)

- **Framework**: NestJS
- **Database**: YugaByteDB (PostgreSQL-compatible)
- **ORM**: Prisma
- **Authentication**: JWT with Passport.js
- **API**: RESTful endpoints

## 🔧 Configuration

### Environment Variables

Backend environment variables are configured in `compose.yml`:

```yaml
environment:
  DATABASE_URL: "postgresql://yugabyte:yugabyte@yugabytedb:5433/voice_data_collection?schema=public"
  JWT_SECRET: "your-super-secret-jwt-key-change-this-in-production"
  PORT: 3001
  NODE_ENV: development
```

## 🗄️ Database

### YugaByteDB Setup (Default)

- **Port**: 5433 (YSQL), 9042 (YCQL), 6379 (YEDIS)
- **Database**: voice_data_collection
- **User**: yugabyte
- **Password**: yugabyte

### PostgreSQL Setup (Alternative)

To use PostgreSQL instead, comment out the `yugabytedb` service in `compose.yml` and uncomment the `postgres` service.

### Prisma Schema

Located at `backend/prisma/schema.prisma` with full user model including:

- Authentication fields
- Language preferences (up to 5 languages)
- Geographic information
- Profile data

## 🔐 Authentication

- **JWT-based authentication**
- **Signup/Login endpoints**
- **Protected NLP processing routes**
- **User profile management**

## 🧠 NLP Features

- **Named Entity Recognition (NER)**
- **Part-of-Speech Tagging (POS)**
- **Text Translation**
- **Sentiment Analysis**
- **Emotion Detection**
- **Translation Review System**

## 🌐 Supported Languages

The platform supports 23+ Indian languages including:

- Assamese, Bengali, Gujarati, Hindi
- Kannada, Malayalam, Marathi, Punjabi
- Tamil, Telugu, Urdu, English
- And many more regional languages

## 🐳 Docker Development

The `compose.yml` provides:

- ✅ **Hot reloading** for backend code changes
- ✅ **Volume mounting** for live development
- ✅ **Health checks** for service dependencies
- ✅ **Development optimization** with proper caching

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`
- **Database**: See `backend/prisma/schema.prisma`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is open-source and available under the MIT License.

---

**Built with ❤️ for linguistic diversity and AI research**
