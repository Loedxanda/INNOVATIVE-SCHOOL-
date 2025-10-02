@echo off
REM Innovative School Platform - Local Deployment Script
REM This script helps deploy the application on your local PC

echo ========================================
echo Innovative School Platform - Local Deployment
echo ========================================
echo.

REM Check if Docker is installed
echo Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop and make sure it's running
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker is installed correctly
echo.

REM Check if Docker Compose is installed
echo Checking Docker Compose installation...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed or not in PATH
    echo Please install Docker Desktop which includes Docker Compose
    pause
    exit /b 1
)

echo Docker Compose is installed correctly
echo.

REM Check if environment files exist, create if they don't
echo Checking environment files...
if not exist .env (
    echo Creating main environment file...
    copy env.example .env >nul
)

if not exist frontend\.env (
    echo Creating frontend environment file...
    copy frontend\env.example frontend\.env >nul
)

if not exist backend\.env (
    echo Creating backend environment file...
    copy backend\env.example backend\.env >nul
)

echo Environment files are ready
echo.

REM Build Docker images
echo Building Docker images (this may take several minutes)...
echo This process will download and build all required images
echo Please be patient...
docker-compose build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Docker images
    echo Check the error messages above
    pause
    exit /b 1
)

echo Docker images built successfully
echo.

REM Start services
echo Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services
    echo Check the error messages above
    pause
    exit /b 1
)

echo Services started successfully
echo.

REM Wait for services to initialize
echo Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

REM Initialize database
echo Initializing database...
docker-compose exec backend alembic upgrade head
if %errorlevel% neq 0 (
    echo WARNING: Database initialization may have failed
    echo You may need to run this command manually later
    echo docker-compose exec backend alembic upgrade head
)

echo Database initialized
echo.

REM Create admin user
echo Creating admin user...
docker-compose exec backend python create_admin.py
if %errorlevel% neq 0 (
    echo WARNING: Failed to create admin user
    echo You may need to run this command manually later
    echo docker-compose exec backend python create_admin.py
)

echo Admin user creation attempted
echo.

REM Show status
echo Checking service status...
docker-compose ps

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo You can now access the application at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo AI Service: http://localhost:8001
echo.
echo Default admin credentials:
echo Email: admin@school.cm
echo Password: admin123
echo.
echo To stop the application, run:
echo docker-compose down
echo.
echo For troubleshooting, check the logs with:
echo docker-compose logs [service_name]
echo.
echo Press any key to exit...
pause >nul