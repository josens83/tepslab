# Environment Setup Guide

Complete guide for setting up environment variables for all environments.

## Generate Secrets

Before configuring environment variables, generate secure secrets:

```bash
# JWT Secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key (32 bytes, base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Server Environment Variables

### Development (`.env.development`)

```bash
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/tepslab-dev

# JWT
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Security
ENCRYPTION_KEY=<generated-base64-key>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Monitoring (optional in dev)
SENTRY_DSN=

# AI Features (optional in dev)
OPENAI_API_KEY=
```

### Production (`.env.production`)

```bash
# Server
NODE_ENV=production
PORT=5000
CLIENT_URL=https://tepslab.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tepslab?retryWrites=true&w=majority

# JWT
JWT_SECRET=<strong-production-secret-min-64-chars>
JWT_REFRESH_SECRET=<strong-production-secret-min-64-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth - Kakao
KAKAO_CLIENT_ID=<kakao-client-id>
KAKAO_CLIENT_SECRET=<kakao-client-secret>
KAKAO_REDIRECT_URI=https://api.tepslab.com/api/auth/kakao/callback

# OAuth - Naver
NAVER_CLIENT_ID=<naver-client-id>
NAVER_CLIENT_SECRET=<naver-client-secret>
NAVER_REDIRECT_URI=https://api.tepslab.com/api/auth/naver/callback

# OAuth - Google
GOOGLE_CLIENT_ID=<google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_REDIRECT_URI=https://api.tepslab.com/api/auth/google/callback

# OAuth - Facebook
FACEBOOK_CLIENT_ID=<facebook-app-id>
FACEBOOK_CLIENT_SECRET=<facebook-app-secret>
FACEBOOK_REDIRECT_URI=https://api.tepslab.com/api/auth/facebook/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=<github-client-id>
GITHUB_CLIENT_SECRET=<github-client-secret>
GITHUB_REDIRECT_URI=https://api.tepslab.com/api/auth/github/callback

# OAuth - Apple
APPLE_CLIENT_ID=com.tepslab.signin
APPLE_TEAM_ID=<apple-team-id>
APPLE_KEY_ID=<apple-key-id>
APPLE_PRIVATE_KEY_PATH=./certs/apple-private-key.p8

# Payment - TossPayments
TOSS_SECRET_KEY=<toss-secret-key>
TOSS_CLIENT_KEY=<toss-client-key>
TOSS_API_URL=https://api.tosspayments.com/v1

# Email - SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<email@gmail.com>
SMTP_PASSWORD=<app-specific-password>
EMAIL_FROM=TEPS Lab <noreply@tepslab.com>

# CORS
CORS_ORIGIN=https://tepslab.com,https://www.tepslab.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
ENCRYPTION_KEY=<strong-base64-encryption-key>

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Redis
REDIS_HOST=redis-service
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# Monitoring
SENTRY_DSN=https://<key>@<organization>.ingest.sentry.io/<project>

# Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# AI Features
OPENAI_API_KEY=sk-<openai-api-key>

# AWS S3 (for backups)
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=tepslab-backups
```

## OAuth Application Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (dev)
   - `https://api.tepslab.com/api/auth/google/callback` (prod)
6. Copy Client ID and Client Secret

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Configure OAuth Redirect URIs:
   - `http://localhost:5000/api/auth/facebook/callback` (dev)
   - `https://api.tepslab.com/api/auth/facebook/callback` (prod)
5. Copy App ID and App Secret

### GitHub OAuth

1. Go to [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. New OAuth App
3. Set Authorization callback URL:
   - `http://localhost:5000/api/auth/github/callback` (dev)
   - `https://api.tepslab.com/api/auth/github/callback` (prod)
4. Copy Client ID and generate Client Secret

### Apple Sign In

1. Go to [Apple Developer](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles
3. Register new App ID
4. Enable Sign In with Apple
5. Create Service ID
6. Configure Return URLs
7. Create Key for Sign In with Apple
8. Download private key (.p8 file)

### Kakao OAuth

1. Go to [Kakao Developers](https://developers.kakao.com/)
2. Create application
3. Activate Kakao Login
4. Set Redirect URI
5. Copy REST API Key

### Naver OAuth

1. Go to [Naver Developers](https://developers.naver.com/)
2. Register application
3. Set Callback URL
4. Copy Client ID and Client Secret

## Kubernetes Secrets

Create secrets in Kubernetes:

```bash
# Create namespace
kubectl create namespace tepslab

# Create secrets from .env file
kubectl create secret generic tepslab-secrets \
  --from-env-file=server/.env.production \
  --namespace=tepslab

# Or create individual secrets
kubectl create secret generic tepslab-secrets \
  --from-literal=JWT_SECRET='<secret>' \
  --from-literal=JWT_REFRESH_SECRET='<secret>' \
  --from-literal=MONGODB_URI='<uri>' \
  --from-literal=OPENAI_API_KEY='<key>' \
  --namespace=tepslab
```

## Client Environment Variables

### Development (`.env.development`)

```bash
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_GOOGLE_OAUTH_CLIENT_ID=<google-client-id>
VITE_FACEBOOK_APP_ID=<facebook-app-id>
VITE_GA_MEASUREMENT_ID=
```

### Production (`.env.production`)

```bash
VITE_API_URL=https://api.tepslab.com/api
VITE_WS_URL=wss://api.tepslab.com
VITE_GOOGLE_OAUTH_CLIENT_ID=<google-client-id>
VITE_FACEBOOK_APP_ID=<facebook-app-id>
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://<key>@<organization>.ingest.sentry.io/<project>
```

## Mobile Environment Variables

### Android (`android/app/build.gradle`)

```gradle
android {
    defaultConfig {
        manifestPlaceholders = [
            GOOGLE_MAPS_API_KEY: "<google-maps-api-key>",
            FACEBOOK_APP_ID: "<facebook-app-id>"
        ]
    }
}
```

### iOS (`ios/GoogleService-Info.plist`)

Download from Firebase Console and add to project.

### Environment Config (`mobile/.env`)

```bash
API_URL=https://api.tepslab.com/api
GOOGLE_MAPS_API_KEY=<key>
FIREBASE_SERVER_KEY=<key>
```

## Verification

After setting up environment variables, verify:

```bash
# Check server can start
cd server
npm run dev

# Check all required variables
node -e "
const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY'
];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(\`Missing: \${key}\`);
  } else {
    console.log(\`✓ \${key}\`);
  }
});
"
```

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different secrets per environment**
3. **Rotate secrets regularly** (every 90 days)
4. **Use strong, random secrets** (min 32 characters)
5. **Limit secret access** (principle of least privilege)
6. **Monitor secret usage** (audit logs)
7. **Use secret management tools** (AWS Secrets Manager, HashiCorp Vault)

## Troubleshooting

### MongoDB Connection Issues

```bash
# Test connection
mongosh "<MONGODB_URI>"

# Check network access
# - Whitelist IP in MongoDB Atlas
# - Check firewall rules
```

### Redis Connection Issues

```bash
# Test connection
redis-cli -h <host> -p <port> ping

# Should return: PONG
```

### OAuth Issues

- Verify redirect URIs match exactly
- Check OAuth app is activated
- Ensure correct scopes are requested
- Verify client ID and secret

## Production Checklist

- [ ] All secrets generated and secure
- [ ] OAuth apps configured for production domains
- [ ] Database connection string uses production cluster
- [ ] Redis configured with password
- [ ] CORS origins set to production domains only
- [ ] Rate limiting enabled
- [ ] Monitoring configured (Sentry)
- [ ] Email SMTP configured
- [ ] SSL/TLS certificates in place
- [ ] Environment variables in Kubernetes secrets
- [ ] No `.env` files in Docker images
