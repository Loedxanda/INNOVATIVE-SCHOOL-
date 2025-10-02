# Installation Guide - Innovative School Platform MVP

This guide provides step-by-step instructions for installing and setting up the Innovative School Platform MVP on various operating systems.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Methods](#installation-methods)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

## Prerequisites

### Required Software

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git** (v2.30 or higher)

### Optional Software

- **PostgreSQL** (v13 or higher) - if not using Docker
- **Redis** (v6 or higher) - if not using Docker
- **Nginx** (v1.18 or higher) - for production

## System Requirements

### Minimum Requirements

- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 20 GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+

### Recommended Requirements

- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB free space
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+

## Installation Methods

### Method 1: Docker Installation (Recommended)

This is the easiest and most reliable installation method.

#### Step 1: Install Docker

**Windows:**
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Run the installer and follow the setup wizard
3. Restart your computer when prompted
4. Verify installation: `docker --version`

**macOS:**
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Drag Docker.app to Applications folder
3. Launch Docker Desktop
4. Verify installation: `docker --version`

**Ubuntu/Linux:**
```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
```

#### Step 2: Clone the Repository

```bash
git clone https://github.com/your-org/innovative-school-platform.git
cd innovative-school-platform
```

#### Step 3: Environment Configuration

Create environment files:

```bash
# Copy example environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Edit the `.env` files with your configuration:

**Main .env file:**
```env
# Database Configuration
POSTGRES_DB=innovative_school
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Innovative School Platform

# Security
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Email Configuration (Optional)
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=your_s3_bucket_name
S3_REGION=us-east-1

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Frontend .env file:**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_ENVIRONMENT=development
```

**Backend .env file:**
```env
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/innovative_school
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
```

#### Step 4: Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

#### Step 5: Initialize Database

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed initial data (optional)
docker-compose exec backend python scripts/seed_data.py
```

### Method 2: Manual Installation

If you prefer to install components manually without Docker.

#### Step 1: Install Node.js

**Windows:**
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation: `node --version` and `npm --version`

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Ubuntu/Linux:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 2: Install Python

**Windows:**
1. Download Python from [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Run the installer and check "Add Python to PATH"
3. Verify installation: `python --version`

**macOS:**
```bash
# Using Homebrew
brew install python

# Or download from python.org
```

**Ubuntu/Linux:**
```bash
# Install Python 3.8+
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Verify installation
python3 --version
pip3 --version
```

#### Step 3: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb innovative_school
```

**Ubuntu/Linux:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE innovative_school;
CREATE USER school_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE innovative_school TO school_user;
\q
```

#### Step 4: Install Redis

**Windows:**
1. Download Redis from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. Extract and run redis-server.exe

**macOS:**
```bash
# Using Homebrew
brew install redis
brew services start redis
```

**Ubuntu/Linux:**
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Step 5: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://school_user:your_password@localhost:5432/innovative_school"
export REDIS_URL="redis://localhost:6379/0"
export SECRET_KEY="your_secret_key_here"
export JWT_SECRET_KEY="your_jwt_secret_key_here"

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 6: Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set environment variables
export REACT_APP_API_URL="http://localhost:8000"
export REACT_APP_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Start frontend server
npm start
```

## Configuration

### Database Configuration

The application uses PostgreSQL with the following default settings:

- **Database Name**: `innovative_school`
- **Username**: `postgres` (Docker) or `school_user` (Manual)
- **Password**: Set in environment variables
- **Host**: `localhost` (Manual) or `postgres` (Docker)
- **Port**: `5432`

### Redis Configuration

Redis is used for caching and session management:

- **Host**: `localhost` (Manual) or `redis` (Docker)
- **Port**: `6379`
- **Password**: Set in environment variables (optional)

### API Configuration

The backend API runs on port 8000 by default:

- **Base URL**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### Frontend Configuration

The frontend runs on port 3000 by default:

- **URL**: `http://localhost:3000`
- **API Integration**: Configured via `REACT_APP_API_URL`

## Database Setup

### Initial Migration

```bash
# Using Docker
docker-compose exec backend alembic upgrade head

# Using Manual Installation
cd backend
alembic upgrade head
```

### Seed Data (Optional)

```bash
# Using Docker
docker-compose exec backend python scripts/seed_data.py

# Using Manual Installation
cd backend
python scripts/seed_data.py
```

### Create Admin User

```bash
# Using Docker
docker-compose exec backend python scripts/create_admin.py

# Using Manual Installation
cd backend
python scripts/create_admin.py
```

## Running the Application

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Using Manual Installation

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Redis (if not running as service):**
```bash
redis-server
```

## Verification

### Check Service Status

**Docker:**
```bash
docker-compose ps
```

**Manual:**
```bash
# Check PostgreSQL
psql -h localhost -U postgres -d innovative_school -c "SELECT version();"

# Check Redis
redis-cli ping

# Check Backend API
curl http://localhost:8000/health

# Check Frontend
curl http://localhost:3000
```

### Test Application

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Register Account**: Create a new user account
3. **Login**: Use your credentials to log in
4. **Test Features**: Navigate through different sections
5. **API Documentation**: Visit `http://localhost:8000/docs`

### Run Tests

```bash
# Run all tests
./scripts/run_tests.sh  # Unix/Linux/macOS
scripts\run_tests.bat   # Windows

# Run specific test suites
npm test                # Frontend tests
pytest                  # Backend tests
npm run cypress:run     # E2E tests
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### 2. Database Connection Failed

**Error**: `could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

#### 3. Redis Connection Failed

**Error**: `Connection refused`

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server  # Manual
brew services start redis  # macOS
sudo systemctl start redis-server  # Linux
```

#### 4. Docker Build Failed

**Error**: `Build failed`

**Solution**:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 5. Frontend Build Failed

**Error**: `Module not found`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Logs and Debugging

**Docker Logs**:
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

**Manual Logs**:
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs
# Check browser console and terminal output
```

### Performance Issues

**Database Performance**:
```bash
# Check database connections
docker-compose exec postgres psql -U postgres -d innovative_school -c "SELECT * FROM pg_stat_activity;"

# Check slow queries
docker-compose exec postgres psql -U postgres -d innovative_school -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

**Memory Usage**:
```bash
# Check Docker container memory
docker stats

# Check system memory
free -h  # Linux
vm_stat  # macOS
```

## Production Deployment

### Environment Setup

1. **Use Production Environment Variables**:
   - Set `NODE_ENV=production`
   - Use strong passwords and secrets
   - Configure proper CORS settings
   - Set up SSL certificates

2. **Database Configuration**:
   - Use a managed PostgreSQL service
   - Configure connection pooling
   - Set up automated backups
   - Enable monitoring

3. **Redis Configuration**:
   - Use a managed Redis service
   - Configure persistence
   - Set up monitoring
   - Configure memory limits

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production

```bash
# Build frontend for production
cd frontend
npm run build

# Serve with Nginx
sudo cp nginx.conf /etc/nginx/sites-available/innovative-school
sudo ln -s /etc/nginx/sites-available/innovative-school /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Run backend with Gunicorn
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Monitoring and Maintenance

1. **Set up monitoring**:
   - Application performance monitoring
   - Database monitoring
   - Server monitoring
   - Log aggregation

2. **Regular maintenance**:
   - Database backups
   - Security updates
   - Performance optimization
   - Log rotation

3. **Scaling**:
   - Horizontal scaling with load balancers
   - Database read replicas
   - CDN for static assets
   - Caching strategies

## Support

### Getting Help

- **Documentation**: Check the `/docs` directory
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact support at support@innovativeschool.cm

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Quick Start Summary

For a quick start, use Docker:

```bash
# 1. Clone repository
git clone https://github.com/your-org/innovative-school-platform.git
cd innovative-school-platform

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start services
docker-compose up -d

# 4. Initialize database
docker-compose exec backend alembic upgrade head

# 5. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

The application should now be running and accessible at `http://localhost:3000`!

