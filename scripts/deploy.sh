#!/bin/bash

# Deployment script for Innovative School Platform
# Usage: ./scripts/deploy.sh [environment] [action]
# Environment: staging, production
# Action: deploy, rollback, status

set -e

ENVIRONMENT=${1:-staging}
ACTION=${2:-deploy}
NAMESPACE="innovative-school"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if kubectl is installed and configured
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install kubectl first."
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        error "kubectl is not configured or cluster is not accessible."
    fi
    
    log "kubectl is configured and cluster is accessible"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v helm &> /dev/null; then
        warning "Helm is not installed. Some features may not be available."
    fi
    
    success "Dependencies check completed"
}

# Build and push Docker images
build_and_push_images() {
    log "Building and pushing Docker images..."
    
    # Get the current commit hash for tagging
    COMMIT_HASH=$(git rev-parse --short HEAD)
    REGISTRY="ghcr.io/your-username"
    
    # Build backend image
    log "Building backend image..."
    docker build -t $REGISTRY/innovative-school-backend:$COMMIT_HASH ./backend
    docker build -t $REGISTRY/innovative-school-backend:latest ./backend
    
    # Build frontend image
    log "Building frontend image..."
    docker build -t $REGISTRY/innovative-school-frontend:$COMMIT_HASH ./frontend
    docker build -t $REGISTRY/innovative-school-frontend:latest ./frontend
    
    # Push images
    log "Pushing images to registry..."
    docker push $REGISTRY/innovative-school-backend:$COMMIT_HASH
    docker push $REGISTRY/innovative-school-backend:latest
    docker push $REGISTRY/innovative-school-frontend:$COMMIT_HASH
    docker push $REGISTRY/innovative-school-frontend:latest
    
    success "Images built and pushed successfully"
}

# Deploy to Kubernetes
deploy_to_k8s() {
    log "Deploying to Kubernetes ($ENVIRONMENT environment)..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations in order
    log "Applying database configuration..."
    kubectl apply -f k8s/postgres.yaml -n $NAMESPACE
    
    log "Applying Redis configuration..."
    kubectl apply -f k8s/redis.yaml -n $NAMESPACE
    
    # Wait for database and Redis to be ready
    log "Waiting for database to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    
    log "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    log "Applying backend configuration..."
    kubectl apply -f k8s/backend.yaml -n $NAMESPACE
    
    log "Applying frontend configuration..."
    kubectl apply -f k8s/frontend.yaml -n $NAMESPACE
    
    log "Applying ingress configuration..."
    kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
    
    log "Applying monitoring configuration..."
    kubectl apply -f k8s/monitoring.yaml -n $NAMESPACE
    
    # Wait for deployments to be ready
    log "Waiting for backend to be ready..."
    kubectl wait --for=condition=available deployment/backend -n $NAMESPACE --timeout=300s
    
    log "Waiting for frontend to be ready..."
    kubectl wait --for=condition=available deployment/frontend -n $NAMESPACE --timeout=300s
    
    success "Deployment completed successfully"
}

# Check deployment status
check_status() {
    log "Checking deployment status..."
    
    echo -e "\n${BLUE}=== Namespace Status ===${NC}"
    kubectl get namespaces | grep $NAMESPACE
    
    echo -e "\n${BLUE}=== Pod Status ===${NC}"
    kubectl get pods -n $NAMESPACE
    
    echo -e "\n${BLUE}=== Service Status ===${NC}"
    kubectl get services -n $NAMESPACE
    
    echo -e "\n${BLUE}=== Ingress Status ===${NC}"
    kubectl get ingress -n $NAMESPACE
    
    echo -e "\n${BLUE}=== Deployment Status ===${NC}"
    kubectl get deployments -n $NAMESPACE
    
    # Check if all pods are running
    RUNNING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers | wc -l)
    TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)
    
    if [ "$RUNNING_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
        success "All pods are running successfully"
    else
        warning "Some pods are not running. Check the status above."
    fi
}

# Rollback deployment
rollback_deployment() {
    log "Rolling back deployment..."
    
    # Get the previous revision
    PREVIOUS_REVISION=$(kubectl rollout history deployment/backend -n $NAMESPACE --no-headers | tail -2 | head -1 | awk '{print $1}')
    
    if [ -z "$PREVIOUS_REVISION" ]; then
        error "No previous revision found for rollback"
    fi
    
    log "Rolling back to revision: $PREVIOUS_REVISION"
    kubectl rollout undo deployment/backend -n $NAMESPACE --to-revision=$PREVIOUS_REVISION
    kubectl rollout undo deployment/frontend -n $NAMESPACE --to-revision=$PREVIOUS_REVISION
    
    # Wait for rollback to complete
    kubectl rollout status deployment/backend -n $NAMESPACE
    kubectl rollout status deployment/frontend -n $NAMESPACE
    
    success "Rollback completed successfully"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    # Get the backend service URL
    BACKEND_URL=$(kubectl get service backend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -z "$BACKEND_URL" ]; then
        BACKEND_URL="localhost:8000"
    fi
    
    # Check backend health
    log "Checking backend health..."
    if curl -f "http://$BACKEND_URL/health" > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    log "Checking frontend..."
    FRONTEND_URL=$(kubectl get service frontend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -z "$FRONTEND_URL" ]; then
        FRONTEND_URL="localhost:80"
    fi
    
    if curl -f "http://$FRONTEND_URL" > /dev/null 2>&1; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
}

# Main execution
main() {
    log "Starting deployment process for $ENVIRONMENT environment..."
    
    check_kubectl
    check_dependencies
    
    case $ACTION in
        "deploy")
            build_and_push_images
            deploy_to_k8s
            run_health_checks
            check_status
            ;;
        "rollback")
            rollback_deployment
            check_status
            ;;
        "status")
            check_status
            ;;
        *)
            error "Invalid action. Use: deploy, rollback, or status"
            ;;
    esac
    
    success "Deployment process completed successfully!"
}

# Run main function
main "$@"

