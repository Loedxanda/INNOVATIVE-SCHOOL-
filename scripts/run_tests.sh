#!/bin/bash

# MVP Testing Script for Innovative School Platform
# This script runs comprehensive tests for the MVP

set -e  # Exit on any error

echo "🚀 Starting MVP Testing for Innovative School Platform"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to start services
start_services() {
    print_status "Starting services with Docker Compose..."
    
    # Start all services
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
    
    print_success "All services are running"
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend tests..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    pip install -r requirements.txt
    
    # Run unit tests
    print_status "Running backend unit tests..."
    pytest tests/ -v --tb=short
    
    if [ $? -eq 0 ]; then
        print_success "Backend unit tests passed"
    else
        print_error "Backend unit tests failed"
        exit 1
    fi
    
    # Run integration tests
    print_status "Running backend integration tests..."
    pytest tests/test_api_integration.py -v --tb=short
    
    if [ $? -eq 0 ]; then
        print_success "Backend integration tests passed"
    else
        print_error "Backend integration tests failed"
        exit 1
    fi
    
    # Run performance tests
    print_status "Running backend performance tests..."
    pytest tests/test_performance.py -v --tb=short
    
    if [ $? -eq 0 ]; then
        print_success "Backend performance tests passed"
    else
        print_warning "Backend performance tests failed (non-critical)"
    fi
    
    cd ..
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Run unit tests
    print_status "Running frontend unit tests..."
    npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Frontend unit tests passed"
    else
        print_error "Frontend unit tests failed"
        exit 1
    fi
    
    # Run integration tests
    print_status "Running frontend integration tests..."
    npm run test:integration
    
    if [ $? -eq 0 ]; then
        print_success "Frontend integration tests passed"
    else
        print_warning "Frontend integration tests failed (non-critical)"
    fi
    
    cd ..
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    cd frontend
    
    # Run Cypress tests
    print_status "Running Cypress E2E tests..."
    npm run cypress:run
    
    if [ $? -eq 0 ]; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        exit 1
    fi
    
    cd ..
}

# Function to run security tests
run_security_tests() {
    print_status "Running security tests..."
    
    cd backend
    
    # Run security tests
    pytest tests/test_security.py -v --tb=short
    
    if [ $? -eq 0 ]; then
        print_success "Security tests passed"
    else
        print_error "Security tests failed"
        exit 1
    fi
    
    cd ..
}

# Function to run load tests
run_load_tests() {
    print_status "Running load tests..."
    
    cd frontend
    
    # Run load tests
    npm run test:load
    
    if [ $? -eq 0 ]; then
        print_success "Load tests passed"
    else
        print_warning "Load tests failed (non-critical)"
    fi
    
    cd ..
}

# Function to generate test reports
generate_reports() {
    print_status "Generating test reports..."
    
    # Create reports directory
    mkdir -p test-reports
    
    # Generate backend coverage report
    cd backend
    pytest --cov=. --cov-report=html --cov-report=xml
    cp htmlcov/index.html ../test-reports/backend-coverage.html
    cp coverage.xml ../test-reports/backend-coverage.xml
    cd ..
    
    # Generate frontend coverage report
    cd frontend
    npm run test:coverage
    cp coverage/lcov-report/index.html ../test-reports/frontend-coverage.html
    cd ..
    
    # Generate E2E test report
    if [ -d "frontend/cypress/reports" ]; then
        cp -r frontend/cypress/reports/* test-reports/
    fi
    
    print_success "Test reports generated in test-reports/ directory"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop services
    docker-compose down
    
    # Remove test data
    docker-compose down -v
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -b, --backend-only      Run only backend tests"
    echo "  -f, --frontend-only     Run only frontend tests"
    echo "  -e, --e2e-only          Run only E2E tests"
    echo "  -s, --security-only     Run only security tests"
    echo "  -l, --load-only         Run only load tests"
    echo "  -c, --coverage          Generate coverage reports"
    echo "  --no-cleanup            Skip cleanup after tests"
    echo "  --no-services           Skip starting services (assume already running)"
    echo ""
    echo "Examples:"
    echo "  $0                      Run all tests"
    echo "  $0 -b                   Run only backend tests"
    echo "  $0 -f -c                Run frontend tests with coverage"
    echo "  $0 -e --no-cleanup      Run E2E tests without cleanup"
}

# Main function
main() {
    local backend_only=false
    local frontend_only=false
    local e2e_only=false
    local security_only=false
    local load_only=false
    local generate_coverage=false
    local no_cleanup=false
    local no_services=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--backend-only)
                backend_only=true
                shift
                ;;
            -f|--frontend-only)
                frontend_only=true
                shift
                ;;
            -e|--e2e-only)
                e2e_only=true
                shift
                ;;
            -s|--security-only)
                security_only=true
                shift
                ;;
            -l|--load-only)
                load_only=true
                shift
                ;;
            -c|--coverage)
                generate_coverage=true
                shift
                ;;
            --no-cleanup)
                no_cleanup=true
                shift
                ;;
            --no-services)
                no_services=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Start services if not skipped
    if [ "$no_services" = false ]; then
        start_services
    fi
    
    # Run tests based on options
    if [ "$backend_only" = true ]; then
        run_backend_tests
    elif [ "$frontend_only" = true ]; then
        run_frontend_tests
    elif [ "$e2e_only" = true ]; then
        run_e2e_tests
    elif [ "$security_only" = true ]; then
        run_security_tests
    elif [ "$load_only" = true ]; then
        run_load_tests
    else
        # Run all tests
        run_backend_tests
        run_frontend_tests
        run_e2e_tests
        run_security_tests
        run_load_tests
    fi
    
    # Generate reports if requested
    if [ "$generate_coverage" = true ]; then
        generate_reports
    fi
    
    # Cleanup if not skipped
    if [ "$no_cleanup" = false ]; then
        cleanup
    fi
    
    print_success "All tests completed successfully! 🎉"
}

# Run main function with all arguments
main "$@"

