#!/bin/bash

# Security Vulnerability Scanning Script for TEPS Lab
# This script runs various security scans and generates a report

set -e

echo "🔒 TEPS Lab Security Vulnerability Scan"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create security reports directory
REPORT_DIR="./security-reports"
mkdir -p "$REPORT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/security-scan-$TIMESTAMP.txt"

echo "📝 Report will be saved to: $REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. NPM Audit (Server)
echo "1️⃣  Running NPM Audit (Server)..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
cd server
if npm audit --audit-level=moderate >> "$REPORT_DIR/npm-audit-server-$TIMESTAMP.json" 2>&1; then
    echo -e "${GREEN}✓ No moderate or high severity vulnerabilities found in server${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ Vulnerabilities found in server packages${NC}" | tee -a "$REPORT_FILE"
    echo "  See $REPORT_DIR/npm-audit-server-$TIMESTAMP.json for details" | tee -a "$REPORT_FILE"
fi
cd ..
echo "" | tee -a "$REPORT_FILE"

# 2. NPM Audit (Client)
echo "2️⃣  Running NPM Audit (Client)..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
cd client
if npm audit --audit-level=moderate >> "$REPORT_DIR/npm-audit-client-$TIMESTAMP.json" 2>&1; then
    echo -e "${GREEN}✓ No moderate or high severity vulnerabilities found in client${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ Vulnerabilities found in client packages${NC}" | tee -a "$REPORT_FILE"
    echo "  See $REPORT_DIR/npm-audit-client-$TIMESTAMP.json for details" | tee -a "$REPORT_FILE"
fi
cd ..
echo "" | tee -a "$REPORT_FILE"

# 3. NPM Audit (Mobile - if exists)
if [ -d "mobile" ]; then
    echo "3️⃣  Running NPM Audit (Mobile)..." | tee -a "$REPORT_FILE"
    echo "-----------------------------------" | tee -a "$REPORT_FILE"
    cd mobile
    if npm audit --audit-level=moderate >> "$REPORT_DIR/npm-audit-mobile-$TIMESTAMP.json" 2>&1; then
        echo -e "${GREEN}✓ No moderate or high severity vulnerabilities found in mobile${NC}" | tee -a "$REPORT_FILE"
    else
        echo -e "${YELLOW}⚠ Vulnerabilities found in mobile packages${NC}" | tee -a "$REPORT_FILE"
        echo "  See $REPORT_DIR/npm-audit-mobile-$TIMESTAMP.json for details" | tee -a "$REPORT_FILE"
    fi
    cd ..
    echo "" | tee -a "$REPORT_FILE"
fi

# 4. Check for outdated packages
echo "4️⃣  Checking for outdated packages..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
echo "Server:" | tee -a "$REPORT_FILE"
cd server && npm outdated >> "$REPORT_DIR/outdated-packages-$TIMESTAMP.txt" 2>&1 || true
cd ..
echo "Client:" | tee -a "$REPORT_FILE"
cd client && npm outdated >> "$REPORT_DIR/outdated-packages-$TIMESTAMP.txt" 2>&1 || true
cd ..
echo -e "${YELLOW}ℹ See $REPORT_DIR/outdated-packages-$TIMESTAMP.txt for details${NC}" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 5. Check environment variables
echo "5️⃣  Checking environment configuration..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"

REQUIRED_ENV_VARS=(
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "MONGODB_URI"
    "ENCRYPTION_KEY"
)

ENV_FILE="server/.env"
if [ -f "$ENV_FILE" ]; then
    missing_vars=()
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo -e "${GREEN}✓ All critical environment variables are set${NC}" | tee -a "$REPORT_FILE"
    else
        echo -e "${RED}✗ Missing critical environment variables:${NC}" | tee -a "$REPORT_FILE"
        for var in "${missing_vars[@]}"; do
            echo "  - $var" | tee -a "$REPORT_FILE"
        done
    fi
else
    echo -e "${RED}✗ Environment file not found: $ENV_FILE${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 6. Check for common security misconfigurations
echo "6️⃣  Checking for security misconfigurations..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"

# Check if .env files are in .gitignore
if grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓ .env files are properly ignored in git${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${RED}✗ .env files are NOT in .gitignore${NC}" | tee -a "$REPORT_FILE"
fi

# Check for exposed secrets in git history (basic check)
if git log --all --pretty=format: --name-only | grep -q "\.env$"; then
    echo -e "${RED}✗ WARNING: .env files found in git history${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ No .env files found in git history${NC}" | tee -a "$REPORT_FILE"
fi

# Check for hardcoded secrets (basic pattern matching)
if grep -r "password.*=.*['\"]" server/src/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "req.body.password" | grep -q .; then
    echo -e "${YELLOW}⚠ Possible hardcoded passwords found in source code${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ No obvious hardcoded passwords found${NC}" | tee -a "$REPORT_FILE"
fi

echo "" | tee -a "$REPORT_FILE"

# 7. Check SSL/TLS configuration
echo "7️⃣  Checking SSL/TLS configuration..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"

if [ -d "k8s" ]; then
    if grep -q "cert-manager" k8s/*.yaml 2>/dev/null; then
        echo -e "${GREEN}✓ SSL/TLS configured with cert-manager${NC}" | tee -a "$REPORT_FILE"
    else
        echo -e "${YELLOW}⚠ cert-manager not found in Kubernetes configs${NC}" | tee -a "$REPORT_FILE"
    fi
else
    echo -e "${YELLOW}⚠ Kubernetes configs not found${NC}" | tee -a "$REPORT_FILE"
fi

echo "" | tee -a "$REPORT_FILE"

# 8. Check for security headers
echo "8️⃣  Checking security headers configuration..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"

if grep -q "helmet" server/src/index.ts 2>/dev/null; then
    echo -e "${GREEN}✓ Helmet security headers middleware is configured${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${RED}✗ Helmet security headers middleware not found${NC}" | tee -a "$REPORT_FILE"
fi

if grep -q "cors" server/src/index.ts 2>/dev/null; then
    echo -e "${GREEN}✓ CORS is configured${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ CORS configuration not found${NC}" | tee -a "$REPORT_FILE"
fi

echo "" | tee -a "$REPORT_FILE"

# Summary
echo "======================================" | tee -a "$REPORT_FILE"
echo "📊 Security Scan Complete!" | tee -a "$REPORT_FILE"
echo "======================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "Next steps:" | tee -a "$REPORT_FILE"
echo "1. Review the detailed reports in $REPORT_DIR" | tee -a "$REPORT_FILE"
echo "2. Fix any critical or high severity vulnerabilities" | tee -a "$REPORT_FILE"
echo "3. Update outdated packages (carefully test after updates)" | tee -a "$REPORT_FILE"
echo "4. Ensure all environment variables are properly set" | tee -a "$REPORT_FILE"
echo "5. Run this scan regularly (recommended: weekly)" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo -e "${GREEN}Full report saved to: $REPORT_FILE${NC}"
