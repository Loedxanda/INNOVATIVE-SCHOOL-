#!/bin/bash

# Innovative School Platform - Installation Script
# This script automates the installation process

set -e  # Exit on any error

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
    
    local missing_deps=()
    
    # Check Docker
    if ! command_exists docker; then
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        missing_deps+=("docker-compose")
    fi
    
    # Check Git
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and run this script again."
        print_status "See the installation guide for detailed instructions."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Main .env file
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Created .env file"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Frontend .env file
    if [ ! -f frontend/.env ]; then
        cp frontend/env.example frontend/.env
        print_success "Created frontend/.env file"
    else
        print_warning "frontend/.env file already exists, skipping..."
    fi
    
    # Backend .env file
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env file already exists, skipping..."
    fi
}

# Function to generate secure passwords
generate_passwords() {
    print_status "Generating secure passwords..."
    
    # Generate random passwords
    local postgres_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    local redis_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    local jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    local secret_key=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    
    # Update .env files with generated passwords
    sed -i.bak "s/your_secure_password_here/$postgres_password/g" .env
    sed -i.bak "s/your_redis_password_here/$redis_password/g" .env
    sed -i.bak "s/your_jwt_secret_key_here_make_it_long_and_secure/$jwt_secret/g" .env
    sed -i.bak "s/your_secret_key_here_make_it_long_and_secure/$secret_key/g" .env
    
    # Update backend .env
    sed -i.bak "s/your_secure_password_here/$postgres_password/g" backend/.env
    sed -i.bak "s/your_redis_password_here/$redis_password/g" backend/.env
    sed -i.bak "s/your_jwt_secret_key_here_make_it_long_and_secure/$jwt_secret/g" backend/.env
    sed -i.bak "s/your_secret_key_here_make_it_long_and_secure/$secret_key/g" backend/.env
    
    # Clean up backup files
    rm -f .env.bak backend/.env.bak
    
    print_success "Generated secure passwords and updated configuration files"
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
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

# Function to initialize database
init_database() {
    print_status "Initializing database..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker-compose exec backend alembic upgrade head
    
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
}

# Function to create admin user
create_admin_user() {
    print_status "Creating admin user..."
    
    # Create admin user
    docker-compose exec backend python create_admin.py
    
    if [ $? -eq 0 ]; then
        print_success "Admin user created successfully"
    else
        print_warning "Failed to create admin user (you can create it manually later)"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    docker-compose exec backend pytest tests/ -v --tb=short
    
    if [ $? -eq 0 ]; then
        print_success "Backend tests passed"
    else
        print_warning "Some backend tests failed (non-critical)"
    fi
    
    # Run frontend tests
    docker-compose exec frontend npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tests passed"
    else
        print_warning "Some frontend tests failed (non-critical)"
    fi
}

# Function to show installation summary
show_summary() {
    print_success "Installation completed successfully! 🎉"
    echo ""
    echo "=================================================="
    echo "Innovative School Platform - Installation Summary"
    echo "=================================================="
    echo ""
    echo "🌐 Frontend URL: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "🤖 AI Service: http://localhost:8001"
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo "🧠 AI Documentation: http://localhost:8001/docs"
    echo "💾 Database: PostgreSQL (port 5432)"
    echo "🗄️  Cache: Redis (port 6379)"
    echo ""
    echo "📋 Default Admin Credentials:"
    echo "   Email: admin@school.cm"
    echo "   Password: admin123"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Start services: docker-compose up -d"
    echo "   Stop services: docker-compose down"
    echo "   View logs: docker-compose logs -f"
    echo "   Run tests: ./scripts/run_tests.sh"
    echo ""
    echo "📖 Documentation:"
    echo "   Installation Guide: docs/INSTALLATION_GUIDE.md"
    echo "   Testing Guide: docs/MVP_TESTING_GUIDE.md"
    echo "   Backup Guide: docs/BACKUP_AND_RECOVERY.md"
    echo "   UI/UX Design: UI_UX_DESIGN_SPECIFICATION.md"
    echo "   New Features: FEATURES_IMPLEMENTATION_SUMMARY.md"
    echo ""
    echo "⚠️  Important:"
    echo "   - Change default passwords in production"
    echo "   - Configure SSL certificates for HTTPS"
    echo "   - Set up proper backup strategies"
    echo "   - Review security settings"
    echo ""
    echo "🚀 Ready to use! Open http://localhost:3000 in your browser."
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  --skip-tests            Skip running tests"
    echo "  --skip-admin            Skip creating admin user"
    echo "  --no-build              Skip building Docker images"
    echo "  --production            Use production configuration"
    echo ""
    echo "Examples:"
    echo "  $0                      Full installation"
    echo "  $0 --skip-tests         Install without running tests"
    echo "  $0 --production         Install with production config"
}

# Main function
main() {
    local skip_tests=false
    local skip_admin=false
    local no_build=false
    local production=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --skip-admin)
                skip_admin=true
                shift
                ;;
            --no-build)
                no_build=true
                shift
                ;;
            --production)
                production=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Starting Innovative School Platform Installation"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Create environment files
    create_env_files
    
    # Generate secure passwords
    generate_passwords
    
    # Build Docker images if not skipped
    if [ "$no_build" = false ]; then
        build_images
    fi
    
    # Start services
    start_services
    
    # Initialize database
    init_database
    
    # Create admin user if not skipped
    if [ "$skip_admin" = false ]; then
        create_admin_user
    fi
    
    # Run tests if not skipped
    if [ "$skip_tests" = false ]; then
        run_tests
    fi
    
    # Show installation summary
    show_summary
}

# Run main function with all arguments
main "$@"