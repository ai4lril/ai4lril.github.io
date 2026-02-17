# Functional API Testing Framework

This directory contains comprehensive functional tests for all APIs in the voice data collection platform.

## Structure

```
tests/functional/
├── backend/              # Backend API tests (NestJS)
│   ├── auth/            # Authentication endpoints
│   ├── speech/          # Speech recording endpoints
│   ├── write/           # Write feature endpoints
│   ├── question/        # Question feature endpoints
│   ├── transcription/   # Transcription endpoints
│   ├── nlp/             # NLP feature endpoints
│   ├── admin/           # Admin endpoints
│   └── utils/           # Test utilities
├── frontend/            # Frontend API route tests (Next.js)
│   ├── auth/            # Auth API routes
│   ├── api/             # Other API routes
│   └── utils/           # Test utilities
├── fixtures/            # Test data fixtures
├── helpers/             # Shared test helpers
└── config/              # Test configuration

```

## Running Tests

### Backend Tests

```bash
cd backend
pnpm test:functional
```

### Frontend Tests

```bash
cd frontend
pnpm test:functional
```

### All Tests

```bash
pnpm test:functional:all
```

## Test Environment

Tests use a separate test database and mock external services (SeaweedFS S3, Redis, etc.) to ensure isolation and speed.
