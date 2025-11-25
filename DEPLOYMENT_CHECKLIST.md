# Deployment Checklist

Complete pre-deployment checklist for TEPS Lab platform.

## Pre-Deployment

### 1. Environment Setup

- [ ] Set all required environment variables in production
- [ ] Generate secure secrets (JWT, encryption keys)
- [ ] Configure OAuth applications (Google, Facebook, GitHub, Apple)
- [ ] Set up OpenAI API key
- [ ] Configure SMTP settings
- [ ] Set up Redis connection
- [ ] Configure MongoDB connection string
- [ ] Set up Sentry DSN for error tracking

### 2. Security

- [ ] Enable SSL/TLS certificates
- [ ] Configure CORS origins
- [ ] Set up rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Configure 2FA settings
- [ ] Review and update security policies
- [ ] Run security scan (`./scripts/security-scan.sh`)
- [ ] Audit NPM dependencies (`npm audit`)

### 3. Database

- [ ] Create production database
- [ ] Run database migrations (if any)
- [ ] Set up database backups
- [ ] Configure database connection pooling
- [ ] Set up MongoDB indexes
- [ ] Test database connection

### 4. Infrastructure

- [ ] Provision Kubernetes cluster
- [ ] Install cert-manager
- [ ] Install NGINX Ingress Controller
- [ ] Set up persistent volumes
- [ ] Configure autoscaling policies
- [ ] Set up load balancer

### 5. Monitoring

- [ ] Deploy Prometheus
- [ ] Deploy Grafana
- [ ] Configure Alertmanager
- [ ] Deploy ELK Stack
- [ ] Set up alert notifications (Slack, Email)
- [ ] Create monitoring dashboards
- [ ] Test alert system

## Deployment

### 1. Backend Deployment

```bash
# Using kubectl
cd /path/to/tepslab
./scripts/deploy.sh kubectl production

# OR using Helm
./scripts/deploy.sh helm production
```

- [ ] Deploy server pods
- [ ] Deploy MongoDB
- [ ] Deploy Redis
- [ ] Verify all pods are running
- [ ] Check logs for errors
- [ ] Test API endpoints

### 2. Frontend Deployment

- [ ] Build production bundle
- [ ] Deploy to CDN or static hosting
- [ ] Configure environment variables
- [ ] Test all routes
- [ ] Verify API connections

### 3. Mobile App

- [ ] Build iOS app
- [ ] Build Android app
- [ ] Test on real devices
- [ ] Submit to App Store
- [ ] Submit to Play Store

### 4. Monitoring Stack

```bash
kubectl apply -f k8s/monitoring-stack.yaml
```

- [ ] Verify Prometheus is scraping metrics
- [ ] Check Grafana dashboards
- [ ] Test alerts
- [ ] Verify log collection

## Post-Deployment

### 1. Verification

- [ ] Health check endpoint (`/health`)
- [ ] User registration flow
- [ ] User login flow
- [ ] 2FA setup and verification
- [ ] OAuth login (all providers)
- [ ] Payment processing
- [ ] Course enrollment
- [ ] AI tutor functionality
- [ ] File uploads
- [ ] Email notifications
- [ ] Push notifications (mobile)

### 2. Performance

- [ ] Run load tests
- [ ] Check response times
- [ ] Verify caching works
- [ ] Test autoscaling
- [ ] Monitor memory usage
- [ ] Monitor CPU usage

### 3. Security

- [ ] SSL/TLS verification
- [ ] Security headers check
- [ ] Rate limiting test
- [ ] Authentication test
- [ ] Authorization test
- [ ] OWASP Top 10 check

### 4. Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Enable real-user monitoring
- [ ] Configure log retention

## Rollback Plan

### Preparation

- [ ] Document current version
- [ ] Tag release in Git
- [ ] Backup database
- [ ] Note current pod counts
- [ ] Save current configuration

### Rollback Steps

```bash
# Rollback deployment
kubectl rollout undo deployment/tepslab-server -n tepslab

# OR using Helm
helm rollback tepslab -n tepslab
```

- [ ] Execute rollback command
- [ ] Verify pods are running
- [ ] Check application health
- [ ] Restore database if needed
- [ ] Notify team

## Emergency Contacts

- **DevOps Team**: [Contact info]
- **Database Admin**: [Contact info]
- **Security Team**: [Contact info]
- **On-Call Engineer**: [Contact info]

## Environment-Specific Checklists

### Staging

- [ ] Same as production but with test data
- [ ] Configure test payment gateway
- [ ] Use staging OAuth apps
- [ ] Lower resource limits
- [ ] More verbose logging

### Production

- [ ] Real payment gateway
- [ ] Production OAuth apps
- [ ] Optimized resource limits
- [ ] Production-level logging
- [ ] Enable all monitoring
- [ ] Set up backup automation

## Performance Targets

- [ ] API response time < 200ms (p95)
- [ ] Page load time < 2s
- [ ] Time to Interactive < 3s
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%

## Compliance

- [ ] GDPR compliance (if applicable)
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Cookie consent implemented

## Documentation

- [ ] Update README.md
- [ ] Update API documentation
- [ ] Update deployment guide
- [ ] Document environment variables
- [ ] Create runbooks
- [ ] Update changelog

## Sign-Off

- [ ] Tech Lead approval
- [ ] Security review passed
- [ ] QA testing completed
- [ ] Stakeholder approval
- [ ] Final go/no-go decision

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Notes**: _______________
