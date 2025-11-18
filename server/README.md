# TEPS Learning Platform - Backend API

Node.js + Express + TypeScript + MongoDB backend for the TEPS Learning Platform.

## Features

- ✅ RESTful API with Express
- ✅ TypeScript for type safety
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication
- ✅ Social login (Kakao, Naver)
- ✅ Password hashing with bcrypt
- ✅ CORS enabled
- ✅ Environment variable configuration

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (local or cloud)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tepslab
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_REDIRECT_URI=http://localhost:5000/api/auth/kakao/callback
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_REDIRECT_URI=http://localhost:5000/api/auth/naver/callback
CORS_ORIGIN=http://localhost:5173
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/kakao` - Kakao OAuth login
- `GET /api/auth/kakao/callback` - Kakao OAuth callback
- `GET /api/auth/naver` - Naver OAuth login
- `GET /api/auth/naver/callback` - Naver OAuth callback

### Health Check

- `GET /health` - Server health status

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (JWT, etc.)
│   └── index.ts         # Application entry point
├── .env.example         # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Authentication Flow

### Local Authentication

1. User registers with email/password
2. Password is hashed using bcrypt
3. JWT token is generated and returned
4. User includes token in Authorization header for protected routes

### Social Login (Kakao/Naver)

1. Frontend redirects to `/api/auth/kakao` or `/api/auth/naver`
2. User authenticates with social provider
3. Provider redirects back to callback URL with authorization code
4. Backend exchanges code for access token
5. Backend fetches user info from provider
6. User is created or found in database
7. JWT token is generated
8. Frontend is redirected with token in query params

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Protected routes with authentication middleware
- Role-based authorization
- CORS configuration
- Input validation
- MongoDB indexes for performance

## Testing

```bash
# Run tests (when implemented)
npm test
```

## License

ISC
