#!/bin/bash

###############################################################################
# TEPS Lab Restore Script
# Restores MongoDB, Redis, and uploaded files from backup
###############################################################################

set -e

# Configuration
NAMESPACE="${NAMESPACE:-tepslab}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_FILE="$1"
S3_BUCKET="${S3_BUCKET:-}"

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

# Show usage
usage() {
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Examples:"
    echo "  $0 tepslab-backup-20250121_120000.tar.gz"
    echo "  $0 /backups/tepslab-backup-20250121_120000.tar.gz"
    echo "  S3_BUCKET=my-bucket $0 s3://my-bucket/backups/tepslab-backup-20250121_120000.tar.gz"
    echo ""
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if [ -z "$BACKUP_FILE" ]; then
        log_error "Backup file not specified"
        usage
    fi

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

# Download backup from S3 if needed
download_backup() {
    if [[ "$BACKUP_FILE" == s3://* ]]; then
        log_info "Downloading backup from S3..."

        if ! command -v aws &> /dev/null; then
            log_error "AWS CLI is not installed"
            exit 1
        fi

        LOCAL_BACKUP="${BACKUP_DIR}/$(basename $BACKUP_FILE)"
        aws s3 cp "$BACKUP_FILE" "$LOCAL_BACKUP"
        BACKUP_FILE="$LOCAL_BACKUP"

        log_info "Backup downloaded to: $LOCAL_BACKUP"
    fi
}

# Extract backup
extract_backup() {
    log_info "Extracting backup..."

    if [ ! -f "$BACKUP_FILE" ]; then
        # Try adding backup directory
        if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
            BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
        else
            log_error "Backup file not found: $BACKUP_FILE"
            exit 1
        fi
    fi

    EXTRACT_DIR=$(dirname "$BACKUP_FILE")/$(basename "$BACKUP_FILE" .tar.gz)

    tar -xzf "$BACKUP_FILE" -C "$(dirname $BACKUP_FILE)"

    log_info "Backup extracted to: $EXTRACT_DIR"
}

# Show backup metadata
show_metadata() {
    if [ -f "$EXTRACT_DIR/metadata.json" ]; then
        log_info "Backup metadata:"
        cat "$EXTRACT_DIR/metadata.json"
    fi
}

# Confirm restore
confirm_restore() {
    log_warn "⚠️  WARNING: This will overwrite existing data!"
    log_warn "Namespace: $NAMESPACE"
    log_warn "Backup: $(basename $BACKUP_FILE)"

    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

# Restore MongoDB
restore_mongodb() {
    log_info "Starting MongoDB restore..."

    MONGO_POD=$(kubectl get pods -n $NAMESPACE -l app=mongodb -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$MONGO_POD" ]; then
        log_error "MongoDB pod not found"
        return 1
    fi

    if [ ! -d "$EXTRACT_DIR/mongodb" ]; then
        log_warn "MongoDB backup not found in archive"
        return 1
    fi

    log_info "Found MongoDB pod: $MONGO_POD"

    # Copy backup to pod
    kubectl cp "$EXTRACT_DIR/mongodb" -n $NAMESPACE $MONGO_POD:/tmp/mongodb-backup

    # Restore with mongorestore
    kubectl exec -n $NAMESPACE $MONGO_POD -- mongorestore \
        --gzip \
        --drop \
        /tmp/mongodb-backup

    # Cleanup
    kubectl exec -n $NAMESPACE $MONGO_POD -- rm -rf /tmp/mongodb-backup

    log_info "MongoDB restore completed"
}

# Restore Redis
restore_redis() {
    log_info "Starting Redis restore..."

    REDIS_POD=$(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$REDIS_POD" ]; then
        log_error "Redis pod not found"
        return 1
    fi

    if [ ! -f "$EXTRACT_DIR/redis-dump.rdb" ]; then
        log_warn "Redis backup not found in archive"
        return 1
    fi

    log_info "Found Redis pod: $REDIS_POD"

    # Stop Redis (save current state)
    kubectl exec -n $NAMESPACE $REDIS_POD -- redis-cli SHUTDOWN SAVE || true

    # Wait for Redis to stop
    sleep 5

    # Copy RDB file to pod
    kubectl cp "$EXTRACT_DIR/redis-dump.rdb" -n $NAMESPACE $REDIS_POD:/data/dump.rdb

    # Restart Redis pod to load new data
    kubectl delete pod -n $NAMESPACE $REDIS_POD

    # Wait for pod to restart
    log_info "Waiting for Redis pod to restart..."
    kubectl wait --for=condition=ready pod -n $NAMESPACE -l app=redis --timeout=120s

    log_info "Redis restore completed"
}

# Restore uploads
restore_uploads() {
    log_info "Starting uploads restore..."

    SERVER_POD=$(kubectl get pods -n $NAMESPACE -l app=server -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$SERVER_POD" ]; then
        log_error "Server pod not found"
        return 1
    fi

    if [ ! -f "$EXTRACT_DIR/uploads.tar.gz" ]; then
        log_warn "Uploads backup not found in archive"
        return 1
    fi

    log_info "Found server pod: $SERVER_POD"

    # Copy archive to pod
    kubectl cp "$EXTRACT_DIR/uploads.tar.gz" -n $NAMESPACE $SERVER_POD:/tmp/uploads-backup.tar.gz

    # Backup existing uploads (just in case)
    kubectl exec -n $NAMESPACE $SERVER_POD -- sh -c \
        'if [ -d /app/uploads ]; then mv /app/uploads /app/uploads.bak; fi' || true

    # Extract uploads
    kubectl exec -n $NAMESPACE $SERVER_POD -- tar -xzf /tmp/uploads-backup.tar.gz -C /app

    # Cleanup
    kubectl exec -n $NAMESPACE $SERVER_POD -- rm -f /tmp/uploads-backup.tar.gz

    log_info "Uploads restore completed"
}

# Cleanup extracted files
cleanup() {
    if [ -d "$EXTRACT_DIR" ]; then
        log_info "Cleaning up extracted files..."
        rm -rf "$EXTRACT_DIR"
    fi
}

# Main execution
main() {
    log_info "===== TEPS Lab Restore Script ====="
    log_info "Starting restore process..."

    check_prerequisites
    download_backup
    extract_backup
    show_metadata
    confirm_restore

    # Perform restore
    restore_mongodb || log_warn "MongoDB restore failed"
    restore_redis || log_warn "Redis restore failed"
    restore_uploads || log_warn "Uploads restore failed"

    cleanup

    log_info "===== Restore completed successfully ====="
    log_info "Please verify that all services are working correctly"
}

# Run main function
main
