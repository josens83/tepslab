# Security Policy

## Overview

TEPS Lab takes security seriously. This document outlines our security features, practices, and procedures for reporting vulnerabilities.

## Security Features

### 1. Authentication & Authorization

#### Two-Factor Authentication (2FA)
- TOTP-based two-factor authentication using Google Authenticator/Authy
- Backup codes for account recovery
- Automatic backup code consumption tracking
- QR code generation for easy setup

**Endpoints:**
- `POST /api/auth/2fa/setup` - Generate 2FA secret and QR code
- `POST /api/auth/2fa/enable` - Enable 2FA after verification
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA token during login
- `POST /api/auth/2fa/backup-codes/regenerate` - Regenerate backup codes

#### OAuth 2.0 Social Login
- Supported providers:
  - Kakao
  - Naver
  - Google
  - Facebook
  - GitHub
  - Apple Sign In
- Secure token exchange
- Email verification for OAuth accounts
- Provider ID validation

#### JWT Token Management
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry)
- Secure HTTP-only cookies (if configured)
- Token rotation on refresh

### 2. Rate Limiting

#### Tiered Rate Limits
- **Free Tier:**
  - General API: 100 requests / 15 minutes
  - AI/Expensive operations: 10 requests / hour
  - File uploads: 20 uploads / hour
  - Auth endpoints: 5 attempts / 15 minutes

- **Premium Tier:**
  - General API: 500 requests / 15 minutes
  - AI/Expensive operations: 100 requests / hour
  - File uploads: 200 uploads / hour
  - Auth endpoints: 10 attempts / 15 minutes

- **Admin Tier:**
  - General API: 10,000 requests / 15 minutes
  - AI/Expensive operations: 1,000 requests / hour
  - File uploads: 5,000 uploads / hour
  - Auth endpoints: 50 attempts / 15 minutes

#### Redis-Based Distributed Rate Limiting
- Accurate rate limiting across multiple server instances
- Sliding window algorithm
- Automatic cleanup of expired entries
- Rate limit headers in responses

### 3. Security Audit Logging

All security-relevant events are logged with the following information:
- User ID (if applicable)
- Event type and description
- IP address
- User agent
- Timestamp
- Severity level
- Success/failure status
- Additional metadata

#### Logged Events:
- Login attempts (success/failure)
- Logout
- Registration
- Password changes
- Password reset requests
- Email changes
- 2FA enable/disable
- 2FA verification (success/failure)
- Backup code usage
- OAuth logins
- Permission denied events
- Suspicious activity
- Rate limit exceeded
- Account lock/unlock
- Account deletion

#### Automatic Threat Detection:
- Brute force detection (5+ failed logins in 5 minutes)
- Suspicious activity flagging
- Automatic log retention (90 days)

### 4. Data Encryption

#### At-Rest Encryption
- AES-256-GCM encryption for sensitive data
- Encrypted fields:
  - 2FA secrets
  - Backup codes
  - Payment information (if stored)
  - Personal identifiable information (PII)

#### In-Transit Encryption
- TLS 1.3 for all connections
- HTTPS enforced via Kubernetes Ingress
- Secure WebSocket connections (WSS)
- Certificate auto-renewal via cert-manager

#### Encryption Service Features:
- Secure key derivation (PBKDF2)
- Random IV generation
- Authentication tags for integrity
- Object encryption/decryption
- Password hashing with salt
- Token generation
- Data masking for logs

### 5. Input Validation & Sanitization

- MongoDB injection protection (`express-mongo-sanitize`)
- XSS protection (`xss-clean`)
- SQL injection protection (parameterized queries)
- Parameter pollution prevention (`hpp`)
- Request size limits (10MB)
- Content-Type validation
- Schema validation for all endpoints

### 6. Security Headers

Implemented via Helmet.js:
- Content Security Policy (CSP)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### 7. Vulnerability Scanning

#### Automated Scans:
- NPM audit (weekly via GitHub Actions)
- Dependency review on pull requests
- CodeQL static analysis
- Secret scanning with TruffleHog
- Security header validation

#### Manual Scanning:
```bash
# Run comprehensive security scan
./scripts/security-scan.sh

# Individual scans
npm audit --audit-level=moderate
npm outdated
```

### 8. Monitoring & Alerting

#### Prometheus Alerts:
- High CPU/Memory usage
- Service downtime
- High error rates
- API latency issues
- Database connection issues
- Certificate expiration warnings
- Pod restart frequency

#### Log Aggregation:
- ELK Stack for centralized logging
- Filebeat for log collection
- Logstash for log processing
- Elasticsearch for log storage
- Kibana for log visualization

#### Security Event Monitoring:
- Real-time security event tracking
- Critical event console warnings
- Failed login attempt monitoring
- Suspicious activity alerts

## Security Best Practices

### For Developers:

1. **Never commit secrets**
   - Use environment variables
   - Add `.env` to `.gitignore`
   - Use `.env.example` for templates

2. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update packages with known vulnerabilities
   - Test thoroughly after updates

3. **Follow secure coding practices**
   - Validate all user input
   - Use parameterized queries
   - Avoid `eval()` and similar dangerous functions
   - Use strict TypeScript mode
   - Handle errors properly

4. **Use security middleware**
   - Always use authentication middleware for protected routes
   - Implement appropriate rate limiting
   - Log security events

### For Deployment:

1. **Environment Configuration**
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Required environment variables
   JWT_SECRET=<strong-random-secret>
   JWT_REFRESH_SECRET=<strong-random-secret>
   ENCRYPTION_KEY=<strong-random-key>
   MONGODB_URI=<connection-string>
   REDIS_HOST=<redis-host>
   ```

2. **Kubernetes Security**
   - Use Secrets for sensitive data
   - Enable RBAC
   - Use Network Policies
   - Implement Pod Security Standards
   - Regularly update cluster

3. **Database Security**
   - Enable authentication
   - Use strong passwords
   - Restrict network access
   - Enable encryption at rest
   - Regular backups

4. **Monitoring**
   - Set up alerts for security events
   - Monitor logs regularly
   - Track failed login attempts
   - Review audit logs

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: [security contact email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline:
- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Based on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

## Security Updates

Security updates are released as needed. To stay informed:
- Watch this repository for releases
- Subscribe to security advisories
- Check the CHANGELOG for security fixes

## Compliance

This application implements security controls aligned with:
- OWASP Top 10
- CWE/SANS Top 25
- NIST Cybersecurity Framework
- GDPR data protection requirements (where applicable)

## Contact

For security-related questions or concerns:
- Security Email: [Your security email]
- PGP Key: [If applicable]

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who report vulnerabilities.

---

**Last Updated:** 2025-01-21
