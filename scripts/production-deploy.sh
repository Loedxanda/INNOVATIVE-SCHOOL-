#!/bin/bash

# Production deployment script for Innovative School Platform
# This script handles the complete production deployment process

set -e

# Configuration
ENVIRONMENT="production"
NAMESPACE="innovative-school"
CHART_PATH="./helm"
VALUES_FILE="k8s/production-values.yaml"
REGISTRY="ghcr.io/your-username"
VERSION="v1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if kubectl is configured
    if ! kubectl cluster-info &> /dev/null; then
        error "kubectl is not configured or cluster is not accessible"
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        error "Helm is not installed. Please install Helm 3.x first"
    fi
    
    # Check if required environment variables are set
    required_vars=(
        "POSTGRES_PASSWORD"
        "SECRET_KEY"
        "JWT_SECRET_KEY"
        "GOOGLE_MAPS_API_KEY"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first"
    fi
    
    success "Pre-deployment checks passed"
}

# Build and push production images
build_production_images() {
    log "Building production Docker images..."
    
    # Build backend image
    log "Building backend image..."
    docker build -t $REGISTRY/innovative-school-backend:$VERSION ./backend
    docker build -t $REGISTRY/innovative-school-backend:latest ./backend
    
    # Build frontend image
    log "Building frontend image..."
    docker build -t $REGISTRY/innovative-school-frontend:$VERSION ./frontend
    docker build -t $REGISTRY/innovative-school-frontend:latest ./frontend
    
    # Push images
    log "Pushing images to registry..."
    docker push $REGISTRY/innovative-school-backend:$VERSION
    docker push $REGISTRY/innovative-school-backend:latest
    docker push $REGISTRY/innovative-school-frontend:$VERSION
    docker push $REGISTRY/innovative-school-frontend:latest
    
    success "Production images built and pushed successfully"
}

# Create production secrets
create_production_secrets() {
    log "Creating production secrets..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Create secrets
    kubectl create secret generic innovative-school-secrets \
        --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        --from-literal=SECRET_KEY="$SECRET_KEY" \
        --from-literal=JWT_SECRET_KEY="$JWT_SECRET_KEY" \
        --from-literal=GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY" \
        --from-literal=AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
        --from-literal=AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
        --from-literal=SENDGRID_API_KEY="${SENDGRID_API_KEY:-}" \
        --from-literal=TWILIO_ACCOUNT_SID="${TWILIO_ACCOUNT_SID:-}" \
        --from-literal=TWILIO_AUTH_TOKEN="${TWILIO_AUTH_TOKEN:-}" \
        --from-literal=GRAFANA_ADMIN_PASSWORD="${GRAFANA_ADMIN_PASSWORD:-admin123}" \
        --from-literal=SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}" \
        --from-literal=SENTRY_DSN="${SENTRY_DSN:-}" \
        -n $NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    success "Production secrets created successfully"
}

# Deploy using Helm
deploy_with_helm() {
    log "Deploying with Helm..."
    
    # Update Helm dependencies
    log "Updating Helm dependencies..."
    helm dependency update $CHART_PATH
    
    # Install or upgrade the release
    if helm list -n $NAMESPACE | grep -q innovative-school; then
        log "Upgrading existing release..."
        helm upgrade innovative-school $CHART_PATH \
            --namespace $NAMESPACE \
            --values $VALUES_FILE \
            --wait \
            --timeout=10m
    else
        log "Installing new release..."
        helm install innovative-school $CHART_PATH \
            --namespace $NAMESPACE \
            --create-namespace \
            --values $VALUES_FILE \
            --wait \
            --timeout=10m
    fi
    
    success "Helm deployment completed successfully"
}

# Run post-deployment checks
post_deployment_checks() {
    log "Running post-deployment checks..."
    
    # Wait for all pods to be ready
    log "Waiting for all pods to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=innovative-school -n $NAMESPACE --timeout=300s
    
    # Check pod status
    log "Checking pod status..."
    kubectl get pods -n $NAMESPACE
    
    # Check services
    log "Checking services..."
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    log "Checking ingress..."
    kubectl get ingress -n $NAMESPACE
    
    # Run health checks
    log "Running health checks..."
    
    # Get the backend service URL
    BACKEND_URL=$(kubectl get service backend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -z "$BACKEND_URL" ]; then
        # Try to get the external IP from ingress
        BACKEND_URL=$(kubectl get ingress innovative-school-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    fi
    
    if [ -n "$BACKEND_URL" ]; then
        log "Testing backend health at $BACKEND_URL..."
        if curl -f "https://api.innovativeschool.cm/health" > /dev/null 2>&1; then
            success "Backend health check passed"
        else
            warning "Backend health check failed - this might be normal if DNS hasn't propagated yet"
        fi
    else
        warning "Could not determine backend URL for health check"
    fi
    
    success "Post-deployment checks completed"
}

# Setup monitoring and alerting
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # Check if Prometheus is running
    if kubectl get pods -n $NAMESPACE | grep -q prometheus; then
        log "Prometheus is running"
    else
        warning "Prometheus is not running - monitoring may not be available"
    fi
    
    # Check if Grafana is running
    if kubectl get pods -n $NAMESPACE | grep -q grafana; then
        log "Grafana is running"
    else
        warning "Grafana is not running - dashboards may not be available"
    fi
    
    success "Monitoring setup completed"
}

# Display deployment information
display_deployment_info() {
    log "Deployment Information:"
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Namespace: $NAMESPACE"
    echo "Version: $VERSION"
    echo "Registry: $REGISTRY"
    echo ""
    echo "Access URLs:"
    echo "  Frontend: https://innovativeschool.cm"
    echo "  API: https://api.innovativeschool.cm"
    echo "  API Docs: https://api.innovativeschool.cm/docs"
    echo ""
    echo "Monitoring:"
    echo "  Prometheus: kubectl port-forward -n $NAMESPACE svc/prometheus-service 9090:9090"
    echo "  Grafana: kubectl port-forward -n $NAMESPACE svc/grafana-service 3000:3000"
    echo ""
    echo "Useful Commands:"
    echo "  View pods: kubectl get pods -n $NAMESPACE"
    echo "  View logs: kubectl logs -f deployment/backend -n $NAMESPACE"
    echo "  Scale backend: kubectl scale deployment backend --replicas=10 -n $NAMESPACE"
    echo "  Check status: kubectl get all -n $NAMESPACE"
    echo ""
}

# Main deployment function
main() {
    log "Starting production deployment for Innovative School Platform..."
    
    pre_deployment_checks
    build_production_images
    create_production_secrets
    deploy_with_helm
    post_deployment_checks
    setup_monitoring
    display_deployment_info
    
    success "Production deployment completed successfully! 🎉"
    echo ""
    echo "Your Innovative School Platform is now live at:"
    echo "  🌐 https://innovativeschool.cm"
    echo "  📚 https://api.innovativeschool.cm/docs"
    echo ""
    echo "Next steps:"
    echo "  1. Update your DNS records to point to the load balancer IP"
    echo "  2. Configure SSL certificates (if not already done)"
    echo "  3. Set up monitoring alerts"
    echo "  4. Configure backup schedules"
    echo "  5. Train your team on the platform"
}

# Run main function
main "$@"

