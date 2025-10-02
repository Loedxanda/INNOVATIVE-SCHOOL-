# Troubleshooting Guide for Innovative School Platform

This guide will help you resolve common issues when deploying the Innovative School Platform on your local PC.

## Common Issues and Solutions

### 1. Services Not Starting

**Problem**: The application services are not accessible at the expected URLs.

**Solution**:
1. Ensure Docker Desktop is running
2. Check if the deployment completed successfully:
   ```cmd
   docker-compose ps
   ```
3. If no services are running, start them:
   ```cmd
   docker-compose up -d
   ```
4. Wait 30-60 seconds for services to initialize

### 2. Docker Build Failures

**Problem**: The deployment script fails during the Docker build process.

**Solution**:
1. Check your internet connection (images need to be downloaded)
2. Ensure you have at least 20GB free disk space
3. Increase Docker Desktop resources:
   - Open Docker Desktop
   - Go to Settings > Resources
   - Increase memory to at least 4GB
   - Increase disk image size if needed
4. Try building services individually:
   ```cmd
   docker-compose build postgres
   docker-compose build redis
   docker-compose build backend
   docker-compose build pedagogic-ai
   docker-compose build frontend
   ```

### 3. Port Conflicts

**Problem**: Error messages about ports being in use.

**Solution**:
1. Check what's using the required ports:
   ```cmd
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   netstat -ano | findstr :8001
   netstat -ano | findstr :5432
   netstat -ano | findstr :6379
   ```
2. Stop the conflicting processes or change ports in docker-compose.yml

### 4. Database Initialization Failures

**Problem**: Database migrations fail or admin user creation fails.

**Solution**:
1. Wait for database to fully start (can take 1-2 minutes):
   ```cmd
   docker-compose logs postgres
   ```
2. Manually run migrations:
   ```cmd
   docker-compose exec backend alembic upgrade head
   ```
3. Manually create admin user:
   ```cmd
   docker-compose exec backend python create_admin.py
   ```

### 5. Frontend Build Issues

**Problem**: Frontend fails to build or start.

**Solution**:
1. Check if package-lock.json exists in the root directory
2. Ensure Node.js is installed (not required for Docker deployment)
3. Try rebuilding just the frontend:
   ```cmd
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## Step-by-Step Deployment Process

### 1. Prerequisites Check

```cmd
docker --version
docker-compose --version
```

Both commands should return version information.

### 2. Environment Setup

```cmd
# Create environment files if they don't exist
copy env.example .env
copy frontend\env.example frontend\.env
copy backend\env.example backend\.env
```

### 3. Build Process

```cmd
# Build all images (may take 10-20 minutes first time)
docker-compose build
```

### 4. Start Services

```cmd
# Start all services in detached mode
docker-compose up -d
```

### 5. Verify Services

```cmd
# Check service status
docker-compose ps

# Check logs for any errors
docker-compose logs
```

### 6. Initialize Application

```cmd
# Wait 30 seconds, then initialize database
docker-compose exec backend alembic upgrade head

# Create admin user
docker-compose exec backend python create_admin.py
```

## Useful Commands

### Checking Status

```cmd
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Check Docker Compose services
docker-compose ps

# View resource usage
docker stats
```

### Viewing Logs

```cmd
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend

# View last 50 lines of logs
docker-compose logs --tail=50

# Follow logs in real-time
docker-compose logs -f
```

### Managing Services

```cmd
# Stop all services
docker-compose down

# Stop and remove data volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Rebuild and restart service
docker-compose up -d --build backend
```

## Advanced Troubleshooting

### Checking Docker Resources

If services are failing or running slowly:

1. Open Docker Desktop
2. Go to Troubleshoot > Resources
3. Ensure at least 4GB memory allocated
4. Ensure sufficient disk space

### Network Issues

If services can't communicate:

```cmd
# Check if services are on the same network
docker network ls

# Inspect network details
docker network inspect innovative-school_network
```

### Volume Issues

If database data seems corrupted:

```cmd
# Stop services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker volume prune

# Start fresh
docker-compose up -d
```

## Performance Optimization

### For Slow Builds

1. Use build cache:
   ```cmd
   docker-compose build --no-cache
   ```

2. Increase Docker resources in Docker Desktop settings

### For Slow Runtime Performance

1. Check resource usage:
   ```cmd
   docker stats
   ```

2. Increase allocated memory/CPUs in Docker Desktop

## Contact Support

If you continue to experience issues:

1. Check all logs for error messages:
   ```cmd
   docker-compose logs > full_logs.txt
   ```

2. Verify all prerequisites are met:
   - Docker Desktop running
   - Sufficient disk space (20GB+)
   - Sufficient memory (8GB+ system, 4GB+ for Docker)

3. Refer to documentation:
   - [PC_DEPLOYMENT_GUIDE.md](PC_DEPLOYMENT_GUIDE.md)
   - [README.md](README.md)

4. For critical issues, consider:
   - Restarting Docker Desktop
   - Restarting your computer
   - Reinstalling Docker Desktop