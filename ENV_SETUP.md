# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://letschat:letschat123@localhost:5432/letschat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STUN_SERVER=stun:stun.l.google.com:19302
```

## Setup Instructions

1. Copy the backend environment variables to `backend/.env`
2. Copy the frontend environment variables to `frontend/.env.local`
3. Update the values according to your local setup
4. Make sure PostgreSQL and Redis are running (or use Docker Compose)

