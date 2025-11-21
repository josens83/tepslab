#!/bin/bash

###############################################################################
# TEPS Lab Backup Script
# Backs up MongoDB, Redis, and uploaded files to S3 or local storage
###############################################################################

set -e

# Configuration
NAMESPACE="${NAMESPACE:-tepslab}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="tepslab-backup-${TIMESTAMP}"
S3_BUCKET="${S3_BUCKET:-}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_error "Namespace $NAMESPACE not found"
        exit 1
    fi

    log_info "Prerequisites check passed"
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: ${BACKUP_DIR}/${BACKUP_NAME}"
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
}

# Backup MongoDB
backup_mongodb() {
    log_info "Starting MongoDB backup..."

    MONGO_POD=$(kubectl get pods -n $NAMESPACE -l app=mongodb -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$MONGO_POD" ]; then
        log_error "MongoDB pod not found"
        return 1
    fi

    log_info "Found MongoDB pod: $MONGO_POD"

    # Create mongodump in pod
    kubectl exec -n $NAMESPACE $MONGO_POD -- mongodump \
        --out=/tmp/mongodb-backup \
        --gzip

    # Copy backup from pod to local
    kubectl cp -n $NAMESPACE $MONGO_POD:/tmp/mongodb-backup \
        "${BACKUP_DIR}/${BACKUP_NAME}/mongodb"

    # Cleanup temp backup in pod
    kubectl exec -n $NAMESPACE $MONGO_POD -- rm -rf /tmp/mongodb-backup

    log_info "MongoDB backup completed"
}

# Backup Redis
backup_redis() {
    log_info "Starting Redis backup..."

    REDIS_POD=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$REDIS_POD" ]; then
        log_error "Redis pod not found"
        return 1
    fi

    log_info "Found Redis pod: $REDIS_POD"

    # Trigger Redis save
    kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli BGSAVE

    # Wait for save to complete
    sleep 5

    # Copy RDB file
    kubectl cp -n $NAMESPACE $REDIS_POD:/data/dump.rdb \
        "${BACKUP_DIR}/${BACKUP_NAME}/redis-dump.rdb"

    log_info "Redis backup completed"
}

# Backup uploaded files
backup_uploads() {
    log_info "Starting uploads backup..."

    SERVER_POD=$(kubectl get pods -n $NAMESPACE -l app=server -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$SERVER_POD" ]; then
        log_error "Server pod not found"
        return 1
    fi

    log_info "Found server pod: $SERVER_POD"

    # Create tar archive in pod
    kubectl exec -n $NAMESPACE $SERVER_POD -- tar -czf /tmp/uploads-backup.tar.gz -C /app uploads

    # Copy archive from pod
    kubectl cp -n $NAMESPACE $SERVER_POD:/tmp/uploads-backup.tar.gz \
        "${BACKUP_DIR}/${BACKUP_NAME}/uploads.tar.gz"

    # Cleanup temp archive
    kubectl exec -n $NAMESPACE $SERVER_POD -- rm -f /tmp/uploads-backup.tar.gz

    log_info "Uploads backup completed"
}

# Create backup metadata
create_metadata() {
    log_info "Creating backup metadata..."

    cat > "${BACKUP_DIR}/${BACKUP_NAME}/metadata.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "namespace": "${NAMESPACE}",
  "components": {
    "mongodb": "$([ -d ${BACKUP_DIR}/${BACKUP_NAME}/mongodb ] && echo 'success' || echo 'failed')",
    "redis": "$([ -f ${BACKUP_DIR}/${BACKUP_NAME}/redis-dump.rdb ] && echo 'success' || echo 'failed')",
    "uploads": "$([ -f ${BACKUP_DIR}/${BACKUP_NAME}/uploads.tar.gz ] && echo 'success' || echo 'failed')"
  },
  "size": "$(du -sh ${BACKUP_DIR}/${BACKUP_NAME} | cut -f1)"
}
EOF

    log_info "Metadata created"
}

# Compress backup
compress_backup() {
    log_info "Compressing backup..."

    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    rm -rf "${BACKUP_NAME}"

    log_info "Backup compressed: ${BACKUP_NAME}.tar.gz"
}

# Upload to S3 (if configured)
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log_warn "S3_BUCKET not configured, skipping S3 upload"
        return 0
    fi

    log_info "Uploading backup to S3: s3://${S3_BUCKET}/backups/${BACKUP_NAME}.tar.gz"

    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed, skipping S3 upload"
        return 1
    fi

    aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
        "s3://${S3_BUCKET}/backups/${BACKUP_NAME}.tar.gz"

    log_info "Backup uploaded to S3"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."

    find "${BACKUP_DIR}" -name "tepslab-backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete

    # Cleanup S3 if configured
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 ls "s3://${S3_BUCKET}/backups/" | while read -r line; do
            BACKUP_DATE=$(echo $line | awk '{print $1}')
            BACKUP_FILE=$(echo $line | awk '{print $4}')

            if [ -n "$BACKUP_DATE" ] && [ -n "$BACKUP_FILE" ]; then
                DAYS_OLD=$(( ($(date +%s) - $(date -d "$BACKUP_DATE" +%s)) / 86400 ))

                if [ $DAYS_OLD -gt $RETENTION_DAYS ]; then
                    log_info "Deleting old S3 backup: $BACKUP_FILE (${DAYS_OLD} days old)"
                    aws s3 rm "s3://${S3_BUCKET}/backups/${BACKUP_FILE}"
                fi
            fi
        done
    fi

    log_info "Cleanup completed"
}

# Main execution
main() {
    log_info "===== TEPS Lab Backup Script ====="
    log_info "Starting backup process..."

    check_prerequisites
    create_backup_dir

    # Perform backups
    backup_mongodb || log_warn "MongoDB backup failed"
    backup_redis || log_warn "Redis backup failed"
    backup_uploads || log_warn "Uploads backup failed"

    create_metadata
    compress_backup
    upload_to_s3 || log_warn "S3 upload failed"
    cleanup_old_backups

    log_info "===== Backup completed successfully ====="
    log_info "Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    log_info "Backup size: $(du -sh ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | cut -f1)"
}

# Run main function
main
