#!/bin/bash

###############################################################################
# TEPS Lab Deployment Script
# Deploys TEPS Lab to Kubernetes using kubectl or Helm
###############################################################################

set -e

# Configuration
NAMESPACE="${NAMESPACE:-tepslab}"
DEPLOY_METHOD="${DEPLOY_METHOD:-helm}" # kubectl or helm
ENVIRONMENT="${ENVIRONMENT:-production}" # production or staging

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --method METHOD      Deployment method: kubectl or helm (default: helm)"
    echo "  -e, --env ENVIRONMENT    Environment: production or staging (default: production)"
    echo "  -n, --namespace NAME     Kubernetes namespace (default: tepslab)"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --method helm --env production"
    echo "  $0 --method kubectl --env staging"
    echo ""
    exit 1
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -m|--method)
                DEPLOY_METHOD="$2"
                shift 2
                ;;
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -h|--help)
                usage
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
    done
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    if [ "$DEPLOY_METHOD" == "helm" ] && ! command -v helm &> /dev/null; then
        log_error "Helm is not installed"
        exit 1
    fi

    log_info "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    log_step "Creating namespace: $NAMESPACE"

    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_info "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f ../k8s/namespace.yaml
        log_info "Namespace created"
    fi
}

# Install cert-manager (if not installed)
install_cert_manager() {
    log_step "Checking cert-manager..."

    if kubectl get namespace cert-manager &> /dev/null; then
        log_info "cert-manager already installed"
    else
        log_info "Installing cert-manager..."
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

        log_info "Waiting for cert-manager to be ready..."
        kubectl wait --for=condition=ready pod -n cert-manager --all --timeout=300s

        log_info "cert-manager installed successfully"
    fi
}

# Deploy with kubectl
deploy_with_kubectl() {
    log_step "Deploying with kubectl..."

    cd "$(dirname "$0")/.."

    # Apply resources in order
    kubectl apply -f k8s/persistent-volumes.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/mongodb-deployment.yaml
    kubectl apply -f k8s/redis-deployment.yaml
    kubectl apply -f k8s/server-deployment.yaml
    kubectl apply -f k8s/client-deployment.yaml
    kubectl apply -f k8s/hpa.yaml
    kubectl apply -f k8s/cert-manager-issuer.yaml
    kubectl apply -f k8s/ingress.yaml

    log_info "Kubectl deployment completed"
}

# Deploy with Helm
deploy_with_helm() {
    log_step "Deploying with Helm..."

    cd "$(dirname "$0")/.."

    # Set values file based on environment
    VALUES_FILE="helm/tepslab/values.yaml"
    if [ "$ENVIRONMENT" == "staging" ]; then
        VALUES_FILE="helm/tepslab/values-staging.yaml"
    fi

    # Install or upgrade Helm release
    helm upgrade --install tepslab ./helm/tepslab \
        --namespace $NAMESPACE \
        --create-namespace \
        --values $VALUES_FILE \
        --wait \
        --timeout 10m

    log_info "Helm deployment completed"
}

# Wait for deployments
wait_for_deployments() {
    log_step "Waiting for deployments to be ready..."

    kubectl wait --for=condition=available deployment -n $NAMESPACE --all --timeout=600s

    log_info "All deployments are ready"
}

# Show deployment status
show_status() {
    log_step "Deployment Status:"
    echo ""

    kubectl get all -n $NAMESPACE

    echo ""
    log_info "To view logs:"
    echo "  kubectl logs -n $NAMESPACE -l app=server --tail=100 -f"
    echo ""
    log_info "To access the application:"
    echo "  kubectl port-forward -n $NAMESPACE svc/tepslab-client 8080:80"
    echo ""
}

# Main execution
main() {
    log_info "===== TEPS Lab Deployment Script ====="
    log_info "Environment: $ENVIRONMENT"
    log_info "Namespace: $NAMESPACE"
    log_info "Method: $DEPLOY_METHOD"
    echo ""

    parse_args "$@"
    check_prerequisites
    create_namespace
    install_cert_manager

    if [ "$DEPLOY_METHOD" == "helm" ]; then
        deploy_with_helm
    else
        deploy_with_kubectl
    fi

    wait_for_deployments
    show_status

    log_info "===== Deployment completed successfully ====="
}

# Run main function
main "$@"
